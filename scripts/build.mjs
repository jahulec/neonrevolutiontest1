import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDocument } from '../src/layouts/document.mjs';
import { absoluteUrl, escapeHtml, routeOutputPath } from '../src/lib/html.mjs';
import { structuredDataForPage } from '../src/lib/seo.mjs';
import { renderContact } from '../src/pages/contact.mjs';
import { renderHome } from '../src/pages/home.mjs';
import { renderGallery } from '../src/pages/gallery.mjs';
import { renderLive } from '../src/pages/live.mjs';
import { renderMusic } from '../src/pages/music.mjs';
import { renderNews } from '../src/pages/news.mjs';
import { renderNewsArticle } from '../src/pages/news-article.mjs';
import { renderNotFound } from '../src/pages/not-found.mjs';
import { renderPress } from '../src/pages/press.mjs';
import { renderPrivacy } from '../src/pages/privacy.mjs';
import { renderVideo } from '../src/pages/video.mjs';
import { generateBrandImages, imageSavings, optimizeImages } from './optimize-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, 'dist');
const expectedDist = path.join(root, 'dist');
const basePath = (() => {
  const value = (process.env.BASE_PATH ?? '').trim();
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
})();

function applyBasePath(html) {
  if (!basePath) return html;
  return html
    .replace(/\b(href|src|data-release-cover|data-gallery-image)="\/(?!\/)/g, `$1="${basePath}/`)
    .replace(/\b(srcset|imagesrcset)="([^"]+)"/g, (_, attribute, value) => `${attribute}="${value.split(',').map((item) => item.trim().replace(/^\/(?!\/)/, `${basePath}/`)).join(', ')}"`);
}

function responsiveImages(html, manifest) {
  return html.replace(/<img\b([^>]*\bsrc="(\/assets\/[^"]+)"[^>]*)>/g, (tag, attributes, source) => {
    const data = manifest[source];
    if (!data) return tag;
    tag = tag.replace(/\swidth="\d+"/, '').replace(/\sheight="\d+"/, '').replace(/>$/, ` width="${data.width}" height="${data.height}">`);
    if (/\bsrcset=/.test(tag) || !data.variants?.length) return tag;
    const entries = [...data.variants, { width: data.width, path: source }];
    const srcset = entries.map((item) => `${item.path} ${item.width}w`).join(', ');
    const sizes = /hero-logo|brand|footer-logo/.test(attributes)
      ? '(max-width: 820px) 88vw, 430px'
      : /hero-bg__image/.test(attributes) ? '100vw'
        : '(max-width: 820px) 100vw, 50vw';
    return tag.replace(/>$/, ` srcset="${srcset}" sizes="${sizes}">`);
  });
}

function responsiveHeroPreload(html, manifest) {
  return html.replace(/<link rel="preload" data-hero-preload href="([^"]+)" as="image" fetchpriority="high">/g, (_, source) => {
    const data = manifest[source];
    if (!data?.variants?.length) return `<link rel="preload" href="${source}" as="image" fetchpriority="high">`;
    const entries = [...data.variants, { width: data.width, path: source }];
    const preferred = entries.find((item) => item.width >= 960) ?? entries.at(-1);
    return `<link rel="preload" href="${preferred.path}" as="image" imagesrcset="${entries.map((item) => `${item.path} ${item.width}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">`;
  });
}

function finalizeHtml(html, manifest) {
  return applyBasePath(responsiveHeroPreload(responsiveImages(html, manifest), manifest));
}

function visualStyles(site, manifest) {
  const hero = site.visuals?.heroBackground ?? '/assets/hero-band.webp';
  const heroData = manifest[hero];
  const heroVariants = heroData?.variants ?? [];
  const selectHero = (target) => (heroVariants.find((item) => item.width >= target) ?? heroVariants.at(-1))?.path ?? hero;
  const relativeUrl = (source) => source.replace(/^\/+/, '');
  const declarations = [
    `--hero-bg-mobile:url(${JSON.stringify(relativeUrl(selectHero(960)))});`,
    `--hero-bg-desktop:url(${JSON.stringify(relativeUrl(selectHero(1440)))});`,
    `--page-bg-desktop:url(${JSON.stringify(relativeUrl(site.visuals?.pageBackgroundDesktop ?? '/assets/velvet-signal-bg-tall.webp'))});`
  ];
  if (site.visuals?.pageBackgroundMobile) {
    declarations.push(`--page-bg-mobile:url(${JSON.stringify(relativeUrl(site.visuals.pageBackgroundMobile))});`);
  }
  return `\n:root{${declarations.join('')}}\n`;
}

function youtubePlayerUrl(url) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}

if (dist !== expectedDist || path.dirname(dist) !== root || path.basename(dist) !== 'dist') {
  throw new Error(`Refusing to clean unexpected output path: ${dist}`);
}

const readJson = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
const [site, routes, shows, releases, videos, news, gallery, press, pl, en, stylesheetSource, clientSource] = await Promise.all([
  readJson('src/data/site.json'), readJson('src/data/routes.json'), readJson('src/data/shows.json'),
  readJson('src/data/releases.json'), readJson('src/data/videos.json'), readJson('src/data/news.json'), readJson('src/data/gallery.json'), readJson('src/data/press.json'),
  readJson('src/i18n/pl.json'), readJson('src/i18n/en.json'),
  readFile(path.join(root, 'src/styles/site.css')), readFile(path.join(root, 'src/client/site.js'))
]);
const assetVersion = createHash('sha256').update(stylesheetSource).update(clientSource).update(JSON.stringify(site.visuals ?? {})).digest('hex').slice(0, 12);
const locales = { pl, en };
const renderers = { music: renderMusic, video: renderVideo, live: renderLive, news: renderNews, gallery: renderGallery, press: renderPress, contact: renderContact, privacy: renderPrivacy };

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true }),
  cp(path.join(root, 'src/client/site.js'), path.join(dist, 'site.js'))
]);
const imageManifest = await optimizeImages(path.join(root, 'assets'), path.join(dist, 'assets'));
await writeFile(path.join(dist, 'styles.css'), `${stylesheetSource.toString('utf8')}${visualStyles(site, imageManifest)}`, 'utf8');
const savings = await imageSavings(path.join(root, 'assets'), path.join(dist, 'assets'));
console.log(`Optimized source images: ${Math.round(savings.inputBytes / 1024)} KiB -> ${Math.round(savings.outputBytes / 1024)} KiB plus responsive variants.`);

await mkdir(path.join(dist, 'downloads'), { recursive: true });
await Promise.all([
  cp(path.join(root, 'output/pdf/neon-revolution-rider-techniczny.pdf'), path.join(dist, 'downloads/neon-revolution-rider-techniczny.pdf')),
  cp(path.join(root, 'output/press/neon-revolution-press-pack.zip'), path.join(dist, 'downloads/neon-revolution-press-pack.zip'))
]);

try {
  await cp(path.join(root, 'public'), dist, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await generateBrandImages(path.join(root, 'assets'), path.join(root, 'public'), dist);
await rm(path.join(dist, 'og.png'), { force: true });

const shared = { site, routes, shows, releases, videos, news, gallery, press, locales };
const socialShareImage = site.visuals?.socialShareImage || site.ogImage;
const routeImages = {
  home: socialShareImage,
  music: releases.find((item) => item.featured)?.cover ?? releases[0]?.cover,
  video: videos.find((item) => item.featured)?.thumbnail ?? videos[0]?.thumbnail,
  live: '/assets/neon-revolution-live.webp',
  news: news[0]?.image,
  gallery: gallery.find((item) => item.status === 'real')?.image,
  press: site.visuals?.heroBackground ?? '/assets/hero-band.webp',
  contact: socialShareImage,
  privacy: socialShareImage
};
for (const route of routes.filter((item) => item.enabled)) {
  for (const lang of ['pl', 'en']) {
    const locale = locales[lang];
    const homepage = route.id === 'home';
    const pageContext = { ...shared, locale, lang };
    const main = homepage ? renderHome(pageContext) : renderers[route.id](pageContext);
    const pageData = {
      ...locale.pages[route.id],
      image: routeImages[route.id],
      imageAlt: route.id === 'music' ? releases.find((item) => item.featured)?.title : site.brand,
      ...((route.id === 'privacy' && site.legal.status !== 'real') || (route.id === 'news' && !news.some((entry) => entry.status === 'real')) ? { robots: 'noindex,follow' } : {})
    };
    const structuredData = structuredDataForPage({ ...shared, locale, lang, routeId: route.id, path: route[lang], page: pageData });
    const html = finalizeHtml(renderDocument({ site, routes, locale, lang, routeId: route.id, homepage, main, pageData, assetVersion, structuredData }), imageManifest);
    const output = path.join(dist, routeOutputPath(route[lang]));
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
    console.log(`Built ${path.relative(root, output)}`);
  }
}

for (const entry of news) {
  const alternatePaths = { pl: `/aktualnosci/${entry.slug}/`, en: `/en/news/${entry.slug}/` };
  for (const lang of ['pl', 'en']) {
    const locale = locales[lang];
    const copy = entry[lang];
    const main = renderNewsArticle({ locale, lang, entry, routes });
    const pageData = { title: `${site.brand} — ${copy.title}`, description: copy.summary, image: entry.image, imageAlt: copy.title, publishedTime: entry.date, ...(entry.status !== 'real' ? { robots: 'noindex,follow' } : {}) };
    const structuredData = structuredDataForPage({ ...shared, locale, lang, routeId: 'news', path: alternatePaths[lang], page: pageData, newsEntry: entry });
    const html = finalizeHtml(renderDocument({ site, routes, locale, lang, routeId: 'news', main, bodyClass: 'news-article-page', pageData, alternatePaths, assetVersion, structuredData }), imageManifest);
    const output = path.join(dist, routeOutputPath(alternatePaths[lang]));
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
    console.log(`Built ${path.relative(root, output)}`);
  }
}

for (const lang of ['pl', 'en']) {
  const locale = locales[lang];
  const main = renderNotFound({ site, locale, homeHref: lang === 'pl' ? '/' : '/en/' });
  const html = finalizeHtml(renderDocument({ site, routes, locale, lang, routeId: 'notFound', homepage: false, main, bodyClass: 'error-page', assetVersion }), imageManifest);
  const output = path.join(dist, lang === 'pl' ? '404.html' : 'en/404.html');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html, 'utf8');
}

const robots = site.siteUrl
  ? `User-agent: *\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${absoluteUrl(site.siteUrl, '/sitemap.xml')}\n`
  : 'User-agent: *\nAllow: /\n';
await writeFile(path.join(dist, 'robots.txt'), robots, 'utf8');

if (site.siteUrl) {
  const routeUrls = routes.filter((route) => route.enabled)
    .filter((route) => !(route.id === 'privacy' && site.legal.status !== 'real'))
    .filter((route) => !(route.id === 'news' && !news.some((entry) => entry.status === 'real')))
    .flatMap((route) => ['pl', 'en'].map((lang) => ({
    loc: absoluteUrl(site.siteUrl, route[lang]),
    images: route.id === 'gallery'
      ? gallery.filter((item) => item.status === 'real' && item.image).map((item) => ({ loc: absoluteUrl(site.siteUrl, item.image), caption: item.alt?.[lang] }))
      : routeImages[route.id] ? [{ loc: absoluteUrl(site.siteUrl, routeImages[route.id]), caption: locales[lang].pages[route.id].heading ?? site.brand }] : [],
    videos: route.id === 'video' ? videos.map((video) => ({
      thumbnail: absoluteUrl(site.siteUrl, video.thumbnail),
      title: `${video.title} — ${site.brand}`,
      description: locales[lang].pages.video.description,
      player: youtubePlayerUrl(video.youtube),
      date: video.date
    })).filter((video) => video.player) : []
  })));
  const newsUrls = news.filter((entry) => entry.status === 'real').flatMap((entry) => ['pl', 'en'].map((lang) => ({
    loc: absoluteUrl(site.siteUrl, lang === 'pl' ? `/aktualnosci/${entry.slug}/` : `/en/news/${entry.slug}/`),
    lastmod: entry.date,
    images: [{ loc: absoluteUrl(site.siteUrl, entry.image), caption: entry[lang].title }],
    videos: []
  })));
  const urls = [...routeUrls, ...newsUrls];
  const sitemapEntries = urls.map(({ loc, lastmod, images, videos: pageVideos = [] }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : ''}${images.map((image) => `<image:image><image:loc>${escapeHtml(image.loc)}</image:loc>${image.caption ? `<image:caption>${escapeHtml(image.caption)}</image:caption>` : ''}</image:image>`).join('')}${pageVideos.map((video) => `<video:video><video:thumbnail_loc>${escapeHtml(video.thumbnail)}</video:thumbnail_loc><video:title>${escapeHtml(video.title)}</video:title><video:description>${escapeHtml(video.description)}</video:description><video:player_loc>${escapeHtml(video.player)}</video:player_loc><video:publication_date>${escapeHtml(video.date)}</video:publication_date><video:family_friendly>yes</video:family_friendly></video:video>`).join('')}</url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${sitemapEntries}\n</urlset>\n`;
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
} else {
  console.warn('Note: canonical URLs, sitemap and absolute Open Graph URLs remain disabled until siteUrl is configured.');
}

const realNews = news.filter((entry) => entry.status === 'real');
const latestDataDate = [
  ...realNews.map((entry) => entry.date),
  ...videos.map((video) => video.date),
  ...releases.map((release) => release.date).filter(Boolean),
  ...(press.coverage ?? []).map((item) => item.date)
].sort().at(-1) ?? '2026-08-14';
const bandData = {
  name: site.brand,
  alternateNames: site.entity?.alternateNames ?? [],
  description: press.bio.pl,
  descriptionEnglish: press.bio.en,
  genres: site.entity?.genres ?? [],
  origin: site.entity?.origin,
  officialWebsite: site.siteUrl,
  profiles: { ...site.profiles, appleMusic: site.entity?.additionalProfiles?.[0] },
  members: press.members,
  releases: releases.map(({ id, title, date, year, links }) => ({ id, title, date: date || year, links })),
  achievements: press.achievements,
  mediaCoverage: press.coverage ?? [],
  contact: { email: site.contact.email, phone: site.contact.phone, messenger: site.contact.messenger },
  updated: latestDataDate
};
await writeFile(path.join(dist, 'band.json'), `${JSON.stringify(bandData, null, 2)}\n`, 'utf8');

const llms = `# ${site.brand}\n\n> Oficjalna strona polskiego zespołu rockowego i synth-popowego z Knurowa. Neon Revolution łączy klimat lat 80., gitary, taneczne rytmy i syntezatory.\n\n## Oficjalne zasoby\n\n- [Strona główna](${absoluteUrl(site.siteUrl, '/')})\n- [Opis, skład, osiągnięcia i źródła](${absoluteUrl(site.siteUrl, '/press/')})\n- [Muzyka](${absoluteUrl(site.siteUrl, '/muzyka/')})\n- [Koncerty](${absoluteUrl(site.siteUrl, '/koncerty/')})\n- [Aktualności](${absoluteUrl(site.siteUrl, '/aktualnosci/')})\n- [Galeria](${absoluteUrl(site.siteUrl, '/galeria/')})\n- [Wideo](${absoluteUrl(site.siteUrl, '/wideo/')})\n- [Dane zespołu JSON](${absoluteUrl(site.siteUrl, '/band.json')})\n- [Pełny kontekst tekstowy](${absoluteUrl(site.siteUrl, '/llms-full.txt')})\n\n## Profile oficjalne\n\n${[...Object.entries(site.profiles), ['appleMusic', site.entity?.additionalProfiles?.[0]]].filter(([, url]) => url).map(([name, url]) => `- ${name}: ${url}`).join('\n')}\n`;
const llmsFull = `# ${site.brand}\n\n${press.bio.pl}\n\n## Pochodzenie i styl\n\n${site.entity.origin.city}, Polska. Gatunki i określenia: ${site.entity.genres.join(', ')}.\n\n## Aktualny skład\n\n${press.members.map((member) => `- ${member.name} — ${member.role.pl}`).join('\n')}\n\n## Wydawnictwa\n\n${releases.map((release) => `- ${release.title}${release.date || release.year ? ` (${release.date || release.year})` : ''}: Spotify ${release.links.spotify}; YouTube ${release.links.youtube}${release.links.appleMusic ? `; Apple Music ${release.links.appleMusic}` : ''}`).join('\n')}\n\n## Osiągnięcia\n\n${press.achievements.map((item) => `- ${item.year}: ${item.title.pl}. ${item.description.pl}`).join('\n')}\n\n## Niezależne publikacje\n\n${(press.coverage ?? []).map((item) => `- ${item.publisher}, ${item.date}: ${item.title.pl} — ${item.url}`).join('\n')}\n\n## Kontakt oficjalny\n\nE-mail: ${site.contact.email}\nTelefon: ${site.contact.phone}\nMessenger: ${site.contact.messenger}\n\nŹródło kanoniczne: ${site.siteUrl}\n`;
await Promise.all([
  writeFile(path.join(dist, 'llms.txt'), llms, 'utf8'),
  writeFile(path.join(dist, 'llms-full.txt'), llmsFull, 'utf8'),
  writeFile(path.join(dist, 'humans.txt'), `${site.brand}\nOficjalna strona zespołu.\nKontakt: ${site.contact.email}\n`, 'utf8'),
  writeFile(path.join(dist, 'site.webmanifest'), JSON.stringify({ name: site.brand, short_name: site.brand, start_url: `${basePath || ''}/`, display: 'standalone', background_color: '#020308', theme_color: site.themeColor, icons: [{ src: `${basePath || ''}/assets/icon-192.webp`, sizes: '192x192', type: 'image/webp' }, { src: `${basePath || ''}/assets/icon-512.webp`, sizes: '512x512', type: 'image/webp' }] }, null, 2), 'utf8')
]);
await mkdir(path.join(dist, '.well-known'), { recursive: true });
await writeFile(path.join(dist, '.well-known/security.txt'), `Contact: mailto:${site.contact.email}\nCanonical: ${absoluteUrl(site.siteUrl, '/.well-known/security.txt')}\nExpires: 2027-08-14T00:00:00Z\nPreferred-Languages: pl, en\n`, 'utf8');

function atomFeed(lang) {
  const locale = locales[lang];
  const feedUrl = absoluteUrl(site.siteUrl, lang === 'pl' ? '/feed.xml' : '/en/feed.xml');
  const homeUrl = absoluteUrl(site.siteUrl, lang === 'pl' ? '/' : '/en/');
  const entries = realNews.map((entry) => {
    const url = absoluteUrl(site.siteUrl, lang === 'pl' ? `/aktualnosci/${entry.slug}/` : `/en/news/${entry.slug}/`);
    return `<entry><title>${escapeHtml(entry[lang].title)}</title><id>${escapeHtml(url)}</id><link href="${escapeHtml(url)}"/><updated>${entry.date}T12:00:00Z</updated><summary>${escapeHtml(entry[lang].summary)}</summary></entry>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}"><title>${escapeHtml(site.brand)} — ${escapeHtml(locale.nav.news)}</title><id>${escapeHtml(homeUrl)}</id><link href="${escapeHtml(feedUrl)}" rel="self"/><link href="${escapeHtml(homeUrl)}"/><updated>${realNews[0]?.date ?? latestDataDate}T12:00:00Z</updated>${entries}</feed>`;
}
await mkdir(path.join(dist, 'en'), { recursive: true });
await Promise.all([
  writeFile(path.join(dist, 'feed.xml'), atomFeed('pl'), 'utf8'),
  writeFile(path.join(dist, 'en/feed.xml'), atomFeed('en'), 'utf8')
]);

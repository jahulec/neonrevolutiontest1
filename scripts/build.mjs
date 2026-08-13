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
  return html.replace(/\b(href|src|data-release-cover|data-gallery-image)="\/(?!\/)/g, `$1="${basePath}/`);
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
const assetVersion = createHash('sha256').update(stylesheetSource).update(clientSource).digest('hex').slice(0, 12);
const locales = { pl, en };
const renderers = { music: renderMusic, video: renderVideo, live: renderLive, news: renderNews, gallery: renderGallery, press: renderPress, contact: renderContact, privacy: renderPrivacy };

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true }),
  cp(path.join(root, 'src/styles/site.css'), path.join(dist, 'styles.css')),
  cp(path.join(root, 'src/client/site.js'), path.join(dist, 'site.js'))
]);

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

const shared = { site, routes, shows, releases, videos, news, gallery, press, locales };
const routeImages = {
  home: '/og.png',
  music: releases.find((item) => item.featured)?.cover ?? releases[0]?.cover,
  video: videos.find((item) => item.featured)?.thumbnail ?? videos[0]?.thumbnail,
  live: '/assets/neon-revolution-live.webp',
  news: news[0]?.image,
  gallery: gallery.find((item) => item.status === 'real')?.image,
  press: '/assets/hero-band.webp',
  contact: '/og.png',
  privacy: '/og.png'
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
    const html = applyBasePath(renderDocument({ site, routes, locale, lang, routeId: route.id, homepage, main, pageData, assetVersion, structuredData }));
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
    const html = applyBasePath(renderDocument({ site, routes, locale, lang, routeId: 'news', main, bodyClass: 'news-article-page', pageData, alternatePaths, assetVersion, structuredData }));
    const output = path.join(dist, routeOutputPath(alternatePaths[lang]));
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
    console.log(`Built ${path.relative(root, output)}`);
  }
}

for (const lang of ['pl', 'en']) {
  const locale = locales[lang];
  const main = renderNotFound({ site, locale, homeHref: lang === 'pl' ? '/' : '/en/' });
  const html = applyBasePath(renderDocument({ site, routes, locale, lang, routeId: 'notFound', homepage: false, main, bodyClass: 'error-page', assetVersion }));
  const output = path.join(dist, lang === 'pl' ? '404.html' : 'en/404.html');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html, 'utf8');
}

const robots = site.siteUrl
  ? `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(site.siteUrl, '/sitemap.xml')}\n`
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
      : routeImages[route.id] ? [{ loc: absoluteUrl(site.siteUrl, routeImages[route.id]), caption: locales[lang].pages[route.id].heading ?? site.brand }] : []
  })));
  const newsUrls = news.filter((entry) => entry.status === 'real').flatMap((entry) => ['pl', 'en'].map((lang) => ({
    loc: absoluteUrl(site.siteUrl, lang === 'pl' ? `/aktualnosci/${entry.slug}/` : `/en/news/${entry.slug}/`),
    lastmod: entry.date,
    images: [{ loc: absoluteUrl(site.siteUrl, entry.image), caption: entry[lang].title }]
  })));
  const urls = [...routeUrls, ...newsUrls];
  const sitemapEntries = urls.map(({ loc, lastmod, images }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : ''}${images.map((image) => `<image:image><image:loc>${escapeHtml(image.loc)}</image:loc>${image.caption ? `<image:caption>${escapeHtml(image.caption)}</image:caption>` : ''}</image:image>`).join('')}</url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapEntries}\n</urlset>\n`;
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
} else {
  console.warn('Note: canonical URLs, sitemap and absolute Open Graph URLs remain disabled until siteUrl is configured.');
}

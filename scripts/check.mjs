import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml } from '../src/lib/html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const basePath = (() => {
  const value = (process.env.BASE_PATH ?? '').trim();
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
})();
const routes = JSON.parse(await readFile(path.join(root, 'src/data/routes.json'), 'utf8'));
const site = JSON.parse(await readFile(path.join(root, 'src/data/site.json'), 'utf8'));
const shows = JSON.parse(await readFile(path.join(root, 'src/data/shows.json'), 'utf8'));
const news = JSON.parse(await readFile(path.join(root, 'src/data/news.json'), 'utf8'));
const releases = JSON.parse(await readFile(path.join(root, 'src/data/releases.json'), 'utf8'));
const press = JSON.parse(await readFile(path.join(root, 'src/data/press.json'), 'utf8'));
const videos = JSON.parse(await readFile(path.join(root, 'src/data/videos.json'), 'utf8'));
const locales = {
  pl: JSON.parse(await readFile(path.join(root, 'src/i18n/pl.json'), 'utf8')),
  en: JSON.parse(await readFile(path.join(root, 'src/i18n/en.json'), 'utf8'))
};
const routePages = routes.filter((route) => route.enabled).flatMap((route) => ['pl', 'en'].map((lang) => ({
  lang,
  route,
  file: route[lang] === '/' ? 'index.html' : `${route[lang].replace(/^\//, '').replace(/\/$/, '')}/index.html`
})));
const newsPages = news.flatMap((entry) => [
  { lang: 'pl', route: { id: 'newsArticle' }, file: `aktualnosci/${entry.slug}/index.html` },
  { lang: 'en', route: { id: 'newsArticle' }, file: `en/news/${entry.slug}/index.html` }
]);
const pages = routePages.concat(newsPages, [
  { lang: 'pl', route: { id: 'notFound' }, file: '404.html' },
  { lang: 'en', route: { id: 'notFound' }, file: 'en/404.html' }
]);
const errors = [];

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

for (const page of pages) {
  const file = path.join(dist, page.file);
  if (!await exists(file)) { errors.push(`${page.file}: file missing`); continue; }
  const html = await readFile(file, 'utf8');
  const required = [
    ['language', new RegExp(`<html lang="${page.lang}">`)],
    ['title', /<title>[^<]+<\/title>/],
    ['description', /<meta name="description" content="[^"]+">/],
    ['main heading', /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/],
    ['main content', /<main id="main-content"/],
    ['navigation label', /<nav[^>]+aria-label="[^"]+"/],
    ['Polish alternate', /rel="alternate" hreflang="pl"/],
    ['English alternate', /rel="alternate" hreflang="en"/],
    ['default alternate', /rel="alternate" hreflang="x-default"/]
  ];
  required.push(['privacy controls', /data-privacy-consent/]);
  required.push(['GTM container configuration', /data-analytics-container-id="GTM-[A-Z0-9]+"/]);
  required.push(['GA4 measurement configuration', /data-analytics-measurement-id="G-[A-Z0-9]+"/]);
  required.push(['basic consent mode', /data-consent-mode="basic"/]);
  required.push(['canonical URL', /<link rel="canonical" href="https:\/\/[^\"]+">/]);
  required.push(['content security policy', /<meta http-equiv="Content-Security-Policy"/]);
  if (page.route.id !== 'notFound') required.push(['structured data', /<script type="application\/ld\+json">/]);
  for (const [label, pattern] of required) if (!pattern.test(html)) errors.push(`${page.file}: missing ${label}`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { errors.push(`${page.file}: invalid JSON-LD`); }
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${page.file}: duplicate ids: ${duplicates.join(', ')}`);
  if (/\bdata-demo\b/.test(html)) errors.push(`${page.file}: legacy data-demo found`);
  if (/href="#"/.test(html)) errors.push(`${page.file}: placeholder href found`);
  if (/\sstyle="/.test(html)) errors.push(`${page.file}: inline style bypasses strict CSP`);
  if (page.route.id !== 'home' && /page-eyebrow/.test(html)) errors.push(`${page.file}: eyebrow must not appear on subpages`);
  if (page.route.id === 'live' && !/class="shows-divider"/.test(html)) errors.push(`${page.file}: previous shows separator missing`);
  if (page.route.id === 'live' && (html.match(/class="show-weekday"/g) ?? []).length < 6) errors.push(`${page.file}: automatic weekdays missing`);
  if (page.route.id === 'news' && (html.match(/class="square-card"/g) ?? []).length !== news.length) errors.push(`${page.file}: news card count mismatch`);
  if (page.route.id === 'music' && (html.match(/data-music-open/g) ?? []).length !== releases.length) errors.push(`${page.file}: music modal trigger count mismatch`);
  if (page.route.id === 'press' && /class="press-media-card\b/.test(html)) errors.push(`${page.file}: press media gallery must not appear`);
  if (page.route.id === 'gallery' && (html.match(/data-gallery-open/g) ?? []).length < 3) errors.push(`${page.file}: gallery photos missing`);
  if (page.route.id === 'gallery' && !/data-gallery-modal/.test(html)) errors.push(`${page.file}: gallery modal missing`);
  if (page.route.id === 'gallery' && /gallery-item__overlay|<figcaption|data-gallery-description|data-gallery-title/.test(html)) errors.push(`${page.file}: visible gallery descriptions found`);
  if (page.route.id === 'press' && (html.match(/class="press-resource"/g) ?? []).length !== press.downloads.length) errors.push(`${page.file}: press download count mismatch`);
  if (page.route.id === 'contact' && (html.match(/class="contact-method"/g) ?? []).length !== 3) errors.push(`${page.file}: contact method count mismatch`);
  if (page.route.id === 'privacy' && !/class="[^"]*\bprivacy-page\b/.test(html)) errors.push(`${page.file}: privacy content missing`);
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) errors.push(`${page.file}: external font request found`);
  if (/<script[^>]+src="https:\/\/www\.googletagmanager\.com/.test(html)) errors.push(`${page.file}: GTM must not load before consent`);

  for (const match of html.matchAll(/\b(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
    if (basePath && match[1] !== basePath && !match[1].startsWith(`${basePath}/`)) {
      errors.push(`${page.file}: root-relative URL missing base path: ${match[1]}`);
    }
  }
  for (const match of html.matchAll(/\b(?:data-release-cover|data-gallery-image)="(\/(?!\/)[^"]*)/g)) {
    if (basePath && !match[1].startsWith(`${basePath}/`)) errors.push(`${page.file}: modal asset URL missing base path: ${match[1]}`);
  }

  for (const match of html.matchAll(/<(?:a|link)[^>]+href="(https?:\/\/[^"]+)"[^>]*>/g)) {
    const tag = match[0];
    if (tag.startsWith('<a') && /target="_blank"/.test(tag) && !/rel="[^"]*noopener[^"]*noreferrer[^"]*"/.test(tag)) {
      errors.push(`${page.file}: unsafe external link ${match[1]}`);
    }
  }
  const localPrefix = basePath || '';
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) {
    const localPath = localPrefix && match[1].startsWith(`${localPrefix}/`) ? match[1].slice(localPrefix.length) : match[1];
    if (localPath.startsWith('/assets/') && !await exists(path.join(dist, localPath.slice(1)))) errors.push(`${page.file}: missing asset ${match[1]}`);
    if (localPath.startsWith('/downloads/') && !await exists(path.join(dist, localPath.slice(1)))) errors.push(`${page.file}: missing download ${match[1]}`);
  }
}

for (const entry of news.filter((item) => item.status !== 'real')) {
  for (const file of [`aktualnosci/${entry.slug}/index.html`, `en/news/${entry.slug}/index.html`]) {
    const html = await readFile(path.join(dist, file), 'utf8');
    if (!/<meta name="robots" content="noindex,follow">/.test(html)) errors.push(`${file}: demo article must be noindex`);
    if (/"@type":"NewsArticle"/.test(html)) errors.push(`${file}: demo article must not emit NewsArticle schema`);
  }
}

if (site.legal.status !== 'real') {
  for (const file of ['prywatnosc/index.html', 'en/privacy/index.html']) {
    const html = await readFile(path.join(dist, file), 'utf8');
    if (!/<meta name="robots" content="noindex,follow">/.test(html)) errors.push(`${file}: draft privacy page must be noindex`);
  }
}

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) errors.push('dist/sitemap.xml: image namespace missing');
if (!sitemap.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"')) errors.push('dist/sitemap.xml: video namespace missing');
if (!sitemap.includes('<video:video>')) errors.push('dist/sitemap.xml: video entries missing');
if (!robots.includes(`Sitemap: ${site.siteUrl}sitemap.xml`)) errors.push('dist/robots.txt: sitemap URL mismatch');
for (const crawler of ['Google-Extended', 'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot']) if (!robots.includes(`User-agent: ${crawler}`)) errors.push(`dist/robots.txt: ${crawler} policy missing`);
if (site.legal.status !== 'real' && /\/prywatnosc\/|\/en\/privacy\//.test(sitemap)) errors.push('dist/sitemap.xml: draft privacy page must be excluded');
if (news.some((item) => item.status !== 'real') && news.filter((item) => item.status !== 'real').some((item) => sitemap.includes(`/aktualnosci/${item.slug}/`))) errors.push('dist/sitemap.xml: demo news must be excluded');

const idsByFile = [shows, releases, news, press.achievements, press.members].map((items) => items.map((item) => item.id ?? item.name ?? `${item.year}:${item.title?.pl}`));
for (const ids of idsByFile) {
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`content data: duplicate identifiers: ${[...new Set(duplicates)].join(', ')}`);
}
if (releases.filter((item) => item.featured).length !== 1) errors.push('src/data/releases.json: exactly one release must be featured');
if (videos.filter((item) => item.featured).length !== 1) errors.push('src/data/videos.json: exactly one video must be featured');
if (!site.entity?.origin?.city || !site.entity?.genres?.length) errors.push('src/data/site.json: entity origin or genres missing');
if (!site.visuals?.heroBackground || !site.visuals?.pageBackgroundDesktop) errors.push('src/data/site.json: background images missing');
if (!press.coverage?.length) errors.push('src/data/press.json: independent media coverage missing');

for (const requiredFile of ['styles.css', 'site.js', '_headers', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'band.json', 'feed.xml', 'en/feed.xml', 'site.webmanifest', 'humans.txt', '.well-known/security.txt', 'og.jpg', 'assets/favicon-48.webp', 'assets/apple-touch-icon-180.png', 'assets/icon-192.webp', 'assets/icon-512.webp', 'assets/hero-band-480w.webp', 'assets/hero-band-960w.webp', 'assets/fonts/audiowide-regular.woff2', 'assets/fonts/space-mono-regular.woff2', 'downloads/neon-revolution-rider-techniczny.pdf', 'downloads/neon-revolution-press-pack.zip']) {
  if (!await exists(path.join(dist, requiredFile))) errors.push(`dist/${requiredFile}: file missing`);
}

try {
  const band = JSON.parse(await readFile(path.join(dist, 'band.json'), 'utf8'));
  if (band.name !== site.brand || !band.mediaCoverage?.length || !band.profiles?.appleMusic) errors.push('dist/band.json: entity data incomplete');
} catch { errors.push('dist/band.json: invalid JSON'); }
const llms = await readFile(path.join(dist, 'llms.txt'), 'utf8');
if (!llms.includes(site.siteUrl) || /demo-warszawa|dane demonstracyjne/i.test(llms)) errors.push('dist/llms.txt: canonical source missing or demo content leaked');
for (const homepage of ['index.html', 'en/index.html']) {
  const html = await readFile(path.join(dist, homepage), 'utf8');
  if (!/\bsrcset="[^"]+480w/.test(html)) errors.push(`${homepage}: responsive images missing`);
  if (!html.includes(`src="${basePath}${site.visuals.heroBackground}"`)) errors.push(`${homepage}: CMS hero background missing`);
  if (!/rel="preload" href="[^"]+" as="image" imagesrcset=/.test(html)) errors.push(`${homepage}: responsive hero preload missing`);
  if (!/rel="alternate" type="application\/atom\+xml"/.test(html)) errors.push(`${homepage}: feed discovery missing`);
  if (/<meta name="keywords"/.test(html)) errors.push(`${homepage}: obsolete meta keywords must not be used`);
}

for (const [lang, homepage] of [['pl', 'index.html'], ['en', 'en/index.html']]) {
  const html = await readFile(path.join(dist, homepage), 'utf8');
  if (!html.includes(escapeHtml(press.bio[lang]))) errors.push(`${homepage}: biography changed or missing`);
}

if (!site.siteUrl) console.warn('Warning: siteUrl is not configured; canonical URLs and sitemap are intentionally omitted.');
if (!site.visuals?.socialShareImage && !site.ogImage) console.warn('Warning: social sharing image is not configured.');
console.warn('Warning: concert entries are demonstration content and remain intentionally visible.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Static checks passed for ${pages.length} generated pages.`);
}

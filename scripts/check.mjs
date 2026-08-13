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
const news = JSON.parse(await readFile(path.join(root, 'src/data/news.json'), 'utf8'));
const press = JSON.parse(await readFile(path.join(root, 'src/data/press.json'), 'utf8'));
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
  for (const [label, pattern] of required) if (!pattern.test(html)) errors.push(`${page.file}: missing ${label}`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${page.file}: duplicate ids: ${duplicates.join(', ')}`);
  if (/\bdata-demo\b/.test(html)) errors.push(`${page.file}: legacy data-demo found`);
  if (/href="#"/.test(html)) errors.push(`${page.file}: placeholder href found`);
  if (page.route.id !== 'home' && /page-eyebrow/.test(html)) errors.push(`${page.file}: eyebrow must not appear on subpages`);
  if (page.route.id === 'live' && !/class="shows-divider"/.test(html)) errors.push(`${page.file}: previous shows separator missing`);
  if (page.route.id === 'live' && (html.match(/class="show-weekday"/g) ?? []).length < 6) errors.push(`${page.file}: automatic weekdays missing`);
  if (page.route.id === 'news' && (html.match(/class="square-card"/g) ?? []).length !== news.length) errors.push(`${page.file}: news card count mismatch`);
  if (page.route.id === 'press' && (html.match(/class="press-media-card\b/g) ?? []).length !== press.media.length) errors.push(`${page.file}: press media count mismatch`);
  if (page.route.id === 'press' && (html.match(/class="press-resource"/g) ?? []).length !== press.downloads.length) errors.push(`${page.file}: press download count mismatch`);
  if (page.route.id === 'contact' && (html.match(/class="contact-method"/g) ?? []).length !== 3) errors.push(`${page.file}: contact method count mismatch`);
  if (page.route.id === 'privacy' && !/class="[^"]*\bprivacy-page\b/.test(html)) errors.push(`${page.file}: privacy content missing`);
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) errors.push(`${page.file}: external font request found`);

  for (const match of html.matchAll(/\b(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
    if (basePath && match[1] !== basePath && !match[1].startsWith(`${basePath}/`)) {
      errors.push(`${page.file}: root-relative URL missing base path: ${match[1]}`);
    }
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

for (const requiredFile of ['styles.css', 'site.js', '_headers', 'robots.txt', 'og.png', 'assets/fonts/audiowide-regular.woff2', 'assets/fonts/space-mono-regular.woff2', 'downloads/neon-revolution-press-kit.pdf', 'downloads/neon-revolution-rider-techniczny.pdf', 'downloads/neon-revolution-press-pack.zip']) {
  if (!await exists(path.join(dist, requiredFile))) errors.push(`dist/${requiredFile}: file missing`);
}

for (const [lang, homepage] of [['pl', 'index.html'], ['en', 'en/index.html']]) {
  const html = await readFile(path.join(dist, homepage), 'utf8');
  if (!html.includes(escapeHtml(locales[lang].bio))) errors.push(`${homepage}: approved biography changed or missing`);
}

if (!site.siteUrl) console.warn('Warning: siteUrl is not configured; canonical URLs and sitemap are intentionally omitted.');
if (!site.ogImage) console.warn('Warning: social sharing image is not configured.');
console.warn('Warning: concert entries are demonstration content and remain intentionally visible.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Static checks passed for ${pages.length} generated pages.`);
}

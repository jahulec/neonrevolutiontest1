import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDocument } from '../src/layouts/document.mjs';
import { routeOutputPath } from '../src/lib/html.mjs';
import { renderContact } from '../src/pages/contact.mjs';
import { renderHome } from '../src/pages/home.mjs';
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
  return html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
}

if (dist !== expectedDist || path.dirname(dist) !== root || path.basename(dist) !== 'dist') {
  throw new Error(`Refusing to clean unexpected output path: ${dist}`);
}

const readJson = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
const [site, routes, shows, releases, videos, news, press, pl, en, stylesheetSource, clientSource] = await Promise.all([
  readJson('src/data/site.json'), readJson('src/data/routes.json'), readJson('src/data/shows.json'),
  readJson('src/data/releases.json'), readJson('src/data/videos.json'), readJson('src/data/news.json'), readJson('src/data/press.json'),
  readJson('src/i18n/pl.json'), readJson('src/i18n/en.json'),
  readFile(path.join(root, 'src/styles/site.css')), readFile(path.join(root, 'src/client/site.js'))
]);
const assetVersion = createHash('sha256').update(stylesheetSource).update(clientSource).digest('hex').slice(0, 12);
const locales = { pl, en };
const renderers = { music: renderMusic, video: renderVideo, live: renderLive, news: renderNews, press: renderPress, contact: renderContact, privacy: renderPrivacy };

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true }),
  cp(path.join(root, 'src/styles/site.css'), path.join(dist, 'styles.css')),
  cp(path.join(root, 'src/client/site.js'), path.join(dist, 'site.js'))
]);

await mkdir(path.join(dist, 'downloads'), { recursive: true });
await Promise.all([
  cp(path.join(root, 'output/pdf/neon-revolution-demo-press-kit.pdf'), path.join(dist, 'downloads/neon-revolution-demo-press-kit.pdf')),
  cp(path.join(root, 'output/pdf/neon-revolution-demo-rider-techniczny.pdf'), path.join(dist, 'downloads/neon-revolution-demo-rider-techniczny.pdf')),
  cp(path.join(root, 'output/press/neon-revolution-demo-press-pack.zip'), path.join(dist, 'downloads/neon-revolution-demo-press-pack.zip'))
]);

try {
  await cp(path.join(root, 'public'), dist, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const shared = { site, routes, shows, releases, videos, news, press, locales };
for (const route of routes.filter((item) => item.enabled)) {
  for (const lang of ['pl', 'en']) {
    const locale = locales[lang];
    const homepage = route.id === 'home';
    const pageContext = { ...shared, locale, lang };
    const main = homepage ? renderHome(pageContext) : renderers[route.id](pageContext);
    const html = applyBasePath(renderDocument({ site, routes, locale, lang, routeId: route.id, homepage, main, assetVersion }));
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
    const pageData = { title: `${site.brand} — ${copy.title}`, description: copy.summary };
    const html = applyBasePath(renderDocument({ site, routes, locale, lang, routeId: 'news', main, bodyClass: 'news-article-page', pageData, alternatePaths, assetVersion }));
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
  ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.siteUrl).toString()}\n`
  : 'User-agent: *\nAllow: /\n';
await writeFile(path.join(dist, 'robots.txt'), robots, 'utf8');

if (site.siteUrl) {
  const routeUrls = routes.filter((route) => route.enabled).flatMap((route) => ['pl', 'en'].map((lang) => new URL(route[lang], site.siteUrl).toString()));
  const newsUrls = news.flatMap((entry) => [new URL(`/aktualnosci/${entry.slug}/`, site.siteUrl).toString(), new URL(`/en/news/${entry.slug}/`, site.siteUrl).toString()]);
  const urls = [...routeUrls, ...newsUrls];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
} else {
  console.warn('Note: canonical URLs, sitemap and absolute Open Graph URLs remain disabled until siteUrl is configured.');
}

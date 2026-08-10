import { absoluteUrl, escapeHtml, jsonLd } from '../lib/html.mjs';

export function renderHead({ site, routes, locale, lang, routeId, preloadHero = false, pageData = null, alternatePaths = null }) {
  const route = routes.find((item) => item.id === routeId);
  const page = pageData ?? locale.pages[routeId];
  const currentPath = alternatePaths?.[lang] ?? route?.[lang] ?? '/';
  const canonical = absoluteUrl(site.siteUrl, currentPath);
  const plPath = alternatePaths?.pl ?? route?.pl ?? '/';
  const enPath = alternatePaths?.en ?? route?.en ?? '/en/';
  const plUrl = absoluteUrl(site.siteUrl, plPath) ?? plPath;
  const enUrl = absoluteUrl(site.siteUrl, enPath) ?? enPath;
  const ogImage = site.siteUrl && site.ogImage ? absoluteUrl(site.siteUrl, site.ogImage) : null;
  const ogType = pageData?.ogType ?? (routeId === 'news' && alternatePaths ? 'article' : 'website');

  const musicGroup = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: site.brand,
    sameAs: Object.values(site.profiles)
  };
  if (site.siteUrl) musicGroup.url = site.siteUrl;

  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(site.themeColor)}">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="${escapeHtml(page.description)}">
  ${routeId === 'notFound' ? '<meta name="robots" content="noindex,follow">' : ''}
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:site_name" content="${escapeHtml(site.brand)}">
  <meta property="og:locale" content="${escapeHtml(locale.ogLocale)}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}"><meta property="og:image:width" content="1728"><meta property="og:image:height" content="902"><meta property="og:image:alt" content="${escapeHtml(site.brand)}">` : ''}
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <link rel="alternate" hreflang="pl" href="${escapeHtml(plUrl)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(plUrl)}">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  <title>${escapeHtml(page.title)}</title>
  <link rel="icon" href="/assets/sygnet-neon.webp" type="image/webp">
  <link rel="apple-touch-icon" href="/assets/sygnet-neon.webp">
  ${preloadHero ? '<link rel="preload" href="/assets/hero-band.webp" as="image" type="image/webp" fetchpriority="high">' : ''}
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${jsonLd(musicGroup)}</script>`;
}

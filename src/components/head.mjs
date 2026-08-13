import { createHash } from 'node:crypto';
import { absoluteUrl, escapeHtml, jsonLd } from '../lib/html.mjs';

export function renderHead({ site, routes, locale, lang, routeId, preloadHero = false, pageData = null, alternatePaths = null, assetVersion = '', structuredData = null }) {
  const route = routes.find((item) => item.id === routeId);
  const page = pageData ?? locale.pages[routeId];
  const currentPath = alternatePaths?.[lang] ?? route?.[lang] ?? '/';
  const canonical = absoluteUrl(site.siteUrl, currentPath);
  const plPath = alternatePaths?.pl ?? route?.pl ?? '/';
  const enPath = alternatePaths?.en ?? route?.en ?? '/en/';
  const plUrl = absoluteUrl(site.siteUrl, plPath) ?? plPath;
  const enUrl = absoluteUrl(site.siteUrl, enPath) ?? enPath;
  const ogImagePath = page.image ?? site.ogImage;
  const ogImage = site.siteUrl && ogImagePath ? absoluteUrl(site.siteUrl, ogImagePath) : null;
  const ogType = pageData?.ogType ?? (routeId === 'news' && alternatePaths ? 'article' : 'website');
  const schemaJson = structuredData ? jsonLd(structuredData) : '';
  const schemaHash = schemaJson ? createHash('sha256').update(schemaJson).digest('base64') : '';
  const csp = `default-src 'self'; img-src 'self' data:; style-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; font-src 'self' data:; script-src 'self' https://static.cloudflareinsights.com${schemaHash ? ` 'sha256-${schemaHash}'` : ''}; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`;

  return `
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(site.themeColor)}">
  <meta name="color-scheme" content="dark">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="${escapeHtml(site.brand)}">
  <meta name="robots" content="${escapeHtml(page.robots ?? (routeId === 'notFound' ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'))}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:site_name" content="${escapeHtml(site.brand)}">
  <meta property="og:locale" content="${escapeHtml(locale.ogLocale)}">
  <meta property="og:locale:alternate" content="${lang === 'pl' ? 'en_GB' : 'pl_PL'}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">${ogImagePath === site.ogImage ? '<meta property="og:image:width" content="1728"><meta property="og:image:height" content="902">' : ''}<meta property="og:image:alt" content="${escapeHtml(page.imageAlt ?? site.brand)}">` : ''}
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}"><meta name="twitter:image:alt" content="${escapeHtml(page.imageAlt ?? site.brand)}">` : ''}
  ${page.publishedTime ? `<meta property="article:published_time" content="${escapeHtml(page.publishedTime)}">` : ''}
  <link rel="alternate" hreflang="pl" href="${escapeHtml(plUrl)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(plUrl)}">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  <title>${escapeHtml(page.title)}</title>
  <link rel="icon" href="/assets/sygnet-neon.webp" type="image/webp">
  <link rel="apple-touch-icon" href="/assets/sygnet-neon.webp">
  <link rel="preload" href="/assets/fonts/audiowide-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/space-mono-regular.woff2" as="font" type="font/woff2" crossorigin>
  ${preloadHero ? '<link rel="preload" href="/assets/hero-band.webp" as="image" type="image/webp" fetchpriority="high">' : ''}
  <link rel="stylesheet" href="/styles.css${assetVersion ? `?v=${escapeHtml(assetVersion)}` : ''}">
  ${schemaJson ? `<script type="application/ld+json">${schemaJson}</script>` : ''}`;
}

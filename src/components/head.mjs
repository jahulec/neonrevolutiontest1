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
  const socialShareImage = site.visuals?.socialShareImage || site.ogImage;
  const ogImagePath = page.image ?? socialShareImage;
  const ogImage = site.siteUrl && ogImagePath ? absoluteUrl(site.siteUrl, ogImagePath) : null;
  const ogType = pageData?.ogType ?? (routeId === 'news' && alternatePaths ? 'article' : 'website');
  const schemaJson = structuredData ? jsonLd(structuredData) : '';
  const schemaHash = schemaJson ? createHash('sha256').update(schemaJson).digest('base64') : '';
  const heroBackground = site.visuals?.heroBackground ?? '/assets/hero-band.webp';
  const googleAnalyticsEnabled = site.analytics?.provider === 'googleTagManager' && /^GTM-[A-Z0-9]+$/.test(site.analytics?.containerId ?? '');
  const analyticsScriptSources = googleAnalyticsEnabled ? ' https://www.googletagmanager.com' : '';
  const analyticsImageSources = googleAnalyticsEnabled ? ' https://*.google-analytics.com https://www.googletagmanager.com' : '';
  const analyticsConnectSources = googleAnalyticsEnabled ? ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com' : '';
  const csp = `default-src 'self'; img-src 'self' data:${analyticsImageSources}; style-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; font-src 'self' data:; script-src 'self'${analyticsScriptSources}${schemaHash ? ` 'sha256-${schemaHash}'` : ''}; connect-src 'self'${analyticsConnectSources}; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`;

  return `
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(site.themeColor)}">
  <meta name="color-scheme" content="dark">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="${escapeHtml(site.brand)}">
  <meta name="format-detection" content="telephone=no">
  ${site.verification?.google ? `<meta name="google-site-verification" content="${escapeHtml(site.verification.google)}">` : ''}
  ${site.verification?.bing ? `<meta name="msvalidate.01" content="${escapeHtml(site.verification.bing)}">` : ''}
  <meta name="robots" content="${escapeHtml(page.robots ?? (routeId === 'notFound' ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'))}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:site_name" content="${escapeHtml(site.brand)}">
  <meta property="og:locale" content="${escapeHtml(locale.ogLocale)}">
  <meta property="og:locale:alternate" content="${lang === 'pl' ? 'en_GB' : 'pl_PL'}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}"><meta property="og:image:alt" content="${escapeHtml(page.imageAlt ?? site.brand)}">` : ''}
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
  <link rel="icon" href="/assets/favicon-48.webp" type="image/webp" sizes="48x48">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon-180.png" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="alternate" type="application/atom+xml" title="${escapeHtml(site.brand)} — ${escapeHtml(locale.nav.news)}" href="${lang === 'pl' ? '/feed.xml' : '/en/feed.xml'}">
  <link rel="alternate" type="application/json" title="${escapeHtml(site.brand)} — entity data" href="/band.json">
  <link rel="preload" href="/assets/fonts/audiowide-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/space-mono-regular.woff2" as="font" type="font/woff2" crossorigin>
  ${preloadHero ? `<link rel="preload" data-hero-preload href="${escapeHtml(heroBackground)}" as="image" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="/styles.css${assetVersion ? `?v=${escapeHtml(assetVersion)}` : ''}">
  ${schemaJson ? `<script type="application/ld+json">${schemaJson}</script>` : ''}`;
}

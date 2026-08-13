import { escapeHtml } from '../lib/html.mjs';

function routeById(routes, id) {
  return routes.find((route) => route.id === id);
}

function navigationItems({ routes, locale, lang, routeId, homepage }) {
  return routes.filter((route) => route.nav).map((route) => {
    const label = locale.nav[route.id];
    const enabled = route.enabled;
    if (!enabled) {
      return `<span class="nav-disabled" aria-disabled="true" title="${escapeHtml(locale.unavailable)}">${escapeHtml(label)}</span>`;
    }

    const href = route[lang];
    const current = !homepage && route.id === routeId ? ' aria-current="page"' : '';
    return `<a href="${escapeHtml(href)}"${current}>${escapeHtml(label)}</a>`;
  }).join('\n          ');
}

function mobileSocialLinks(site) {
  return Object.entries(site.profiles).map(([name, url]) => {
    const label = name === 'youtube' ? 'YouTube' : name[0].toUpperCase() + name.slice(1);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }).join('\n          ');
}

export function renderHeader(context) {
  const { site, routes, locale, lang, routeId, homepage, alternatePaths } = context;
  const currentRoute = routeById(routes, routeId);
  const otherLang = lang === 'pl' ? 'en' : 'pl';
  const otherLabel = otherLang.toUpperCase();
  const otherHref = alternatePaths?.[otherLang] ?? currentRoute?.[otherLang] ?? (otherLang === 'pl' ? '/' : '/en/');
  const homeHref = homepage ? '#top' : routeById(routes, 'home')[lang];
  const navItems = navigationItems(context);

  return `<header class="site-header${homepage ? '' : ' site-header--interior'}">
    <div class="wide nav">
      <a class="brand" href="${escapeHtml(homeHref)}">
        <img src="/assets/logo-neon.webp" width="1200" height="412" alt="${escapeHtml(locale.homeLabel)}" decoding="async">
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">${escapeHtml(locale.menu)}</button>
      <nav class="nav-links" aria-label="${escapeHtml(locale.navLabel)}">
        ${navItems}
        <a class="language" href="${escapeHtml(otherHref)}" hreflang="${otherLang}" lang="${otherLang}">${otherLabel}</a>
      </nav>
    </div>
  </header>
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="${escapeHtml(locale.mobileNavLabel)}" aria-hidden="true" inert>
    <div class="mobile-menu__top wide">
      <a class="mobile-menu__brand" href="${escapeHtml(homeHref)}">
        <img src="/assets/logo-neon.webp" width="1200" height="412" alt="${escapeHtml(locale.homeLabel)}" decoding="async">
      </a>
      <button class="mobile-menu__close" type="button">${escapeHtml(locale.close)}</button>
    </div>
    <div class="mobile-menu__body wide">
      <nav class="mobile-menu__nav" aria-label="${escapeHtml(locale.mobileNavLabel)}">
        ${navItems}
      </nav>
      <a class="mobile-menu__language" href="${escapeHtml(otherHref)}" hreflang="${otherLang}" lang="${otherLang}">${otherLabel}</a>
      <nav class="mobile-menu__socials" aria-label="${escapeHtml(locale.socialLabel)}">
        ${mobileSocialLinks(site)}
      </nav>
    </div>
  </div>`;
}

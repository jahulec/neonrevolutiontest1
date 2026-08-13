import { escapeHtml } from '../lib/html.mjs';

export function renderFooter({ site, locale, lang, routes, homepage }) {
  const contactRoute = routes.find((route) => route.id === 'contact');
  const privacyRoute = routes.find((route) => route.id === 'privacy');
  const contactHref = contactRoute[lang];
  const privacyHref = privacyRoute[lang];
  const profileLinks = Object.entries(site.profiles).map(([name, url]) => {
    const label = name === 'youtube' ? 'YouTube' : name[0].toUpperCase() + name.slice(1);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="me noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
  }).join('\n          ');

  return `<footer class="footer">
    <div class="wide">
      <div class="footer-top">
        <img class="footer-logo" src="/assets/logo-neon.webp" width="1200" height="412" alt="${escapeHtml(site.brand)}" loading="lazy" decoding="async">
        <div class="footer-links">
          ${profileLinks}
          <a href="${escapeHtml(contactHref)}">${escapeHtml(locale.contact)}</a>
          <a href="${escapeHtml(privacyHref)}">${escapeHtml(locale.privacy)}</a>
          <button type="button" data-open-privacy>${escapeHtml(locale.privacySettings)}</button>
        </div>
      </div>
      <div class="footer-bottom">© <span data-year></span> ${escapeHtml(site.brand)}</div>
    </div>
  </footer>`;
}

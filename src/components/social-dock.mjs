import { escapeHtml } from '../lib/html.mjs';
import { groupIcon, socialIcons } from './icons.mjs';

export function renderSocialDock({ site, locale }) {
  const items = Object.entries(site.profiles).map(([name, url]) => {
    const label = name === 'youtube' ? 'YouTube' : name[0].toUpperCase() + name.slice(1);
    return `<a class="social-item" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${socialIcons[name]}</svg>
    </a>`;
  }).join('\n    ');

  return `<aside class="social-dock" aria-label="${escapeHtml(locale.socialLabel)}">
    <button class="social-trigger" type="button" aria-label="${escapeHtml(locale.showSocial)}" aria-expanded="false" aria-controls="social-items">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${groupIcon}</svg>
    </button>
    <div class="social-items" id="social-items" inert>
      ${items}
    </div>
  </aside>`;
}

import { escapeHtml } from '../lib/html.mjs';

export function renderPrivacyControls({ site, locale }) {
  const token = site.analytics?.token ?? '';
  const enabled = Boolean(token);
  return `<aside class="privacy-consent" data-privacy-consent data-analytics-enabled="${enabled}" data-analytics-provider="${escapeHtml(site.analytics?.provider ?? '')}" data-analytics-token="${escapeHtml(token)}" aria-labelledby="privacy-consent-title" hidden>
    <div class="privacy-consent__panel">
      <button class="privacy-consent__close" type="button" data-privacy-close aria-label="${escapeHtml(locale.close)}">×</button>
      <h2 id="privacy-consent-title">${escapeHtml(locale.consent.title)}</h2>
      <p>${escapeHtml(enabled ? locale.consent.description : locale.consent.inactive)}</p>
      <div class="privacy-consent__categories">
        <div><strong>${escapeHtml(locale.consent.necessary)}</strong><span>${escapeHtml(locale.consent.necessaryDescription)}</span></div>
        <div><strong>${escapeHtml(locale.consent.analytics)}</strong><span>${escapeHtml(locale.consent.analyticsDescription)}</span></div>
      </div>
      <div class="privacy-consent__actions">
        ${enabled ? `<button type="button" data-consent="analytics">${escapeHtml(locale.consent.accept)}</button><button type="button" data-consent="necessary">${escapeHtml(locale.consent.reject)}</button>` : `<button type="button" data-privacy-close>${escapeHtml(locale.close)}</button>`}
      </div>
    </div>
  </aside>`;
}

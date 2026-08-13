import { escapeHtml } from '../lib/html.mjs';

function withValues(text, values) {
  return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), text);
}

export function renderPrivacy({ site, locale }) {
  const copy = locale.privacyPage;
  const controllerText = withValues(copy.controllerText, {
    controller: site.legal.controller,
    email: site.legal.privacyEmail
  });
  const sections = [
    [copy.controllerTitle, controllerText],
    [copy.scopeTitle, copy.scopeText],
    [copy.purposeTitle, copy.purposeText],
    [copy.legalBasisTitle, copy.legalBasisText],
    [copy.retentionTitle, copy.retentionText],
    [copy.analyticsTitle, copy.analyticsText],
    [copy.recipientsTitle, copy.recipientsText],
    [copy.transfersTitle, copy.transfersText],
    [copy.externalLinksTitle, copy.externalLinksText],
    [copy.rightsTitle, copy.rightsText],
    [copy.voluntaryTitle, copy.voluntaryText]
  ];
  const address = site.legal.address ? `<br>${escapeHtml(site.legal.address)}` : '';
  const demoNotice = site.legal.status === 'real' ? '' : `<p class="demo-notice">${escapeHtml(copy.demo)}</p>`;
  const updated = site.legal.lastUpdated ? `${copy.updated}: ${escapeHtml(site.legal.lastUpdated)}` : copy.updated;
  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.privacy.heading)}</h1></header><section class="page-section content privacy-page" data-content-status="${escapeHtml(site.legal.status)}">${demoNotice}${sections.map(([title, body], index) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}${index === 0 ? address : ''}</p></section>`).join('')}<p class="privacy-updated">${escapeHtml(updated)}</p></section>`;
}

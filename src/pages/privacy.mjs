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
    [copy.analyticsTitle, copy.analyticsText],
    [copy.recipientsTitle, copy.recipientsText],
    [copy.rightsTitle, copy.rightsText]
  ];
  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.privacy.heading)}</h1></header><section class="page-section content privacy-page" data-content-status="${escapeHtml(site.legal.status)}"><p class="demo-notice">${escapeHtml(copy.demo)}</p>${sections.map(([title, body]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`).join('')}<p class="privacy-updated">${escapeHtml(copy.updated)}</p></section>`;
}

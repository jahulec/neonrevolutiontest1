import { escapeHtml } from '../lib/html.mjs';

export function renderNotFound({ site, locale, homeHref }) {
  return `<section class="not-found content"><h1>${escapeHtml(locale.pages.notFound.heading)}</h1><p>${escapeHtml(locale.pages.notFound.message)}</p><a class="action-link" href="${escapeHtml(homeHref)}">${escapeHtml(locale.pages.notFound.back)}</a></section>`;
}

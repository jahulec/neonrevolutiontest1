import { escapeHtml } from '../lib/html.mjs';
import { displayDate } from '../lib/date.mjs';

export function renderNewsArticle({ locale, lang, entry, routes }) {
  const copy = entry[lang];
  const newsHref = lang === 'pl' ? '/aktualnosci/' : '/en/news/';
  const paragraphs = copy.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const relatedRoute = entry.relatedRoute ? routes.find((route) => route.id === entry.relatedRoute) : null;
  const relatedLabel = entry.relatedRoute === 'music' ? locale.goToMusic : entry.relatedRoute === 'live' ? locale.goToShows : null;
  const relatedLink = relatedRoute && relatedLabel ? `<a class="action-link news-article__related" href="${escapeHtml(relatedRoute[lang])}">${escapeHtml(relatedLabel)}</a>` : '';
  const backLink = `<a class="text-link" href="${escapeHtml(newsHref)}"><span aria-hidden="true">←</span> ${escapeHtml(locale.backToNews)}</a>`;
  const actions = relatedLink ? `<div class="action-stack">${relatedLink}${backLink}</div>` : backLink;
  return `<article class="news-article"><header class="page-masthead content"><h1>${escapeHtml(copy.title)}</h1></header><div class="news-article__body content"><time datetime="${escapeHtml(entry.date)}">${escapeHtml(displayDate(entry.date))}</time><img src="${escapeHtml(entry.image)}" width="1200" height="1200" alt="" decoding="async"><div class="news-article__copy"><p class="news-article__lead">${escapeHtml(copy.summary)}</p>${paragraphs}${actions}</div></div></article>`;
}

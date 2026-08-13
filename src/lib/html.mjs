export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function externalLinkAttributes(url) {
  if (!url) return '';
  return `href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"`;
}

export function phoneLink(phone) {
  return String(phone ?? '').replace(/[^+\d]/g, '');
}

export function routeOutputPath(routePath) {
  if (routePath === '/') return 'index.html';
  return `${routePath.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
}

export function absoluteUrl(baseUrl, routePath) {
  if (!baseUrl) return null;
  return new URL(routePath, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}

export function jsonLd(data) {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

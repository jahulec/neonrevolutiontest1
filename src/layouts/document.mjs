import { renderFooter } from '../components/footer.mjs';
import { renderHead } from '../components/head.mjs';
import { renderHeader } from '../components/navigation.mjs';
import { renderPrivacyControls } from '../components/privacy-controls.mjs';
import { renderSocialDock } from '../components/social-dock.mjs';
import { escapeHtml } from '../lib/html.mjs';

function background() {
  return `<div class="slow-bg-stage" aria-hidden="true"><div class="slow-bg-canvas"></div></div>`;
}

export function renderDocument({ site, routes, locale, lang, routeId, homepage = false, main, bodyClass = '', pageData = null, alternatePaths = null }) {
  const context = { site, routes, locale, lang, routeId, homepage };
  const header = renderHeader(context);
  const footer = renderFooter(context);
  const dock = renderSocialDock(context);
  const privacyControls = renderPrivacyControls(context);
  const head = renderHead({ ...context, preloadHero: homepage, pageData, alternatePaths });

  return `<!doctype html>
<html lang="${lang}">
<head>${head}
</head>
<body class="${escapeHtml(bodyClass)}" data-page-type="${homepage ? 'home' : 'interior'}">
  <a class="skip-link" href="#main-content">${escapeHtml(locale.skip)}</a>
  ${background()}
  ${homepage ? `<main id="main-content">${main.beforeHeader}${header}${main.afterHeader}</main>` : `${header}<main id="main-content" class="page-main">${main}</main>`}
  ${dock}
  ${footer}
  ${privacyControls}
  <script src="/site.js" defer></script>
</body>
</html>`;
}

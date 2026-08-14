'use strict';

const hero = document.querySelector('.hero');
const heroBg = document.querySelector('.hero-bg');
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuClose = document.querySelector('.mobile-menu__close');
const slowBgCanvas = document.querySelector('.slow-bg-canvas');
const socialDock = document.querySelector('.social-dock');
const socialTrigger = document.querySelector('.social-trigger');
const socialItems = document.querySelector('.social-items');
const footer = document.querySelector('.footer');
const privacyConsent = document.querySelector('[data-privacy-consent]');
const privacyOpeners = document.querySelectorAll('[data-open-privacy]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const desktopBreakpoint = window.matchMedia('(min-width: 821px)');

let lastY = window.scrollY;
let headerTicking = false;
let socialCloseTimer = null;
let footerVisible = false;
let menuScrollY = 0;

function isMenuOpen() {
  return mobileMenu?.classList.contains('is-open') ?? false;
}

function updateHeader() {
  if (!header) return;
  const y = window.scrollY;
  const stickyPoint = hero ? Math.max(0, window.innerHeight - 64) : 0;
  const stuck = y >= Math.max(0, stickyPoint - 2);
  const delta = y - lastY;

  header.classList.toggle('is-fixed', stuck);
  if (!desktopBreakpoint.matches || !stuck || isMenuOpen() || header.matches(':focus-within')) {
    header.classList.remove('is-hidden');
  } else if (Math.abs(delta) > 4) {
    if (delta > 0 && y > stickyPoint + 70) header.classList.add('is-hidden');
    if (delta < 0) header.classList.remove('is-hidden');
  }
  if (y <= stickyPoint + 2) header.classList.remove('is-hidden');
  lastY = y;
  headerTicking = false;
}

function requestHeaderUpdate() {
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(updateHeader);
}

function menuFocusableElements() {
  if (!mobileMenu) return [];
  return [...mobileMenu.querySelectorAll('a[href],button:not([disabled])')].filter((element) => !element.closest('[aria-disabled="true"]'));
}

function setMenu(open, restoreFocus = false) {
  if (!menuToggle || !mobileMenu) return;
  if (open === isMenuOpen()) return;
  const backgroundRegions = document.querySelectorAll('.skip-link,.hero,.post-hero,.page-main,.footer');
  if (open) {
    menuScrollY = window.scrollY;
    document.body.style.top = `-${menuScrollY}px`;
  }
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.toggleAttribute('inert', !open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  socialDock?.classList.toggle('is-suppressed', open);
  backgroundRegions.forEach((region) => region.toggleAttribute('inert', open));
  if (open) {
    header?.classList.remove('is-hidden');
    setSocials(false);
    menuClose?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (document.activeElement !== menuClose) menuClose?.focus({ preventScroll: true });
    });
    window.setTimeout(() => menuClose?.focus({ preventScroll: true }), 180);
  } else {
    const scrollY = menuScrollY;
    document.body.style.top = '';
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    lastY = scrollY;
    requestHeaderUpdate();
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }
}

menuToggle?.addEventListener('click', () => setMenu(!isMenuOpen()));
menuClose?.addEventListener('click', () => setMenu(false, true));
mobileMenu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
desktopBreakpoint.addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function setSocials(open) {
  if (!socialDock || !socialTrigger || !socialItems) return;
  socialDock.classList.toggle('is-open', open);
  socialTrigger.setAttribute('aria-expanded', String(open));
  socialItems.toggleAttribute('inert', !open);
}

function updateSocialDock() {
  if (!socialDock) return;
  const revealPoint = hero ? hero.offsetHeight + 36 : 120;
  const shouldShow = window.scrollY > revealPoint && !footerVisible && !isMenuOpen();
  socialDock.classList.toggle('is-visible', shouldShow);
  if (!shouldShow) setSocials(false);
}

function openSocials() {
  if (socialCloseTimer) clearTimeout(socialCloseTimer);
  setSocials(true);
}

function closeSocials() {
  socialCloseTimer = window.setTimeout(() => setSocials(false), 170);
}

if (socialTrigger && socialDock) {
  if (finePointer.matches) {
    socialTrigger.addEventListener('mouseenter', openSocials);
    socialDock.addEventListener('mouseenter', () => socialCloseTimer && clearTimeout(socialCloseTimer));
    socialDock.addEventListener('mouseleave', closeSocials);
  }
  socialTrigger.addEventListener('click', () => {
    if (socialCloseTimer) clearTimeout(socialCloseTimer);
    setSocials(!socialDock.classList.contains('is-open'));
  });
  document.addEventListener('pointerdown', (event) => {
    if (!socialDock.contains(event.target)) setSocials(false);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (isMenuOpen()) setMenu(false, true);
    if (socialDock?.classList.contains('is-open')) { setSocials(false); socialTrigger?.focus(); }
    return;
  }
  if (event.key !== 'Tab' || !isMenuOpen()) return;
  const focusable = menuFocusableElements();
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

if (heroBg && finePointer.matches && !reducedMotion.matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / innerWidth - 0.5) * 7;
    const y = (event.clientY / innerHeight - 0.5) * 5;
    heroBg.style.transform = `scale(1.052) translate(${x}px, ${y}px)`;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { heroBg.style.transform = 'scale(1.045) translate(0,0)'; }, { passive: true });
}

function configureBackgroundParallax() {
  if (!slowBgCanvas || !desktopBreakpoint.matches) return;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const desiredTravel = scrollRange * 0.28;
  const canvasTop = Math.abs(parseFloat(getComputedStyle(slowBgCanvas).top) || 0);
  const safeTravel = Math.max(0, slowBgCanvas.offsetHeight - window.innerHeight - canvasTop);
  document.documentElement.style.setProperty('--bg-scroll-distance', `${-Math.min(desiredTravel, safeTravel).toFixed(2)}px`);
}

let mobileBackgroundTicking = false;
function updateMobileBackgroundParallax() {
  if (!slowBgCanvas) return;
  if (desktopBreakpoint.matches) {
    slowBgCanvas.style.removeProperty('transform');
    mobileBackgroundTicking = false;
    return;
  }
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
  slowBgCanvas.style.transform = `translate3d(0, ${(-120 * progress).toFixed(3)}px, 0)`;
  mobileBackgroundTicking = false;
}

function requestMobileBackgroundUpdate() {
  if (mobileBackgroundTicking || desktopBreakpoint.matches || reducedMotion.matches) return;
  mobileBackgroundTicking = true;
  requestAnimationFrame(updateMobileBackgroundParallax);
}

if (slowBgCanvas && !CSS.supports('animation-timeline: scroll()') && !reducedMotion.matches) {
  let fallbackTicking = false;
  function directFallbackParallax() {
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
    const maxTravel = Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-scroll-distance')) || 0);
    slowBgCanvas.style.transform = `translate3d(0, ${(-maxTravel * progress).toFixed(3)}px, 0)`;
    fallbackTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (fallbackTicking) return;
    fallbackTicking = true;
    requestAnimationFrame(directFallbackParallax);
  }, { passive: true });
  directFallbackParallax();
}

const navigationAnchors = [...document.querySelectorAll('.nav-links a[href^="#"],.mobile-menu__nav a[href^="#"]')];
if ('IntersectionObserver' in window && navigationAnchors.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries.find((entry) => entry.isIntersecting);
    if (!active) return;
    navigationAnchors.forEach((link) => {
      if (link.getAttribute('href') === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

if (footer && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; updateSocialDock(); }, { threshold: 0.05 }).observe(footer);
}

window.addEventListener('scroll', () => { requestHeaderUpdate(); updateSocialDock(); requestMobileBackgroundUpdate(); }, { passive: true });
window.addEventListener('resize', () => { updateHeader(); updateSocialDock(); configureBackgroundParallax(); updateMobileBackgroundParallax(); }, { passive: true });
window.addEventListener('load', configureBackgroundParallax, { once: true });

updateHeader();
updateSocialDock();
configureBackgroundParallax();
updateMobileBackgroundParallax();

const modalDialogs = [...document.querySelectorAll('dialog')];
let modalReturnFocus = null;

function openDialog(dialog, opener) {
  if (!dialog) return;
  modalReturnFocus = opener;
  document.body.classList.add('modal-open');
  socialDock?.classList.add('is-suppressed');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  dialog.querySelector('[data-modal-close]')?.focus({ preventScroll: true });
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
}

modalDialogs.forEach((dialog) => {
  dialog.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', () => closeDialog(dialog)));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (!isMenuOpen()) socialDock?.classList.remove('is-suppressed');
    if (modalReturnFocus instanceof HTMLElement) modalReturnFocus.focus({ preventScroll: true });
    modalReturnFocus = null;
  });
});

const musicModal = document.querySelector('[data-music-modal]');
document.querySelectorAll('[data-music-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!musicModal) return;
    const title = button.dataset.releaseTitle ?? '';
    const cover = musicModal.querySelector('[data-music-cover]');
    const titleNode = musicModal.querySelector('[data-music-title]');
    const spotify = musicModal.querySelector('[data-music-spotify]');
    const youtube = musicModal.querySelector('[data-music-youtube]');
    const apple = musicModal.querySelector('[data-music-apple]');
    if (cover) { cover.src = button.dataset.releaseCover ?? ''; cover.alt = title; }
    if (titleNode) titleNode.textContent = title;
    if (spotify) { spotify.href = button.dataset.releaseSpotify ?? ''; spotify.hidden = !button.dataset.releaseSpotify; }
    if (youtube) { youtube.href = button.dataset.releaseYoutube ?? ''; youtube.hidden = !button.dataset.releaseYoutube; }
    if (apple) { apple.href = button.dataset.releaseApple ?? ''; apple.hidden = !button.dataset.releaseApple; }
    openDialog(musicModal, button);
  });
});

const galleryModal = document.querySelector('[data-gallery-modal]');
const galleryOpeners = [...document.querySelectorAll('[data-gallery-open]')];
let galleryIndex = 0;
let galleryPointerStart = null;
let galleryTouchStart = null;
let galleryIgnoreClickUntil = 0;

function showGalleryItem(index, opener = null) {
  if (!galleryModal || !galleryOpeners.length) return;
  galleryIndex = (index + galleryOpeners.length) % galleryOpeners.length;
  const item = galleryOpeners[galleryIndex];
  const image = galleryModal.querySelector('[data-gallery-image]');
  if (image) { image.src = item.dataset.galleryImage ?? ''; image.alt = item.dataset.galleryAlt ?? ''; }
  if (!galleryModal.open) openDialog(galleryModal, opener ?? item);
}

galleryOpeners.forEach((button, index) => button.addEventListener('click', () => showGalleryItem(index, button)));
galleryModal?.querySelector('[data-gallery-prev]')?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  showGalleryItem(galleryIndex - 1);
});
galleryModal?.querySelector('[data-gallery-next]')?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  showGalleryItem(galleryIndex + 1);
});
galleryModal?.querySelector('[data-gallery-backdrop]')?.addEventListener('click', () => closeDialog(galleryModal));
galleryModal?.querySelector('[data-gallery-stage]')?.addEventListener('click', (event) => {
  if (performance.now() < galleryIgnoreClickUntil) { event.preventDefault(); return; }
  if (event.target === event.currentTarget) closeDialog(galleryModal);
});

function navigateGallerySwipe(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return false;
  galleryIgnoreClickUntil = performance.now() + 400;
  showGalleryItem(galleryIndex + (deltaX < 0 ? 1 : -1));
  return true;
}

galleryModal?.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch' || !event.isPrimary || !(event.target instanceof Element) || event.target.closest('button')) return;
  galleryPointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  galleryModal.setPointerCapture?.(event.pointerId);
});
galleryModal?.addEventListener('pointerup', (event) => {
  if (!galleryPointerStart || event.pointerId !== galleryPointerStart.id) return;
  const deltaX = event.clientX - galleryPointerStart.x;
  const deltaY = event.clientY - galleryPointerStart.y;
  galleryPointerStart = null;
  if (galleryModal.hasPointerCapture?.(event.pointerId)) galleryModal.releasePointerCapture(event.pointerId);
  if (navigateGallerySwipe(0, 0, deltaX, deltaY)) event.preventDefault();
});
galleryModal?.addEventListener('pointercancel', () => { galleryPointerStart = null; });
galleryModal?.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1 || !(event.target instanceof Element) || event.target.closest('button')) return;
  const touch = event.touches[0];
  galleryTouchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
galleryModal?.addEventListener('touchend', (event) => {
  if (!galleryTouchStart || event.changedTouches.length !== 1) { galleryTouchStart = null; return; }
  const touch = event.changedTouches[0];
  const handled = navigateGallerySwipe(galleryTouchStart.x, galleryTouchStart.y, touch.clientX, touch.clientY);
  galleryTouchStart = null;
  if (handled) event.preventDefault();
}, { passive: false });
galleryModal?.addEventListener('touchcancel', () => { galleryTouchStart = null; }, { passive: true });
galleryModal?.addEventListener('dragstart', (event) => event.preventDefault());
galleryModal?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showGalleryItem(galleryIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showGalleryItem(galleryIndex + 1); }
});

const consentStorageKey = 'neon-revolution-privacy-v1';
let privacyReturnFocus = null;

function readConsent() {
  try { return localStorage.getItem(consentStorageKey); } catch { return null; }
}

function writeConsent(value) {
  try { localStorage.setItem(consentStorageKey, value); } catch { /* Storage may be blocked. */ }
}

function enableAnalytics() {
  if (!privacyConsent || privacyConsent.dataset.analyticsEnabled !== 'true') return;
  if (privacyConsent.dataset.analyticsLoaded === 'true') return;
  const provider = privacyConsent.dataset.analyticsProvider;
  const token = privacyConsent.dataset.analyticsToken;
  if (provider !== 'cloudflare' || !token) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.append(script);
  privacyConsent.dataset.analyticsLoaded = 'true';
}

function setPrivacyPanel(open, opener = null) {
  if (!privacyConsent) return;
  privacyConsent.hidden = !open;
  if (open) {
    privacyReturnFocus = opener ?? document.activeElement;
    privacyConsent.querySelector('button')?.focus({ preventScroll: true });
  } else if (privacyReturnFocus instanceof HTMLElement) {
    privacyReturnFocus.focus({ preventScroll: true });
    privacyReturnFocus = null;
  }
}

if (privacyConsent) {
  const storedConsent = readConsent();
  const globalPrivacyControl = navigator.globalPrivacyControl === true;
  if (globalPrivacyControl && storedConsent === 'analytics') writeConsent('necessary');
  if (storedConsent === 'analytics' && !globalPrivacyControl) enableAnalytics();
  if (privacyConsent.dataset.analyticsEnabled === 'true' && !storedConsent) {
    if (globalPrivacyControl) writeConsent('necessary');
    else setPrivacyPanel(true);
  }

  privacyOpeners.forEach((button) => button.addEventListener('click', () => setPrivacyPanel(true, button)));
  privacyConsent.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-consent]')?.dataset.consent;
    if (choice) {
      const mustReload = choice === 'necessary' && privacyConsent.dataset.analyticsLoaded === 'true';
      writeConsent(choice);
      if (choice === 'analytics') enableAnalytics();
      setPrivacyPanel(false);
      if (mustReload) window.location.reload();
      return;
    }
    if (event.target.closest('[data-privacy-close]')) setPrivacyPanel(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !privacyConsent.hidden) setPrivacyPanel(false);
  });
}

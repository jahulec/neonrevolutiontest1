
const hero = document.querySelector('.hero');
const heroBg = document.querySelector('.hero-bg');
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const slowBgCanvas = document.querySelector('.slow-bg-canvas');
const socialDock = document.querySelector('.social-dock');
const socialTrigger = document.querySelector('.social-trigger');

let lastY = window.scrollY;
let headerTicking = false;

function updateHeader(){
  if (!hero || !header) return;

  const y = window.scrollY;
  const stickyPoint = hero.offsetHeight;
  const stuck = y >= stickyPoint - 2;
  const delta = y - lastY;

  header.classList.toggle('is-fixed', stuck);

  if (!stuck) {
    header.classList.remove('is-hidden');
  } else if (Math.abs(delta) > 4) {
    if (delta > 0 && y > stickyPoint + 70) header.classList.add('is-hidden');
    if (delta < 0) header.classList.remove('is-hidden');
  }

  if (y <= stickyPoint + 2) header.classList.remove('is-hidden');

  lastY = y;
  headerTicking = false;
}

window.addEventListener('scroll', () => {
  if (!headerTicking) {
    requestAnimationFrame(updateHeader);
    headerTicking = true;
  }
}, {passive:true});

window.addEventListener('resize', updateHeader, {passive:true});
updateHeader();

if (
  heroBg &&
  window.matchMedia('(pointer:fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  window.addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - .5) * 7;
    const y = (e.clientY / innerHeight - .5) * 5;
    heroBg.style.transform = `scale(1.052) translate(${x}px, ${y}px)`;
  }, {passive:true});

  window.addEventListener('pointerleave', () => {
    heroBg.style.transform = 'scale(1.045) translate(0,0)';
  }, {passive:true});
}

if (menuToggle && navLinks) {
  const defaultLabel = menuToggle.textContent;
  const closeLabel = document.documentElement.lang === 'pl' ? 'ZAMKNIJ' : 'CLOSE';

  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? closeLabel : defaultLabel;
  });

  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.textContent = defaultLabel;
  }));
}

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
document.querySelectorAll('[data-demo]').forEach(el => el.addEventListener('click', e => e.preventDefault()));

/* socials */
function updateSocialDock(){
  if (!socialDock) return;

  // Keep the dock hidden while the header still sits at the bottom of the hero.
  // It appears only once the header has fully transitioned to the top.
  const revealPoint = hero ? hero.offsetHeight + 36 : 120;
  const shouldShow = window.scrollY > revealPoint;

  socialDock.classList.toggle('is-visible', shouldShow);

  if (!shouldShow) {
    socialDock.classList.remove('is-open');
    socialTrigger?.setAttribute('aria-expanded','false');
  }
}

window.addEventListener('scroll', updateSocialDock, {passive:true});
window.addEventListener('resize', updateSocialDock, {passive:true});
updateSocialDock();

if (socialTrigger && socialDock) {
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  let closeTimer = null;

  const openSocials = () => {
    if (closeTimer) clearTimeout(closeTimer);
    socialDock.classList.add('is-open');
    socialTrigger.setAttribute('aria-expanded','true');
  };

  const closeSocials = () => {
    closeTimer = setTimeout(() => {
      socialDock.classList.remove('is-open');
      socialTrigger.setAttribute('aria-expanded','false');
    }, 170);
  };

  if (finePointer) {
    socialTrigger.addEventListener('mouseenter', openSocials);
    socialDock.addEventListener('mouseenter', () => {
      if (closeTimer) clearTimeout(closeTimer);
    });
    socialDock.addEventListener('mouseleave', closeSocials);
  }

  socialTrigger.addEventListener('click', () => {
    if (closeTimer) clearTimeout(closeTimer);
    const opened = socialDock.classList.toggle('is-open');
    socialTrigger.setAttribute('aria-expanded', String(opened));
  });

  document.addEventListener('pointerdown', e => {
    if (!socialDock.contains(e.target)) {
      if (closeTimer) clearTimeout(closeTimer);
      socialDock.classList.remove('is-open');
      socialTrigger.setAttribute('aria-expanded','false');
    }
  });
}

/* direct scroll-driven parallax */
function configureBackgroundParallax(){
  if (!slowBgCanvas) return;

  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const desiredTravel = scrollRange * 0.28;
  const canvasHeight = slowBgCanvas.offsetHeight;
  const safeTravel = Math.max(120, canvasHeight - window.innerHeight - 220);
  const travel = Math.min(desiredTravel, safeTravel);

  document.documentElement.style.setProperty('--bg-scroll-distance', `${-travel.toFixed(2)}px`);
}

configureBackgroundParallax();
window.addEventListener('resize', configureBackgroundParallax, {passive:true});
window.addEventListener('load', configureBackgroundParallax, {once:true});

if (
  slowBgCanvas &&
  !CSS.supports('animation-timeline: scroll()') &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  let fallbackTicking = false;

  function directFallbackParallax(){
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
    const maxTravel = Math.abs(
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-scroll-distance')) || 0
    );

    slowBgCanvas.style.transform = `translate3d(0, ${(-maxTravel * progress).toFixed(3)}px, 0)`;
    fallbackTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!fallbackTicking) {
      fallbackTicking = true;
      requestAnimationFrame(directFallbackParallax);
    }
  }, {passive:true});

  directFallbackParallax();
}

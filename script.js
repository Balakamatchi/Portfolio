// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== Navbar scrolled state =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ===== Active nav link on scroll =====
// Only sections that actually have a matching nav link participate,
// so "in-between" sections (like Achievements) never orphan the highlight.
const navAnchors = document.querySelectorAll('.nav-link');
const navSections = Array.from(navAnchors)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function setActiveNav(id) {
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
  });
}

function updateActiveNav() {
  const navbarHeight = navbar ? navbar.offsetHeight : 0;
  const probe = window.scrollY + navbarHeight + 40; // point just below the sticky navbar

  // Special-case: at the very bottom of the page, force-highlight the last section
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) {
    setActiveNav(navSections[navSections.length - 1].id);
    return;
  }

  let currentId = navSections[0].id;
  for (const sec of navSections) {
    if (sec.offsetTop <= probe) {
      currentId = sec.id;
    } else {
      break;
    }
  }
  setActiveNav(currentId);
}

let navRaf = null;
function requestNavUpdate() {
  if (navRaf) return;
  navRaf = requestAnimationFrame(() => {
    updateActiveNav();
    navRaf = null;
  });
}

window.addEventListener('scroll', requestNavUpdate);
window.addEventListener('resize', requestNavUpdate);
updateActiveNav();

// ===== Generic image-modal factory =====
// Both the Certificate modal and the Achievement modal follow the exact
// same open/close/populate pattern, so one factory drives both instead
// of duplicating the logic.
function createImageModal({ modalId, titleId, dateId, imageId, linkId, closeId, triggerSelector }) {
  const modal = document.getElementById(modalId);
  const titleEl = document.getElementById(titleId);
  const dateEl = document.getElementById(dateId);
  const imageEl = document.getElementById(imageId);
  const linkEl = document.getElementById(linkId);
  const closeEl = document.getElementById(closeId);

  if (!modal) return;

  function open(card) {
    const title = card.dataset.title || '';
    const date = card.dataset.date || '';
    const link = card.dataset.link || '';
    const image = card.dataset.image || '';

    titleEl.textContent = title;
    dateEl.textContent = date;

    imageEl.src = image;
    imageEl.alt = title;

    if (image) {
      linkEl.href = image;
      linkEl.classList.remove('is-hidden');
    } else if (link) {
      linkEl.href = link;
      linkEl.classList.remove('is-hidden');
    } else {
      linkEl.classList.add('is-hidden');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll(triggerSelector).forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-title]');
      if (card) open(card);
    });
  });

  if (closeEl) closeEl.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

// ===== Certificate modal =====
createImageModal({
  modalId: 'certModal',
  titleId: 'certModalTitle',
  dateId: 'certModalDate',
  imageId: 'certModalImage',
  linkId: 'certModalLink',
  closeId: 'certModalClose',
  triggerSelector: '.cert-view-btn'
});

// ===== Achievement modal =====
createImageModal({
  modalId: 'achModal',
  titleId: 'achModalTitle',
  dateId: 'achModalDate',
  imageId: 'achModalImage',
  linkId: 'achModalLink',
  closeId: 'achModalClose',
  triggerSelector: '.ach-view-btn'
});

// ===== Back to top =====
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Respect reduced motion =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('in-view'));
  document.querySelectorAll('.blob').forEach(b => b.style.animation = 'none');
}

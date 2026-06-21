/* ===== NAV : effet au scroll ===== */
const nav = document.getElementById('nav');
const floatCta = document.querySelector('.float-cta');
const scrollProgress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  if (floatCta) floatCta.classList.toggle('show', y > 700);
  if (toTop) toTop.classList.toggle('show', y > 700);
  if (scrollProgress) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    scrollProgress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== Menu burger ===== */
const burger = document.getElementById('burger');
const links = document.querySelector('.nav__links');
burger?.addEventListener('click', () => links.classList.toggle('open'));
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

/* ===== Transitions douces entre sections ===== */
const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); sectionIO.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('section:not(.hero):not(.logos)').forEach(s => sectionIO.observe(s));

/* ===== Reveal au scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  io.observe(el);
});

/* ===== Compteurs animés ===== */
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimal || '0', 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  let start = null;
  const step = (t) => {
    if (!start) start = t;
    const p = Math.min((t - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent = val.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

/* ===== Avant / Après interactif ===== */
const ba = document.getElementById('ba');
const baBefore = document.getElementById('baBefore');
const baHandle = document.getElementById('baHandle');
if (ba) {
  let dragging = false;
  const setPos = (clientX) => {
    const rect = ba.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(4, Math.min(96, pct));
    baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    baHandle.style.left = pct + '%';
  };
  const startDrag = () => dragging = true;
  const stopDrag = () => dragging = false;
  ba.addEventListener('mousedown', (e) => { startDrag(); setPos(e.clientX); });
  window.addEventListener('mousemove', (e) => dragging && setPos(e.clientX));
  window.addEventListener('mouseup', stopDrag);
  ba.addEventListener('touchstart', (e) => { startDrag(); setPos(e.touches[0].clientX); }, { passive: true });
  ba.addEventListener('touchmove', (e) => dragging && setPos(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', stopDrag);
}

/* ===== Modale : politique de confidentialité (Loi 25) ===== */
const privacyModal = document.getElementById('privacyModal');
const openPrivacy = (e) => {
  if (e) e.preventDefault();
  privacyModal.classList.add('open');
  privacyModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};
const closePrivacy = () => {
  privacyModal.classList.remove('open');
  privacyModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};
document.querySelectorAll('.js-privacy').forEach(a => a.addEventListener('click', openPrivacy));
privacyModal?.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePrivacy));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && privacyModal?.classList.contains('open')) closePrivacy(); });

/* ===== Consentement vidéo Facebook (Loi 25) ===== */
const loadFbBtn = document.getElementById('loadFbVideo');
loadFbBtn?.addEventListener('click', () => {
  const wrap = document.getElementById('fbVideo');
  const consent = document.getElementById('videoConsent');
  const iframe = document.createElement('iframe');
  iframe.src = wrap.dataset.src;
  iframe.title = 'MédiNova — en vidéo';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
  consent?.remove();
  wrap.appendChild(iframe);
});

/* ===== Galerie : lightbox (agrandissement au clic) ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('[data-lightbox]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    lightboxImg.src = a.getAttribute('href');
    lightbox.hidden = false;
    document.body.classList.add('modal-open');
  });
});
const closeLightbox = () => { lightbox.hidden = true; lightboxImg.src = ''; document.body.classList.remove('modal-open'); };
document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox(); });

/* ===== Formulaire → page de remerciement ===== */
const form = document.getElementById('leadForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  // Ici : brancher l'envoi réel (email / CRM) avant la redirection
  window.location.href = 'merci.html';
});

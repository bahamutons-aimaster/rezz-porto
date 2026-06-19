/**
 * DEV.STUDIO — main.js (Final clean build)
 */
const qs  = (s, c) => (c || document).querySelector(s);
const qsa = (s, c) => [...(c || document).querySelectorAll(s)];
function mkEl(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
const waUrl = (p, m) => 'https://wa.me/' + p + '?text=' + encodeURIComponent(m);

document.addEventListener('DOMContentLoaded', async () => {
  await loadCmsContentSafe(); // override konten dari backend (kalau ada) sebelum applyConfig()
  applyConfig();
  initNav();
  initHeroSlider();
  initPortfolioCarousel();
  initReels();
  initGallery();
  initArticles();
  initVideoModal();
  initWaPopup();
  initRipple();
  initPricingToggle();
  initScrollReveal();
  initContactForm();
  trackPageview();
  qs('#footerYear').textContent = new Date().getFullYear();
});

// ── CMS CONTENT (Netlify Function + Blobs) ─────────────────
// Progressive enhancement: kalau backend belum di-deploy / gagal diakses,
// situs tetap jalan normal pakai konten default yang sudah ada di HTML/data.js.
async function loadCmsContentSafe() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('/.netlify/functions/content', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return;
    const data = await res.json();
    applyCmsContent(data);
  } catch (err) {
    // backend belum siap / offline — diamkan, fallback ke konten default
  }
}

function applyCmsContent(data) {
  if (!data) return;

  if (data.siteConfig) Object.assign(SITE_CONFIG, data.siteConfig);

  if (Array.isArray(data.hero)) {
    qsa('.hero-slide').forEach((slideEl, i) => {
      const d = data.hero[i];
      if (!d) return;
      const eyebrow = slideEl.querySelector('.hero-eyebrow');
      if (eyebrow && d.eyebrow) {
        const dot = eyebrow.querySelector('.eyebrow-dot');
        eyebrow.textContent = '';
        if (dot) eyebrow.appendChild(dot);
        eyebrow.appendChild(document.createTextNode(' ' + d.eyebrow));
      }
      const title = slideEl.querySelector('.hero-title');
      if (title && d.titleLine1 && d.titleLine2) {
        title.innerHTML = escHtml(d.titleLine1) + '<br>' + '<span class="red">' + escHtml(d.titleLine2) + '</span>';
      }
      const sub = slideEl.querySelector('.hero-sub');
      if (sub && d.subtitle) sub.textContent = d.subtitle;
      const urgency = slideEl.querySelector('.hero-urgency');
      if (urgency && d.urgency) {
        const dot = urgency.querySelector('.urgency-dot');
        urgency.textContent = '';
        if (dot) urgency.appendChild(dot);
        urgency.appendChild(document.createTextNode(' '));
        const strong = document.createElement('strong');
        strong.textContent = d.urgency;
        urgency.appendChild(strong);
      }
    });
  }

  if (data.pricing && Array.isArray(data.pricing.tiers)) {
    qsa('.harga-card').forEach((card, i) => {
      const tier = data.pricing.tiers[i];
      if (!tier) return;
      const priceMain = card.querySelector('.harga-price-main');
      if (priceMain && tier.price) {
        priceMain.textContent = tier.price;
        priceMain.setAttribute('data-month', tier.price);
        priceMain.setAttribute('data-year', tier.price);
      }
      const period = card.querySelector('.harga-price-period');
      if (period && tier.period) period.textContent = tier.period;
      const list = card.querySelector('.harga-list');
      if (list && Array.isArray(tier.features) && tier.features.length) {
        list.innerHTML = tier.features.map((f) => '<li><span class="hl-check">✓</span> ' + escHtml(f) + '</li>').join('');
      }
    });
  }

  // Portfolio / Reels / Articles / Gallery: array-array ini di-load dari data.js
  // sebagai `const`, jadi gak bisa di-reassign (=) — tapi ISI-nya boleh diganti
  // (mutate in-place) sebelum initPortfolioCarousel()/initReels()/dst dipanggil.
  replaceArrayContents(PORTFOLIO_DATA, data.portfolio);
  replaceArrayContents(REELS_DATA, data.reels);
  replaceArrayContents(ARTICLES_DATA, data.articles);
  replaceArrayContents(GALLERY_DATA, data.gallery);
}

function replaceArrayContents(target, source) {
  if (!Array.isArray(target) || !Array.isArray(source) || !source.length) return;
  target.length = 0;
  source.forEach((item) => target.push(item));
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── ANALYTICS BEACON ────────────────────────────────────────
function trackPageview() {
  try {
    fetch('/.netlify/functions/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch (err) { /* diamkan kalau backend belum siap */ }
}

// ── CONTACT FORM → LEADS ─────────────────────────────────────
function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = qs('#cfSubmitBtn');
    const status = qs('#cfStatus');
    const name = qs('#cfName').value.trim();
    const phone = qs('#cfPhone').value.trim();
    const email = qs('#cfEmail').value.trim();
    const message = qs('#cfMessage').value.trim();
    if (!name || !message) return;

    btn.disabled = true; btn.textContent = 'Mengirim…';
    status.textContent = ''; status.className = 'contact-form-status';

    try {
      const res = await fetch('/.netlify/functions/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message, source: 'contact-form' }),
      });
      if (!res.ok) throw new Error('failed');
      status.textContent = '✓ Pesan terkirim! Saya akan segera membalas.';
      status.classList.add('is-ok');
      form.reset();
    } catch (err) {
      status.textContent = 'Gagal mengirim — coba lagi atau hubungi langsung via WhatsApp.';
      status.classList.add('is-err');
    } finally {
      btn.disabled = false; btn.textContent = 'Kirim Pesan';
    }
  });
}

// ── CONFIG ────────────────────────────────────────────────
function applyConfig() {
  const wa = waUrl(SITE_CONFIG.whatsapp, SITE_CONFIG.whatsappMsg);
  const ml = 'mailto:' + SITE_CONFIG.email;
  const set = (id, h) => { const e = qs('#' + id); if (e) e.href = h; };
  set('wa-cta', wa); set('email-cta', ml); set('waFloat', wa);
  set('footer-wa', wa); set('footer-ig', SITE_CONFIG.instagram);
  set('footer-li', SITE_CONFIG.linkedin); set('heroCtaWa', wa);
  set('waPopupBtn', wa);
  const t = qs('#waPopupTitle'); if (t) t.textContent = SITE_CONFIG.waPopupTitle;
  const m = qs('#waPopupMsg');   if (m) m.textContent = SITE_CONFIG.waPopupMsg;
}

// ── NAV ───────────────────────────────────────────────────
function initNav() {
  const nav = qs('#nav'), burger = qs('#burger'), drawer = qs('#drawer');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 24), { passive: true });
  burger.addEventListener('click', () => drawer.classList.toggle('open'));
  qsa('.drawer-link').forEach(l => l.addEventListener('click', () => drawer.classList.remove('open')));
}

// ── HERO SLIDER ───────────────────────────────────────────
// Transisi: slide baru masuk dari KIRI, slide lama keluar ke KANAN,
// dengan sedikit efek blur saat berpindah. Looping otomatis & bisa
// di-swipe kiri/kanan di smartphone.
function initHeroSlider() {
  const slides = qsa('.hero-slide'), dots = qsa('.hc-dot');
  const prev = qs('#heroPrev'), next = qs('#heroNext'), bar = qs('#heroProgressBar');
  if (!slides.length) return;
  let cur = 0, paused = false, raf = null;
  const DUR = 5500;        // durasi tiap slide sebelum auto-lanjut (ms)

  function show(i) {
    const target = ((i % slides.length) + slides.length) % slides.length;
    if (target === cur) { reset(); return; }

    const oldEl = slides[cur];
    const newEl = slides[target];

    // Bersihkan sisa class transisi dari slide lain (jaga-jaga kalau user klik cepat berkali-kali)
    slides.forEach(sl => { if (sl !== oldEl && sl !== newEl) sl.classList.remove('leaving', 'entering'); });

    // 1) Posisikan slide baru di luar layar sebelah kiri, tanpa transisi (instan)
    newEl.classList.remove('active', 'leaving');
    newEl.classList.add('entering');
    void newEl.offsetWidth; // force reflow, supaya posisi awal ini benar-benar "dirender" dulu

    // 2) Slide lama bergerak keluar ke kanan, slide baru bergerak masuk ke posisi tengah
    oldEl.classList.remove('active');
    oldEl.classList.add('leaving');
    newEl.classList.remove('entering');
    newEl.classList.add('active');

    dots[cur].classList.remove('active');
    dots[target].classList.add('active');
    cur = target;

    reset();
  }

  function reset() {
    if (raf) cancelAnimationFrame(raf);
    if (bar) bar.style.width = '0%';
    let start = null;
    raf = requestAnimationFrame(function step(ts) {
      if (paused) { raf = requestAnimationFrame(step); return; }
      if (!start) start = ts;
      const p = Math.min((ts - start) / DUR * 100, 100);
      if (bar) bar.style.width = p + '%';
      if (p < 100) raf = requestAnimationFrame(step); else show(cur + 1);
    });
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { paused = false; show(i); }));
  prev.addEventListener('click', () => { paused = false; show(cur - 1); });
  next.addEventListener('click', () => { paused = false; show(cur + 1); });

  const hero = qs('#hero');
  hero.addEventListener('mouseenter', () => paused = true);
  hero.addEventListener('mouseleave', () => paused = false);

  // Swipe untuk mobile/touchscreen
  let sx = 0, sy = 0, swiping = false;
  hero.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; paused = true;
  }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (!swiping) return;
    swiping = false;
    const dx = sx - e.changedTouches[0].clientX;
    const dy = sy - e.changedTouches[0].clientY;
    paused = false;
    // hanya dianggap swipe horizontal kalau pergeserannya cukup jauh & lebih dominan horizontal
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      show(dx > 0 ? cur + 1 : cur - 1);
    }
  }, { passive: true });

  reset();
}

// ── PORTFOLIO CAROUSEL (infinite) ─────────────────────────
function initPortfolioCarousel() {
  const track = qs('#portfolioTrack'), dotsW = qs('#portfolioDots');
  const prevB = qs('#portfolioPrev'), nextB = qs('#portfolioNext');
  if (!track || !PORTFOLIO_DATA || !PORTFOLIO_DATA.length) return;
  const N = PORTFOLIO_DATA.length, CW = 660, G = 20, STEP = CW + G;

  PORTFOLIO_DATA.forEach((p, i) => {
    const c = mkEl('div', 'portfolio-card');
    const th = p.thumbnail ? '<img class="pc-thumb" src="' + p.thumbnail + '" alt="' + p.title + '" loading="lazy"/>' : '<div class="pc-thumb" style="background:#eee;display:flex;align-items:center;justify-content:center;font-size:3rem">🎬</div>';
    c.innerHTML = th + '<div class="pc-overlay"></div><div class="pc-play"><svg viewBox="0 0 24 24" fill="white" width="22" height="22"><polygon points="5,3 19,12 5,21"/></svg></div><div class="pc-info"><div class="pc-tag">' + p.category + '</div><div class="pc-title">' + p.title + '</div><div class="pc-desc">' + p.description + '</div><div class="pc-techs">' + p.techs.map(t => '<span class="pc-tech">' + t + '</span>').join('') + '</div></div>';
    c.addEventListener('click', () => openVideoModal(p.videoUrl, p.isEmbed));
    track.appendChild(c);
    const dot = mkEl('button', 'carousel-dot' + (i === 0 ? ' active' : ''));
    dot.addEventListener('click', () => go(i));
    dotsW.appendChild(dot);
  });

  // Clone for infinite
  const cards = qsa('.portfolio-card', track);
  const CL = Math.min(2, N);
  for (let i = N - CL; i < N; i++) { const cl = cards[i].cloneNode(true); cl.classList.add('pc-clone'); cl.addEventListener('click', () => openVideoModal(PORTFOLIO_DATA[i].videoUrl, PORTFOLIO_DATA[i].isEmbed)); track.insertBefore(cl, track.firstChild); }
  for (let i = 0; i < CL; i++) { const cl = cards[i].cloneNode(true); cl.classList.add('pc-clone'); cl.addEventListener('click', () => openVideoModal(PORTFOLIO_DATA[i].videoUrl, PORTFOLIO_DATA[i].isEmbed)); track.appendChild(cl); }

  let cur = 0, mobCur = 0, mobile = window.innerWidth <= 768;
  function posX(idx) { return (idx + CL) * STEP; }
  function go(idx) {
    if (mobile) return;
    cur = ((idx % N) + N) % N;
    track.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    track.style.transform = 'translateX(-' + posX(cur) + 'px)';
    qsa('.carousel-dot', dotsW).forEach((d, i) => d.classList.toggle('active', i === cur));
  }
  function jumpS(idx) { cur = idx; track.style.transition = 'none'; track.style.transform = 'translateX(-' + posX(cur) + 'px)'; track.offsetHeight; }
  track.addEventListener('transitionend', () => { if (mobile) return; if (cur < 0) jumpS(N - 1); if (cur >= N) jumpS(0); });

  // Mobile swap
  function mobInit() { const cs = qsa('.portfolio-card:not(.pc-clone)', track); cs.forEach((c, i) => { c.classList.remove('mobile-active', 'mob-exit-l', 'mob-exit-r'); c.style.display = c.style.transform = c.style.opacity = ''; if (i === 0) c.classList.add('mobile-active'); }); track.style.transform = 'none'; mobCur = 0; }
  function mobSwap(idx, dir) { const cs = qsa('.portfolio-card:not(.pc-clone)', track); if (!cs.length) return; const pv = mobCur; mobCur = ((idx % cs.length) + cs.length) % cs.length; cs[pv].classList.remove('mobile-active'); cs[pv].classList.add(dir === 'next' ? 'mob-exit-l' : 'mob-exit-r'); setTimeout(() => cs[pv].classList.remove('mob-exit-l', 'mob-exit-r'), 400); const nc = cs[mobCur]; nc.style.transform = dir === 'next' ? 'translateX(60px)' : 'translateX(-60px)'; nc.style.opacity = '0'; nc.style.display = 'block'; requestAnimationFrame(() => requestAnimationFrame(() => { nc.style.transform = ''; nc.style.opacity = ''; nc.classList.add('mobile-active'); })); qsa('.carousel-dot', dotsW).forEach((d, i) => d.classList.toggle('active', i === mobCur)); }

  if (!mobile) jumpS(0); else { qsa('.pc-clone', track).forEach(c => c.style.display = 'none'); mobInit(); prevB.style.display = 'none'; nextB.style.display = 'none'; }
  prevB.addEventListener('click', () => { if (mobile) mobSwap(mobCur - 1, 'prev'); else go(cur - 1); });
  nextB.addEventListener('click', () => { if (mobile) mobSwap(mobCur + 1, 'next'); else go(cur + 1); });
  let tsx = 0;
  track.addEventListener('touchstart', e => tsx = e.touches[0].clientX, { passive: true });
  track.addEventListener('touchend', e => { const d = tsx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) { if (mobile) mobSwap(d > 0 ? mobCur + 1 : mobCur - 1, d > 0 ? 'next' : 'prev'); else go(d > 0 ? cur + 1 : cur - 1); } });

  let wasMob = mobile;
  window.addEventListener('resize', () => { const nm = window.innerWidth <= 768; if (nm !== wasMob) { wasMob = nm; mobile = nm; if (nm) { qsa('.pc-clone', track).forEach(c => c.style.display = 'none'); mobInit(); prevB.style.display = 'none'; nextB.style.display = 'none'; } else { qsa('.portfolio-card', track).forEach(c => { c.classList.remove('mobile-active', 'mob-exit-l', 'mob-exit-r'); c.style.transform = c.style.opacity = c.style.display = ''; }); qsa('.pc-clone', track).forEach(c => c.style.display = ''); jumpS(0); prevB.style.display = ''; nextB.style.display = ''; } } });
}

// ── REELS ─────────────────────────────────────────────────
function initReels() {
  const grid = qs('#reelsGrid'); if (!grid) return;
  REELS_DATA.forEach((r, i) => {
    const c = mkEl('div', 'reel-card'); c.setAttribute('data-reveal', ''); c.style.transitionDelay = i * .07 + 's';
    const th = r.thumbnail ? '<img class="reel-thumb" src="' + r.thumbnail + '" alt="' + r.title + '" loading="lazy"/>' : '<div class="reel-thumb" style="background:#222;display:flex;align-items:center;justify-content:center;font-size:2rem">▶</div>';
    c.innerHTML = th + '<div class="reel-overlay"></div><div class="reel-play"><svg viewBox="0 0 24 24" fill="white" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg></div><div class="reel-info"><div class="reel-title">' + r.title + '</div><div class="reel-sub">' + r.subtitle + '</div></div><div class="reel-duration">' + r.duration + '</div>';
    c.addEventListener('click', () => openVideoModal(r.videoUrl, r.isEmbed));
    grid.appendChild(c);
  });
}

// ── GALLERY — Page-based (3×2 per page, infinite) ─────────
function initGallery() {
  var track   = document.getElementById('galleryTrack');
  var viewport = document.querySelector('.gallery-viewport');
  var prevBtn = document.getElementById('galleryPrev');
  var nextBtn = document.getElementById('galleryNext');
  if (!track || !viewport || typeof GALLERY_DATA === 'undefined' || !GALLERY_DATA.length) return;

  var PER = 6;
  // Group into pages of 6
  var pages = [];
  for (var i = 0; i < GALLERY_DATA.length; i += PER) pages.push(GALLERY_DATA.slice(i, i + PER));
  // Pad last page if needed
  var last = pages[pages.length - 1];
  while (last.length < PER) last.push(GALLERY_DATA[last.length % GALLERY_DATA.length]);
  var PC = pages.length;

  function mkCard(g) {
    var d = document.createElement('div'); d.className = 'gallery-card';
    d.innerHTML = '<img src="' + g.image + '" alt="' + (g.caption || '') + '" loading="lazy"/>' + (g.caption ? '<div class="gallery-card-caption">' + g.caption + '</div>' : '');
    return d;
  }
  function mkPage(items, extra) {
    var p = document.createElement('div'); p.className = 'gal-page' + (extra ? ' ' + extra : '');
    items.forEach(function(g) { p.appendChild(mkCard(g)); }); return p;
  }

  // Structure: [clone-last] [page0] [page1] ... [pageN-1] [clone-first]
  track.appendChild(mkPage(pages[PC - 1], 'gal-clone'));  // prepend
  pages.forEach(function(items) { track.appendChild(mkPage(items)); });
  track.appendChild(mkPage(pages[0], 'gal-clone'));        // append

  // cur = real page index: 0 is the first real page (track child index 1)
  var cur = 0;
  var isMobile = window.innerWidth <= 768;

  // page width = 100vw, no gaps between pages
  function VW() { return window.innerWidth; }
  // position of real page at index idx: child[idx+1] * VW
  function px(idx) { return (idx + 1) * VW(); }

  function goTo(idx, anim) {
    track.style.transition = anim !== false ? 'transform .6s cubic-bezier(.4,0,.2,1)' : 'none';
    track.style.transform = 'translateX(-' + px(idx) + 'px)';
    cur = idx;
  }
  function snap(idx) {
    cur = idx;
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + px(idx) + 'px)';
    void track.offsetHeight; // force reflow so next transition works
  }

  // After slide transition: if we're on a clone, silently snap to the real page
  track.addEventListener('transitionend', function() {
    if (isMobile) return;
    if (cur < 0)   snap(PC - 1);   // was on leading clone → jump to last real page
    if (cur >= PC) snap(0);         // was on trailing clone → jump to first real page
  });

  function deskInit() {
    isMobile = false;
    var all = track.querySelectorAll('.gallery-card');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.remove('mob-active', 'mob-exit-l', 'mob-exit-r');
      all[i].style.display = all[i].style.transform = all[i].style.opacity = '';
    }
    var cls = track.querySelectorAll('.gal-clone');
    for (var i = 0; i < cls.length; i++) cls[i].style.display = '';
    track.style.display = '';
    snap(0);
  }

  // Mobile
  var mobCur = 0;
  function realCards() {
    var out = [], rp = track.querySelectorAll('.gal-page:not(.gal-clone)');
    for (var p = 0; p < rp.length; p++) {
      var cs = rp[p].querySelectorAll('.gallery-card');
      for (var c = 0; c < cs.length; c++) out.push(cs[c]);
    }
    return out;
  }
  function mobInit() {
    isMobile = true; mobCur = 0;
    var cls = track.querySelectorAll('.gal-clone');
    for (var i = 0; i < cls.length; i++) cls[i].style.display = 'none';
    track.style.transform = 'none'; track.style.transition = 'none';
    var cs = realCards();
    for (var i = 0; i < cs.length; i++) {
      cs[i].classList.remove('mob-active', 'mob-exit-l', 'mob-exit-r');
      cs[i].style.display = cs[i].style.transform = cs[i].style.opacity = '';
      if (i === 0) cs[i].classList.add('mob-active');
    }
  }
  function mobSwap(idx, dir) {
    var cs = realCards(); if (!cs.length) return;
    var pv = mobCur; mobCur = ((idx % cs.length) + cs.length) % cs.length;
    cs[pv].classList.remove('mob-active');
    cs[pv].classList.add(dir === 'next' ? 'mob-exit-l' : 'mob-exit-r');
    setTimeout(function() { cs[pv].classList.remove('mob-exit-l', 'mob-exit-r'); }, 400);
    var nc = cs[mobCur];
    nc.style.transform = dir === 'next' ? 'translateX(60px)' : 'translateX(-60px)';
    nc.style.opacity = '0'; nc.style.display = 'block';
    requestAnimationFrame(function() { requestAnimationFrame(function() { nc.style.transform = ''; nc.style.opacity = ''; nc.classList.add('mob-active'); }); });
  }

  if (isMobile) mobInit(); else deskInit();

  prevBtn.addEventListener('click', function() {
    if (isMobile) mobSwap(mobCur - 1, 'prev'); else goTo(cur - 1);
  });
  nextBtn.addEventListener('click', function() {
    if (isMobile) mobSwap(mobCur + 1, 'next'); else goTo(cur + 1);
  });

  var sx = 0;
  track.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var d = sx - e.changedTouches[0].clientX; if (Math.abs(d) < 44) return;
    if (isMobile) mobSwap(d > 0 ? mobCur + 1 : mobCur - 1, d > 0 ? 'next' : 'prev');
    else goTo(d > 0 ? cur + 1 : cur - 1);
  });

  var wm = isMobile;
  window.addEventListener('resize', function() {
    var nm = window.innerWidth <= 768;
    if (nm !== wm) { wm = nm; if (nm) mobInit(); else deskInit(); }
    else if (!nm) snap(cur); // recalc position on resize
  });
}

// ── ARTICLES ──────────────────────────────────────────────
function initArticles() {
  const grid = qs('#articlesGrid'); if (!grid) return;
  ARTICLES_DATA.forEach((a, i) => {
    const c = mkEl('a', 'article-card' + (i === 0 ? ' featured' : ''));
    c.href = a.link || '#'; if (a.link && a.link !== '#') c.target = '_blank'; c.rel = 'noopener';
    c.setAttribute('data-reveal', ''); c.style.transitionDelay = i * .05 + 's';
    const cov = a.cover ? '<div class="article-cover-wrap"><img class="article-cover" src="' + a.cover + '" alt="' + a.title + '" loading="lazy"/></div>' : '<div class="article-cover-placeholder">📄</div>';
    c.innerHTML = cov + '<div class="article-body"><div class="article-meta"><span class="article-tag">' + a.category + '</span><span>' + a.date + '</span><span>· ' + a.readTime + '</span></div><div class="article-title">' + a.title + '</div><div class="article-excerpt">' + a.excerpt + '</div><div class="article-readmore">Baca selengkapnya →</div></div>';
    grid.appendChild(c);
  });
}

// ── VIDEO MODAL ───────────────────────────────────────────
function initVideoModal() {
  const modal = qs('#videoModal'), bg = qs('#videoModalBg'), cb = qs('#videoModalClose'), fr = qs('#videoModalFrame');
  function close() { modal.classList.remove('open'); fr.innerHTML = ''; document.body.style.overflow = ''; }
  bg.addEventListener('click', close); cb.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.openVideoModal = (url, isE) => {
    const s = url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1';
    fr.innerHTML = isE ? '<iframe src="' + s + '" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe>' : '<video src="' + url + '" controls autoplay style="border-radius:14px;width:100%;height:100%"></video>';
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  };
}

// ── WA POPUP ──────────────────────────────────────────────
function initWaPopup() {
  const popup = qs('#waPopup'), cb = qs('#waPopupClose'), badge = qs('#waBadge'), fl = qs('#waFloat');
  if (!popup) return;
  if (!sessionStorage.getItem('wa_popup')) { setTimeout(() => { popup.classList.add('visible'); sessionStorage.setItem('wa_popup', '1'); }, SITE_CONFIG.waPopupDelay || 3500); } else { if (badge) badge.style.display = 'none'; }
  cb.addEventListener('click', () => { popup.classList.remove('visible'); if (badge) badge.style.display = 'none'; });
  fl.addEventListener('click', e => { if (!popup.classList.contains('visible')) { e.preventDefault(); popup.classList.add('visible'); if (badge) badge.style.display = 'none'; } });
}

// ── RIPPLE ────────────────────────────────────────────────
function initRipple() {
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.ripple'); if (!btn) return;
    btn.style.overflow = 'hidden';
    const r = btn.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2.2;
    const x = e.clientX - r.left - sz / 2, y = e.clientY - r.top - sz / 2;
    const w = document.createElement('span');
    w.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;width:' + sz + 'px;height:' + sz + 'px;left:' + x + 'px;top:' + y + 'px;transform:scale(0);animation:rippleAnim .6s linear forwards;background:' + (btn.classList.contains('btn-red') || btn.classList.contains('harga-btn-red') || btn.classList.contains('nav-cta') ? 'rgba(255,255,255,.28)' : 'rgba(232,25,44,.15)');
    btn.appendChild(w); w.addEventListener('animationend', () => w.remove(), { once: true });
  });
}

// ── PRICING TOGGLE ────────────────────────────────────────
function initPricingToggle() {
  const t = qs('#hargaToggle'), lm = qs('#htLabelMonth'), ly = qs('#htLabelYear');
  if (!t) return; let y = false; lm.classList.add('active');
  t.addEventListener('click', () => { y = !y; t.classList.toggle('on', y); lm.classList.toggle('active', !y); ly.classList.toggle('active', y); qsa('[data-month][data-year]').forEach(el => { el.textContent = y ? el.dataset.year : el.dataset.month; }); });
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  qsa('[data-reveal]').forEach(t => io.observe(t));
  qsa('.pain-card,.layanan-card,.proses-step,.harga-card,.section-title-lg,.section-pill').forEach(t => { if (!t.hasAttribute('data-reveal')) { t.setAttribute('data-reveal', ''); io.observe(t); } });
}

/**
 * ADMIN PANEL — admin.js
 * Vanilla JS, gak ada framework. Manggil Netlify Functions di /.netlify/functions/*
 */
const qs = (s, c) => (c || document).querySelector(s);
const qsa = (s, c) => [...(c || document).querySelectorAll(s)];
const API = (path) => '/.netlify/functions/' + path;

let currentTab = 'leads';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  qs('#adLoginForm').addEventListener('submit', onLogin);
  qs('#adLogoutBtn').addEventListener('click', onLogout);
  qsa('.ad-nav-link').forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const authed = await checkAuth();
  if (authed) showDashboard();
  else showLogin();
}

async function checkAuth() {
  try {
    const res = await fetch(API('auth'));
    const data = await res.json();
    return !!data.authed;
  } catch {
    return false;
  }
}

function showLogin() {
  qs('#adLogin').hidden = false;
  qs('#adShell').hidden = true;
}

function showDashboard() {
  qs('#adLogin').hidden = true;
  qs('#adShell').hidden = false;
  switchTab(currentTab);
}

async function onLogin(e) {
  e.preventDefault();
  const btn = qs('#adLoginBtn');
  const err = qs('#adLoginErr');
  const pw = qs('#adPassword').value;
  btn.disabled = true; btn.textContent = 'Memeriksa…'; err.textContent = '';
  try {
    const res = await fetch(API('auth'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (res.ok) {
      qs('#adPassword').value = '';
      showDashboard();
    } else {
      err.textContent = data.error || 'Password salah.';
    }
  } catch {
    err.textContent = 'Gagal terhubung ke server. Coba lagi.';
  } finally {
    btn.disabled = false; btn.textContent = 'Masuk';
  }
}

async function onLogout() {
  try { await fetch(API('auth'), { method: 'DELETE' }); } catch {}
  showLogin();
}

function switchTab(tab) {
  currentTab = tab;
  qsa('.ad-nav-link').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const titles = {
    leads: 'Pesan Masuk', analytics: 'Analytics', content: 'Konten',
    portfolio: 'Portofolio', reels: 'Video Reels', articles: 'Artikel', gallery: 'Galeri',
  };
  qs('#adPageTitle').textContent = titles[tab] || '';
  qs('#adSaveArea').innerHTML = '';
  const content = qs('#adContent');
  content.innerHTML = '<div class="ad-loading">Memuat…</div>';
  if (tab === 'leads') loadLeads();
  if (tab === 'analytics') loadAnalytics();
  if (tab === 'content') loadContent();
  if (tab === 'portfolio') loadPortfolio();
  if (tab === 'reels') loadReels();
  if (tab === 'articles') loadArticles();
  if (tab === 'gallery') loadGallery();
}

function toast(msg) {
  let t = qs('#adToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'adToast'; t.className = 'ad-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ── LEADS ─────────────────────────────────────────────────
const STATUS_LABELS = { new: 'Baru', read: 'Dibaca', replied: 'Dibalas', done: 'Selesai' };

async function loadLeads() {
  const content = qs('#adContent');
  try {
    const res = await fetch(API('leads'));
    if (!res.ok) throw new Error();
    const leads = await res.json();
    renderLeads(leads);
  } catch {
    content.innerHTML = '<div class="ad-empty">Gagal memuat data. Pastikan ADMIN_PASSWORD sudah di-set di Netlify.</div>';
  }
}

function renderLeads(leads) {
  const content = qs('#adContent');
  if (!leads.length) {
    content.innerHTML = '<div class="ad-empty">Belum ada pesan masuk.</div>';
    return;
  }
  content.innerHTML = leads.map((l) => `
    <div class="ad-lead-card" data-status="${l.status}" data-id="${l.id}">
      <div class="ad-lead-top">
        <div>
          <span class="ad-lead-name">${escapeHtml(l.name)}</span>
          <span class="ad-badge" style="margin-left:8px">${escapeHtml(l.source || 'contact')}</span>
        </div>
        <select class="ad-status-select">
          ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${k === l.status ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <p class="ad-lead-msg">${escapeHtml(l.message)}</p>
      <div class="ad-lead-meta">
        ${new Date(l.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        ${l.phone ? ' · Telp: ' + escapeHtml(l.phone) : ''}
        ${l.email ? ' · Email: ' + escapeHtml(l.email) : ''}
      </div>
    </div>
  `).join('');

  qsa('.ad-status-select', content).forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const card = e.target.closest('.ad-lead-card');
      const id = card.dataset.id;
      const status = e.target.value;
      card.dataset.status = status;
      try {
        await fetch(API('leads'), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        toast('Status diperbarui');
      } catch {
        toast('Gagal update status');
      }
    });
  });
}

// ── ANALYTICS ─────────────────────────────────────────────
async function loadAnalytics() {
  const content = qs('#adContent');
  try {
    const res = await fetch(API('analytics'));
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderAnalytics(data);
  } catch {
    content.innerHTML = '<div class="ad-empty">Gagal memuat analytics. Pastikan ADMIN_PASSWORD sudah di-set di Netlify.</div>';
  }
}

function renderAnalytics(data) {
  const content = qs('#adContent');
  const last14 = data.daily.slice(-14);
  const maxViews = Math.max(...last14.map((d) => d.views), 1);
  const totalDevices = data.devices.desktop + data.devices.mobile + data.devices.tablet || 1;

  content.innerHTML = `
    <div class="ad-stat-grid">
      <div class="ad-stat-card"><div class="ad-stat-label">Total Kunjungan</div><div class="ad-stat-value">${data.totalViews}</div></div>
      <div class="ad-stat-card"><div class="ad-stat-label">Visitor Unik</div><div class="ad-stat-value">${data.totalUnique}</div></div>
      <div class="ad-stat-card"><div class="ad-stat-label">Hari Ini</div><div class="ad-stat-value">${data.todayViews}</div></div>
      <div class="ad-stat-card"><div class="ad-stat-label">Unik Hari Ini</div><div class="ad-stat-value">${data.todayUnique}</div></div>
    </div>

    <div class="ad-card">
      <h3>Kunjungan 14 Hari Terakhir</h3>
      ${last14.length ? last14.map((d) => `
        <div class="ad-bar-row">
          <span class="ad-bar-label">${fmtDate(d.date)}</span>
          <span class="ad-bar-track"><span class="ad-bar-fill" style="width:${Math.max(4, (d.views / maxViews) * 100)}%"></span></span>
          <span class="ad-bar-val">${d.views}</span>
        </div>
      `).join('') : '<p class="ad-empty">Belum ada data.</p>'}
    </div>

    <div class="ad-card">
      <h3>Halaman Terpopuler</h3>
      ${data.topPages.length ? data.topPages.map((p) => `
        <div class="ad-bar-row">
          <span class="ad-bar-label">${escapeHtml(p.path)}</span>
          <span class="ad-bar-track"><span class="ad-bar-fill" style="width:${Math.max(4, (p.views / (data.topPages[0].views || 1)) * 100)}%"></span></span>
          <span class="ad-bar-val">${p.views}</span>
        </div>
      `).join('') : '<p class="ad-empty">Belum ada data halaman.</p>'}
    </div>

    <div class="ad-card">
      <h3>Perangkat</h3>
      ${['desktop', 'mobile', 'tablet'].map((k) => `
        <div class="ad-bar-row">
          <span class="ad-bar-label">${k}</span>
          <span class="ad-bar-track"><span class="ad-bar-fill" style="width:${Math.max(4, (data.devices[k] / totalDevices) * 100)}%"></span></span>
          <span class="ad-bar-val">${data.devices[k]}</span>
        </div>
      `).join('')}
      <p style="font-size:.72rem;color:var(--txt-3);margin-top:10px;line-height:1.6">
        Data dikumpulkan tanpa menyimpan IP mentah — IP di-hash per hari dan tidak bisa dibalik.
      </p>
    </div>
  `;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ── CONTENT (CMS) — shared draft dipakai semua tab konten ──
let contentDraft = null;

async function ensureContentDraft() {
  if (contentDraft) return contentDraft;
  const res = await fetch(API('content'));
  if (!res.ok) throw new Error('fetch failed');
  contentDraft = await res.json();
  // Jaga-jaga kalau data lama belum punya field baru ini
  contentDraft.portfolio = contentDraft.portfolio || [];
  contentDraft.reels = contentDraft.reels || [];
  contentDraft.articles = contentDraft.articles || [];
  contentDraft.gallery = contentDraft.gallery || [];
  return contentDraft;
}

async function loadContent() {
  const content = qs('#adContent');
  try {
    await ensureContentDraft();
    renderContentForm();
  } catch {
    content.innerHTML = '<div class="ad-empty">Gagal memuat konten.</div>';
  }
}

function renderContentForm() {
  const content = qs('#adContent');
  const c = contentDraft;

  let html = '';

  // Site info
  html += `
    <div class="ad-card">
      <h3>Info Kontak</h3>
      <div class="ad-field-grid">
        <label class="ad-field">Nomor WhatsApp (62xxxxxxxxxx)
          <input data-path="siteConfig.whatsapp" value="${escapeAttr(c.siteConfig.whatsapp)}" />
        </label>
        <label class="ad-field">Email
          <input data-path="siteConfig.email" value="${escapeAttr(c.siteConfig.email)}" />
        </label>
        <label class="ad-field">Instagram URL
          <input data-path="siteConfig.instagram" value="${escapeAttr(c.siteConfig.instagram)}" />
        </label>
        <label class="ad-field">LinkedIn URL
          <input data-path="siteConfig.linkedin" value="${escapeAttr(c.siteConfig.linkedin)}" />
        </label>
        <label class="ad-field full">Pesan default tombol WhatsApp
          <textarea data-path="siteConfig.whatsappMsg" rows="2">${escapeHtml(c.siteConfig.whatsappMsg)}</textarea>
        </label>
      </div>
    </div>
  `;

  // Hero slides
  c.hero.forEach((slide, i) => {
    html += `
      <div class="ad-card">
        <h3>Hero — Slide ${i + 1}</h3>
        <div class="ad-field-grid">
          <label class="ad-field full">Eyebrow (teks kecil atas)
            <input data-path="hero.${i}.eyebrow" value="${escapeAttr(slide.eyebrow)}" />
          </label>
          <label class="ad-field">Judul baris 1
            <input data-path="hero.${i}.titleLine1" value="${escapeAttr(slide.titleLine1)}" />
          </label>
          <label class="ad-field">Judul baris 2 (otomatis warna merah)
            <input data-path="hero.${i}.titleLine2" value="${escapeAttr(slide.titleLine2)}" />
          </label>
          <label class="ad-field full">Subjudul / tagline
            <textarea data-path="hero.${i}.subtitle" rows="2">${escapeHtml(slide.subtitle)}</textarea>
          </label>
          <label class="ad-field full">Teks urgency (di bawah tombol CTA)
            <input data-path="hero.${i}.urgency" value="${escapeAttr(slide.urgency)}" />
          </label>
        </div>
      </div>
    `;
  });

  // Pricing
  c.pricing.tiers.forEach((tier, i) => {
    html += `
      <div class="ad-card">
        <h3>Pricing — ${escapeHtml(tier.name)}</h3>
        <div class="ad-field-grid">
          <label class="ad-field">Nama Paket
            <input data-path="pricing.tiers.${i}.name" value="${escapeAttr(tier.name)}" />
          </label>
          <label class="ad-field">Harga
            <input data-path="pricing.tiers.${i}.price" value="${escapeAttr(tier.price)}" />
          </label>
          <label class="ad-field">Periode (cth: / bulan)
            <input data-path="pricing.tiers.${i}.period" value="${escapeAttr(tier.period)}" />
          </label>
          <label class="ad-field full">Fitur (satu per baris)
            <textarea data-path="pricing.tiers.${i}.features" data-parse="lines" rows="6">${escapeHtml(tier.features.join('\n'))}</textarea>
          </label>
        </div>
      </div>
    `;
  });

  content.innerHTML = html;

  bindFields(content);
  renderSaveButton('💾 Simpan Konten');
}

function setByPath(obj, path, el) {
  const keys = path.split('.');
  let ref = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = isNaN(keys[i]) ? keys[i] : Number(keys[i]);
    ref = ref[k];
  }
  const lastKey = keys[keys.length - 1];
  let value;
  if (el.type === 'checkbox') {
    value = el.checked;
  } else if (el.dataset.parse === 'lines') {
    value = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
  } else if (el.dataset.parse === 'csv') {
    value = el.value.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    value = el.value;
  }
  ref[lastKey] = value;
}

async function saveContent() {
  const btn = qs('#adSaveBtn');
  if (!btn) return;
  const originalLabel = btn.textContent;
  btn.disabled = true; btn.textContent = 'Menyimpan…';
  try {
    const res = await fetch(API('content'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentDraft),
    });
    if (!res.ok) throw new Error();
    toast('Konten berhasil disimpan ✓');
  } catch {
    toast('Gagal menyimpan konten');
  } finally {
    btn.disabled = false; btn.textContent = originalLabel;
  }
}

function renderSaveButton(label) {
  qs('#adSaveArea').innerHTML = `<button class="ad-btn ad-btn-red" id="adSaveBtn">${label}</button>`;
  qs('#adSaveBtn').addEventListener('click', saveContent);
}

function genId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function bindFields(scopeEl) {
  qsa('input[data-path], textarea[data-path]', scopeEl).forEach((el) => {
    el.addEventListener('input', () => setByPath(contentDraft, el.dataset.path, el));
  });
}

// ── PORTFOLIO EDITOR ──────────────────────────────────────
async function loadPortfolio() {
  const content = qs('#adContent');
  try { await ensureContentDraft(); renderPortfolioEditor(); }
  catch { content.innerHTML = '<div class="ad-empty">Gagal memuat data.</div>'; }
}

function renderPortfolioEditor() {
  const content = qs('#adContent');
  const items = contentDraft.portfolio;
  content.innerHTML = `
    <p class="ad-list-hint">Card project yang tampil di carousel "Portofolio" di halaman utama. Video bisa link YouTube/Vimeo embed.</p>
    ${items.map((p, i) => `
      <div class="ad-item-card">
        <div class="ad-item-head">
          <span class="ad-item-title">${i + 1}. ${escapeHtml(p.title || 'Project baru')}</span>
          <div class="ad-item-actions">
            <button class="ad-icon-btn" data-act="up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="ad-icon-btn" data-act="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="ad-icon-btn danger" data-act="del" data-i="${i}">✕</button>
          </div>
        </div>
        <div class="ad-field-grid">
          <label class="ad-field">Judul
            <input data-path="portfolio.${i}.title" value="${escapeAttr(p.title)}" />
          </label>
          <label class="ad-field">Kategori
            <input data-path="portfolio.${i}.category" value="${escapeAttr(p.category)}" />
          </label>
          <label class="ad-field full">Deskripsi
            <textarea data-path="portfolio.${i}.description" rows="2">${escapeHtml(p.description)}</textarea>
          </label>
          <label class="ad-field full">Tags / Tech (pisahkan dengan koma)
            <input data-path="portfolio.${i}.techs" data-parse="csv" value="${escapeAttr((p.techs || []).join(', '))}" />
          </label>
          <label class="ad-field full">URL Thumbnail (gambar)
            <input data-path="portfolio.${i}.thumbnail" value="${escapeAttr(p.thumbnail)}" />
          </label>
          <label class="ad-field full">URL Video (YouTube/Vimeo embed)
            <input data-path="portfolio.${i}.videoUrl" value="${escapeAttr(p.videoUrl)}" />
          </label>
          <label class="ad-checkbox-row full">
            <input type="checkbox" data-path="portfolio.${i}.isEmbed" ${p.isEmbed ? 'checked' : ''} />
            Video berupa embed YouTube/Vimeo (uncheck kalau file video lokal)
          </label>
        </div>
        ${p.thumbnail ? `<img class="ad-thumb-preview" src="${escapeAttr(p.thumbnail)}" alt="" />` : ''}
      </div>
    `).join('')}
    <button class="ad-btn-add" id="adAddPortfolio">+ Tambah Project</button>
  `;
  bindFields(content);
  bindListActions(content, contentDraft.portfolio, renderPortfolioEditor);
  qs('#adAddPortfolio').addEventListener('click', () => {
    contentDraft.portfolio.push({
      id: genId('proj'), title: 'Project Baru', category: 'Kategori', description: 'Deskripsi singkat project ini.',
      techs: [], thumbnail: '', videoUrl: '', isEmbed: true,
    });
    renderPortfolioEditor();
  });
  renderSaveButton('💾 Simpan Portofolio');
}

// ── REELS EDITOR ──────────────────────────────────────────
async function loadReels() {
  const content = qs('#adContent');
  try { await ensureContentDraft(); renderReelsEditor(); }
  catch { content.innerHTML = '<div class="ad-empty">Gagal memuat data.</div>'; }
}

function renderReelsEditor() {
  const content = qs('#adContent');
  const items = contentDraft.reels;
  content.innerHTML = `
    <p class="ad-list-hint">Video portrait (9:16) yang tampil di section "Video Karya" halaman utama.</p>
    ${items.map((r, i) => `
      <div class="ad-item-card">
        <div class="ad-item-head">
          <span class="ad-item-title">${i + 1}. ${escapeHtml(r.title || 'Reel baru')}</span>
          <div class="ad-item-actions">
            <button class="ad-icon-btn" data-act="up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="ad-icon-btn" data-act="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="ad-icon-btn danger" data-act="del" data-i="${i}">✕</button>
          </div>
        </div>
        <div class="ad-field-grid">
          <label class="ad-field">Judul
            <input data-path="reels.${i}.title" value="${escapeAttr(r.title)}" />
          </label>
          <label class="ad-field">Subjudul
            <input data-path="reels.${i}.subtitle" value="${escapeAttr(r.subtitle)}" />
          </label>
          <label class="ad-field">Durasi (cth: 1:42)
            <input data-path="reels.${i}.duration" value="${escapeAttr(r.duration)}" />
          </label>
          <label class="ad-field">URL Thumbnail
            <input data-path="reels.${i}.thumbnail" value="${escapeAttr(r.thumbnail)}" />
          </label>
          <label class="ad-field full">URL Video (YouTube/Vimeo embed)
            <input data-path="reels.${i}.videoUrl" value="${escapeAttr(r.videoUrl)}" />
          </label>
          <label class="ad-checkbox-row full">
            <input type="checkbox" data-path="reels.${i}.isEmbed" ${r.isEmbed ? 'checked' : ''} />
            Video berupa embed YouTube/Vimeo (uncheck kalau file video lokal)
          </label>
        </div>
        ${r.thumbnail ? `<img class="ad-thumb-preview" src="${escapeAttr(r.thumbnail)}" alt="" />` : ''}
      </div>
    `).join('')}
    <button class="ad-btn-add" id="adAddReel">+ Tambah Reel</button>
  `;
  bindFields(content);
  bindListActions(content, contentDraft.reels, renderReelsEditor);
  qs('#adAddReel').addEventListener('click', () => {
    contentDraft.reels.push({ id: genId('reel'), title: 'Reel Baru', subtitle: 'Subjudul', duration: '0:00', thumbnail: '', videoUrl: '', isEmbed: true });
    renderReelsEditor();
  });
  renderSaveButton('💾 Simpan Reels');
}

// ── ARTICLES EDITOR ───────────────────────────────────────
async function loadArticles() {
  const content = qs('#adContent');
  try { await ensureContentDraft(); renderArticlesEditor(); }
  catch { content.innerHTML = '<div class="ad-empty">Gagal memuat data.</div>'; }
}

function renderArticlesEditor() {
  const content = qs('#adContent');
  const items = contentDraft.articles;
  content.innerHTML = `
    <p class="ad-list-hint">Artikel pertama di list ini otomatis tampil besar (featured) di halaman & section Blog. Urutkan pakai tombol ↑↓.</p>
    ${items.map((a, i) => `
      <div class="ad-item-card">
        <div class="ad-item-head">
          <span class="ad-item-title">${i === 0 ? '⭐ ' : ''}${i + 1}. ${escapeHtml(a.title || 'Artikel baru')}</span>
          <div class="ad-item-actions">
            <button class="ad-icon-btn" data-act="up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="ad-icon-btn" data-act="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="ad-icon-btn danger" data-act="del" data-i="${i}">✕</button>
          </div>
        </div>
        <div class="ad-field-grid">
          <label class="ad-field full">Judul
            <input data-path="articles.${i}.title" value="${escapeAttr(a.title)}" />
          </label>
          <label class="ad-field">Kategori
            <input data-path="articles.${i}.category" value="${escapeAttr(a.category)}" />
          </label>
          <label class="ad-field">Tanggal (cth: 12 Jun 2025)
            <input data-path="articles.${i}.date" value="${escapeAttr(a.date)}" />
          </label>
          <label class="ad-field">Estimasi Baca (cth: 5 menit)
            <input data-path="articles.${i}.readTime" value="${escapeAttr(a.readTime)}" />
          </label>
          <label class="ad-field">Link artikel lengkap
            <input data-path="articles.${i}.link" value="${escapeAttr(a.link)}" />
          </label>
          <label class="ad-field full">Ringkasan (excerpt)
            <textarea data-path="articles.${i}.excerpt" rows="3">${escapeHtml(a.excerpt)}</textarea>
          </label>
          <label class="ad-field full">URL Cover (kosongkan untuk pakai ikon placeholder)
            <input data-path="articles.${i}.cover" value="${escapeAttr(a.cover)}" />
          </label>
        </div>
        ${a.cover ? `<img class="ad-thumb-preview" src="${escapeAttr(a.cover)}" alt="" />` : ''}
      </div>
    `).join('')}
    <button class="ad-btn-add" id="adAddArticle">+ Tulis Artikel Baru</button>
  `;
  bindFields(content);
  bindListActions(content, contentDraft.articles, renderArticlesEditor);
  qs('#adAddArticle').addEventListener('click', () => {
    contentDraft.articles.push({
      id: genId('art'), title: 'Judul Artikel Baru', category: 'Strategi',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      readTime: '5 menit', excerpt: 'Ringkasan singkat artikel ini.', cover: '', link: '#',
    });
    renderArticlesEditor();
  });
  renderSaveButton('💾 Simpan Artikel');
}

// ── GALLERY EDITOR ────────────────────────────────────────
async function loadGallery() {
  const content = qs('#adContent');
  try { await ensureContentDraft(); renderGalleryEditor(); }
  catch { content.innerHTML = '<div class="ad-empty">Gagal memuat data.</div>'; }
}

function renderGalleryEditor() {
  const content = qs('#adContent');
  const items = contentDraft.gallery;
  content.innerHTML = `
    <p class="ad-list-hint">Foto di section "Galeri" halaman utama. Format square 1:1 ideal, minimal 6 foto biar looping-nya mulus.</p>
    ${items.map((g, i) => `
      <div class="ad-item-card">
        <div class="ad-item-head">
          <span class="ad-item-title">${i + 1}. ${escapeHtml(g.caption || 'Foto')}</span>
          <div class="ad-item-actions">
            <button class="ad-icon-btn" data-act="up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="ad-icon-btn" data-act="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="ad-icon-btn danger" data-act="del" data-i="${i}">✕</button>
          </div>
        </div>
        <div class="ad-field-grid">
          <label class="ad-field full">URL Foto
            <input data-path="gallery.${i}.image" value="${escapeAttr(g.image)}" />
          </label>
          <label class="ad-field full">Caption (muncul saat hover)
            <input data-path="gallery.${i}.caption" value="${escapeAttr(g.caption)}" />
          </label>
        </div>
        ${g.image ? `<img class="ad-thumb-preview" src="${escapeAttr(g.image)}" alt="" />` : ''}
      </div>
    `).join('')}
    <button class="ad-btn-add" id="adAddGalleryItem">+ Tambah Foto</button>
  `;
  bindFields(content);
  bindListActions(content, contentDraft.gallery, renderGalleryEditor);
  qs('#adAddGalleryItem').addEventListener('click', () => {
    contentDraft.gallery.push({ id: genId('g'), image: '', caption: 'Caption foto' });
    renderGalleryEditor();
  });
  renderSaveButton('💾 Simpan Galeri');
}

// ── Shared up/down/delete handler buat semua list editor ──
function bindListActions(scopeEl, array, rerender) {
  qsa('.ad-icon-btn', scopeEl).forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      const act = btn.dataset.act;
      if (act === 'up' && i > 0) { [array[i - 1], array[i]] = [array[i], array[i - 1]]; }
      if (act === 'down' && i < array.length - 1) { [array[i + 1], array[i]] = [array[i], array[i + 1]]; }
      if (act === 'del') {
        if (!confirm('Hapus item ini?')) return;
        array.splice(i, 1);
      }
      rerender();
    });
  });
}

// ── Helpers ───────────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

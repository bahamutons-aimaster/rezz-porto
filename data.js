/**
 * ════════════════════════════════════════════════════════
 *  DEV.STUDIO — DATA CONFIG
 *  Edit file ini untuk update konten website tanpa backend.
 *  Tidak perlu menyentuh HTML atau CSS sama sekali.
 * ════════════════════════════════════════════════════════
 */

// ── SITE CONFIG ──────────────────────────────────────────
// Edit bagian ini untuk kontak, nama, dan sosial media

const SITE_CONFIG = {
  name: "Nama Strategist / Studio",
  tagline: "Social Media Strategist & Digital Marketing Specialist",
  whatsapp: "6281234567890",       // Format: 62 + nomor (tanpa +)
  whatsappMsg: "Halo! Saya tertarik untuk konsultasi strategi social media, iklan, atau digital marketing untuk bisnis saya.",
  email: "hello@devstudio.id",
  instagram: "https://instagram.com/devstudio",
  linkedin: "https://linkedin.com/in/devstudio",
  waPopupTitle: "Hai! 👋",
  waPopupMsg: "Punya bisnis yang mau naik kelas? Chat saya langsung via WhatsApp, biasanya reply dalam 1 jam.",
  waPopupDelay: 3000,             // Delay popup muncul (ms), default 3 detik
};


// ── PORTFOLIO DATA ───────────────────────────────────────
// Untuk video: bisa YouTube URL, Vimeo URL, atau file video lokal
// Thumbnail: bisa URL gambar atau kosongkan (akan tampil placeholder)

const PORTFOLIO_DATA = [
  {
    id: "proj-1",
    title: "Strata Coffee — Local Business Social Media",
    category: "F&B · Local Business",
    description: "Pengelolaan Instagram & TikTok untuk coffee shop lokal, dari riset konten sampai jadwal posting konsisten — engagement naik signifikan dalam 3 bulan.",
    techs: ["Instagram", "TikTok", "Content Strategy"],
    // Ganti dengan YouTube/Vimeo embed URL atau file video lokal
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    // Ganti dengan URL thumbnail gambar project
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    isEmbed: true,  // true = YouTube/Vimeo iframe, false = file video lokal
  },
  {
    id: "proj-2",
    title: "Klinik Kecantikan — Performance Ads Campaign",
    category: "Healthcare · Performance Ads",
    description: "Kampanye Meta Ads dengan targeting spesifik berbasis data, berhasil menurunkan cost-per-lead dan meningkatkan booking konsultasi klinik.",
    techs: ["Meta Ads", "Lead Generation", "Copywriting"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    isEmbed: true,
  },
  {
    id: "proj-3",
    title: "Resto Keluarga — Local SEO & Google Maps",
    category: "F&B · Local SEO",
    description: "Optimasi Google Business Profile dan Local SEO membantu resto naik ke halaman pertama pencarian lokal dan meningkatkan kunjungan langsung.",
    techs: ["Local SEO", "Google Maps", "Google Business"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
    isEmbed: true,
  },
  {
    id: "proj-4",
    title: "Fashion Brand — TikTok Ads & Content",
    category: "Retail · TikTok Ads",
    description: "Strategi konten TikTok yang dipadukan dengan TikTok Ads, mendorong reach organik tinggi sekaligus konversi penjualan langsung dari platform.",
    techs: ["TikTok Ads", "Content Creation", "Influencer Collab"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    isEmbed: true,
  },
  {
    id: "proj-5",
    title: "Coffee Shop Chain — Brand Awareness Campaign",
    category: "F&B · Brand Awareness",
    description: "Kampanye multi-platform untuk memperkuat brand identity di seluruh cabang, dengan konsistensi visual dan strategi konten lintas kota.",
    techs: ["Instagram Ads", "Brand Strategy", "Analytics"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    isEmbed: true,
  },
];


// ── REELS DATA ───────────────────────────────────────────
// Video reels format portrait (9:16)
// Untuk file video lokal: ganti videoUrl dengan path relatif, contoh: "./videos/reel-1.mp4"
// isEmbed: true = YouTube/Vimeo, false = file video (mp4)

const REELS_DATA = [
  {
    id: "reel-1",
    title: "Proses Bikin Konten Viral",
    subtitle: "Dari Ide ke Eksekusi",
    duration: "1:42",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80",
    isEmbed: true,
  },
  {
    id: "reel-2",
    title: "Review Campaign Klien",
    subtitle: "Evaluasi Strategi Bulanan",
    duration: "2:15",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    isEmbed: true,
  },
  {
    id: "reel-3",
    title: "Setup Campaign Ads",
    subtitle: "Meta & TikTok Ads Manager",
    duration: "3:05",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&q=80",
    isEmbed: true,
  },
  {
    id: "reel-4",
    title: "Local SEO untuk Bisnis Kecil",
    subtitle: "Optimasi Google Maps",
    duration: "2:30",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80",
    isEmbed: true,
  },
  {
    id: "reel-5",
    title: "Content Calendar Planning",
    subtitle: "Strategi Konten 1 Bulan",
    duration: "1:58",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80",
    isEmbed: true,
  },
  {
    id: "reel-6",
    title: "Case Study Breakdown",
    subtitle: "Before & After Engagement",
    duration: "4:12",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
    isEmbed: true,
  },
];


// ── ARTICLES DATA ────────────────────────────────────────
// Article pertama akan tampil sebagai "featured" (card besar)
// Untuk tambah artikel baru: copy salah satu objek dan edit isinya

const ARTICLES_DATA = [
  {
    id: "art-1",
    featured: true,    // <-- artikel pertama: featured (tampil besar)
    title: "Kenapa Strategi Konten Lebih Penting daripada Sekadar Posting Tiap Hari",
    category: "Strategi",
    date: "12 Jun 2025",
    readTime: "8 menit",
    excerpt: "Posting konsisten itu bagus, tapi tanpa strategi yang jelas, hasilnya cuma followers yang stuck. Saya jelaskan kenapa data dan riset audiens harus jadi fondasi sebelum bikin satu konten pun.",
    // Ganti dengan URL gambar cover artikel
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    // Ganti dengan link artikel lengkap (bisa ke Medium, blog, Notion, dll)
    link: "#",
  },
  {
    id: "art-2",
    featured: false,
    title: "5 Kesalahan Fatal Saat Jalanin Meta Ads untuk Bisnis Lokal",
    category: "Iklan",
    date: "3 Jun 2025",
    readTime: "5 menit",
    excerpt: "Dari targeting yang terlalu luas hingga budget yang asal jalan tanpa A/B testing — panduan dari pengalaman nyata menangani ratusan campaign.",
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    link: "#",
  },
  {
    id: "art-3",
    featured: false,
    title: "Cara Membangun Brand Identity yang Konsisten di Semua Platform Sosmed",
    category: "Branding",
    date: "28 Mei 2025",
    readTime: "6 menit",
    excerpt: "Brand yang kuat bukan cuma soal logo bagus. Ini adalah bahasa visual dan tone yang sama di Instagram, TikTok, sampai Google Business. Begini cara saya membangunnya.",
    cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
    link: "#",
  },
  {
    id: "art-4",
    featured: false,
    title: "Local SEO: Rahasia Coffee Shop dan Resto Naik di Google Maps",
    category: "Local Business",
    date: "20 Mei 2025",
    readTime: "4 menit",
    excerpt: "Setelah optimasi puluhan Google Business Profile untuk bisnis F&B, ini insight jujur yang jarang dibahas di tutorial online.",
    cover: "",  // kosong = icon placeholder
    link: "#",
  },
  {
    id: "art-5",
    featured: false,
    title: "Studi Kasus: Strategi Ads yang Bikin Penjualan Klien Naik 33%",
    category: "Case Study",
    date: "15 Mei 2025",
    readTime: "7 menit",
    excerpt: "Cerita nyata tentang campaign yang awalnya boncos, lalu dievaluasi ulang datanya, dan bagaimana satu perubahan strategi mengubah hasilnya total.",
    cover: "",  // kosong = icon placeholder
    link: "#",
  },
];


// ── GALLERY DATA ─────────────────────────────────────────
// Galeri 3x2 (3 kolom × 2 baris terlihat sekaligus).
// Slide horizontal, infinite loop. Mobile: swap satu per satu.
// Minimal 6 item, ideal 8-14 item supaya looping kelihatan natural.
// Format square 1:1 — pakai foto landscape juga oke, akan di-crop.
// caption tampil saat hover.

const GALLERY_DATA = [
  {
    id: "g1",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
    caption: "Riset konten & data — daily routine"
  },
  {
    id: "g2",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    caption: "Brainstorm strategi bareng tim klien"
  },
  {
    id: "g3",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    caption: "Edit konten — late night session"
  },
  {
    id: "g4",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80",
    caption: "Mapping content pillar di whiteboard"
  },
  {
    id: "g5",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
    caption: "Presentasi strategi campaign ke klien"
  },
  {
    id: "g6",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&q=80",
    caption: "Monitoring performa iklan multi-platform"
  },
  {
    id: "g7",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    caption: "Meeting evaluasi campaign bulanan"
  },
  {
    id: "g8",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    caption: "Workshop strategi konten tim"
  },
  {
    id: "g9",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
    caption: "Prototyping kalender konten"
  },
  {
    id: "g10",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    caption: "Fokus analisa data audiens"
  },
  {
    id: "g11",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
    caption: "Onboarding klien baru"
  },
  {
    id: "g12",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    caption: "Ruang kerja studio kami"
  },
];

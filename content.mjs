// netlify/functions/content.mjs
// GET -> konten aktif saat ini (publik, dipanggil dari main.js setiap halaman dibuka)
// PUT -> update konten (cuma admin, dipanggil dari admin.html)
//
// Kalau belum pernah disimpan sama sekali, function ini balikin DEFAULT_CONTENT
// di bawah — jadi website TETAP jalan normal walau backend belum pernah dipakai.

import { contentStore, isAuthed, json } from "./lib/utils.mjs";

const DEFAULT_CONTENT = {
  siteConfig: {
    whatsapp: "6281234567890",
    whatsappMsg:
      "Halo! Saya tertarik untuk konsultasi strategi social media, iklan, atau digital marketing untuk bisnis saya.",
    email: "hello@devstudio.id",
    instagram: "https://instagram.com/devstudio",
    linkedin: "https://linkedin.com/in/devstudio",
  },
  hero: [
    {
      eyebrow: "SOCIAL MEDIA STRATEGIST · DIGITAL MARKETING",
      titleLine1: "Lebih dari Sekadar Visual,",
      titleLine2: "Kami Pikirkan Strateginya.",
      subtitle:
        "5 tahun berpengalaman di lintas bisnis, saya memiliki data dan sense of business yang cukup baik, dengan berbagai case. Strategi konten adalah kunci.",
      urgency: "Hanya 3 slot klien tersisa bulan ini.",
    },
    {
      eyebrow: "ADS & DIGITAL MARKETING · BUSINESS GROWTH",
      titleLine1: "Bisnismu Sepi? Ada yang Salah.",
      titleLine2: "Kami Punya Solusi Efektifnya.",
      subtitle:
        "Jangan salahin karyawan dulu — mungkin sistem dan strateginya yang perlu dievaluasi. Platform digital bisa jadi corong marketing yang sangat efektif, tapi kalau asal jalan, semuanya bisa buyar tanpa data yang spesifik.",
      urgency: "Sudah dipercaya oleh 30+ klien nasional.",
    },
    {
      eyebrow: "SOCIAL MEDIA · LOCAL BUSINESS",
      titleLine1: "Coffeeshop-mu Masih Gitu-gitu Aja?",
      titleLine2: "Strategi Sosmedmu Ada yang Salah.",
      subtitle:
        "Social media adalah ujung tombak semua pelaku bisnis selain offline marketing. Pengalaman kami membuktikan strategi social media yang tepat dan efektif bisa membantu bisnismu tumbuh sekitar 33%.",
      urgency: "Rata-rata pertumbuhan +33% dalam 3 bulan kampanye.",
    },
  ],
  pricing: {
    tiers: [
      {
        name: "Free Trial",
        price: "Rp0",
        period: "/ 2 Minggu",
        features: [
          "15 konten siap pakai (caption + visual)",
          "Basic strategi social media 2 minggu",
          "Audit akun sosial media gratis",
          "1 konsultasi via WhatsApp",
          "Nggak perlu kartu kredit",
        ],
      },
      {
        name: "Starter",
        price: "Rp2.000.000",
        period: "/ bulan",
        features: [
          "20 konten per bulan (caption + visual)",
          "Strategi konten bulanan",
          "Feed guide & brand template",
          "Jadwal posting terencana",
          "Laporan bulanan sederhana",
          "Support via WhatsApp",
        ],
      },
      {
        name: "Business",
        price: "Rp3.200.000",
        period: "/ bulan",
        features: [
          "Semua benefit Starter, plus:",
          "Video konten storytelling premium",
          "5 motion graphic content / bulan",
          "Meta Ads / TikTok Ads management",
          "Free budget iklan Rp100.000",
          "Full strategy deck bulanan",
          "Report & analitik mendalam",
          "Priority support 7 hari",
        ],
      },
    ],
  },
  portfolio: [
    {
      id: "proj-1",
      title: "Strata Coffee — Local Business Social Media",
      category: "F&B · Local Business",
      description:
        "Pengelolaan Instagram & TikTok untuk coffee shop lokal, dari riset konten sampai jadwal posting konsisten — engagement naik signifikan dalam 3 bulan.",
      techs: ["Instagram", "TikTok", "Content Strategy"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      isEmbed: true,
    },
    {
      id: "proj-2",
      title: "Klinik Kecantikan — Performance Ads Campaign",
      category: "Healthcare · Performance Ads",
      description:
        "Kampanye Meta Ads dengan targeting spesifik berbasis data, berhasil menurunkan cost-per-lead dan meningkatkan booking konsultasi klinik.",
      techs: ["Meta Ads", "Lead Generation", "Copywriting"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      isEmbed: true,
    },
    {
      id: "proj-3",
      title: "Resto Keluarga — Local SEO & Google Maps",
      category: "F&B · Local SEO",
      description:
        "Optimasi Google Business Profile dan Local SEO membantu resto naik ke halaman pertama pencarian lokal dan meningkatkan kunjungan langsung.",
      techs: ["Local SEO", "Google Maps", "Google Business"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
      isEmbed: true,
    },
    {
      id: "proj-4",
      title: "Fashion Brand — TikTok Ads & Content",
      category: "Retail · TikTok Ads",
      description:
        "Strategi konten TikTok yang dipadukan dengan TikTok Ads, mendorong reach organik tinggi sekaligus konversi penjualan langsung dari platform.",
      techs: ["TikTok Ads", "Content Creation", "Influencer Collab"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      isEmbed: true,
    },
    {
      id: "proj-5",
      title: "Coffee Shop Chain — Brand Awareness Campaign",
      category: "F&B · Brand Awareness",
      description:
        "Kampanye multi-platform untuk memperkuat brand identity di seluruh cabang, dengan konsistensi visual dan strategi konten lintas kota.",
      techs: ["Instagram Ads", "Brand Strategy", "Analytics"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
      isEmbed: true,
    },
  ],
  reels: [
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
  ],
  articles: [
    {
      id: "art-1",
      title: "Kenapa Strategi Konten Lebih Penting daripada Sekadar Posting Tiap Hari",
      category: "Strategi",
      date: "12 Jun 2025",
      readTime: "8 menit",
      excerpt:
        "Posting konsisten itu bagus, tapi tanpa strategi yang jelas, hasilnya cuma followers yang stuck. Saya jelaskan kenapa data dan riset audiens harus jadi fondasi sebelum bikin satu konten pun.",
      cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      link: "#",
    },
    {
      id: "art-2",
      title: "5 Kesalahan Fatal Saat Jalanin Meta Ads untuk Bisnis Lokal",
      category: "Iklan",
      date: "3 Jun 2025",
      readTime: "5 menit",
      excerpt:
        "Dari targeting yang terlalu luas hingga budget yang asal jalan tanpa A/B testing — panduan dari pengalaman nyata menangani ratusan campaign.",
      cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
      link: "#",
    },
    {
      id: "art-3",
      title: "Cara Membangun Brand Identity yang Konsisten di Semua Platform Sosmed",
      category: "Branding",
      date: "28 Mei 2025",
      readTime: "6 menit",
      excerpt:
        "Brand yang kuat bukan cuma soal logo bagus. Ini adalah bahasa visual dan tone yang sama di Instagram, TikTok, sampai Google Business. Begini cara saya membangunnya.",
      cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
      link: "#",
    },
    {
      id: "art-4",
      title: "Local SEO: Rahasia Coffee Shop dan Resto Naik di Google Maps",
      category: "Local Business",
      date: "20 Mei 2025",
      readTime: "4 menit",
      excerpt:
        "Setelah optimasi puluhan Google Business Profile untuk bisnis F&B, ini insight jujur yang jarang dibahas di tutorial online.",
      cover: "",
      link: "#",
    },
    {
      id: "art-5",
      title: "Studi Kasus: Strategi Ads yang Bikin Penjualan Klien Naik 33%",
      category: "Case Study",
      date: "15 Mei 2025",
      readTime: "7 menit",
      excerpt:
        "Cerita nyata tentang campaign yang awalnya boncos, lalu dievaluasi ulang datanya, dan bagaimana satu perubahan strategi mengubah hasilnya total.",
      cover: "",
      link: "#",
    },
  ],
  gallery: [
    { id: "g1", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", caption: "Riset konten & data — daily routine" },
    { id: "g2", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80", caption: "Brainstorm strategi bareng tim klien" },
    { id: "g3", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", caption: "Edit konten — late night session" },
    { id: "g4", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80", caption: "Mapping content pillar di whiteboard" },
    { id: "g5", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80", caption: "Presentasi strategi campaign ke klien" },
    { id: "g6", image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&q=80", caption: "Monitoring performa iklan multi-platform" },
    { id: "g7", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", caption: "Meeting evaluasi campaign bulanan" },
    { id: "g8", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80", caption: "Workshop strategi konten tim" },
    { id: "g9", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80", caption: "Prototyping kalender konten" },
    { id: "g10", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80", caption: "Fokus analisa data audiens" },
    { id: "g11", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80", caption: "Onboarding klien baru" },
    { id: "g12", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", caption: "Ruang kerja studio kami" },
  ],
};

export default async (request, context) => {
  const store = contentStore();

  if (request.method === "GET") {
    const data = (await store.get("site", { type: "json" })) || DEFAULT_CONTENT;
    return json(data);
  }

  if (request.method === "PUT") {
    if (!isAuthed(context)) return json({ error: "Unauthorized" }, { status: 401 });
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Body tidak valid" }, { status: 400 });
    }
    await store.setJSON("site", body);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

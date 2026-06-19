// netlify/functions/analytics.mjs
// POST { path } -> publik, dipanggil sekali tiap halaman dibuka (lihat main.js)
// GET            -> admin only, ringkasan buat dashboard

import { analyticsStore, isAuthed, hashVisitor, json } from "./lib/utils.mjs";

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function deviceFromUA(ua = "") {
  const u = ua.toLowerCase();
  if (/ipad|tablet/.test(u)) return "tablet";
  if (/mobi|android|iphone/.test(u)) return "mobile";
  return "desktop";
}

export default async (request, context) => {
  const store = analyticsStore();

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "/";
    const ua = request.headers.get("user-agent") || "";
    const device = deviceFromUA(ua);
    const day = todayKey();
    // IP di-hash per hari, gak pernah disimpan mentah-mentah & gak bisa dibalik
    const visitorHash = hashVisitor(context.ip || "unknown", day);

    const key = `day:${day}`;
    const data = (await store.get(key, { type: "json" })) || {
      views: 0,
      uniques: [],
      pages: {},
      devices: { desktop: 0, mobile: 0, tablet: 0 },
    };
    data.views += 1;
    data.pages[path] = (data.pages[path] || 0) + 1;
    data.devices[device] = (data.devices[device] || 0) + 1;
    if (!data.uniques.includes(visitorHash)) data.uniques.push(visitorHash);
    await store.setJSON(key, data);

    return json({ ok: true });
  }

  if (request.method === "GET") {
    if (!isAuthed(context)) return json({ error: "Unauthorized" }, { status: 401 });

    const { blobs } = await store.list({ prefix: "day:" });
    const days = (
      await Promise.all(
        blobs.map(async (b) => {
          const data = await store.get(b.key, { type: "json" });
          return { date: b.key.replace("day:", ""), ...data };
        })
      )
    ).filter((d) => d && d.date);
    days.sort((a, b) => a.date.localeCompare(b.date));

    const today = todayKey();
    const todayData = days.find((d) => d.date === today);

    const totalViews = days.reduce((s, d) => s + (d.views || 0), 0);
    const totalUnique = days.reduce((s, d) => s + (d.uniques ? d.uniques.length : 0), 0);

    const pageTotals = {};
    const deviceTotals = { desktop: 0, mobile: 0, tablet: 0 };
    days.forEach((d) => {
      Object.entries(d.pages || {}).forEach(([p, c]) => {
        pageTotals[p] = (pageTotals[p] || 0) + c;
      });
      Object.entries(d.devices || {}).forEach(([k, c]) => {
        deviceTotals[k] = (deviceTotals[k] || 0) + c;
      });
    });
    const topPages = Object.entries(pageTotals)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const daily = days.map((d) => ({
      date: d.date,
      views: d.views || 0,
      unique: d.uniques ? d.uniques.length : 0,
      pages: d.pages || {},
    }));

    return json({
      totalViews,
      totalUnique,
      todayViews: todayData ? todayData.views : 0,
      todayUnique: todayData && todayData.uniques ? todayData.uniques.length : 0,
      topPages,
      daily,
      devices: deviceTotals,
    });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

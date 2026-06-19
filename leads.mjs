// netlify/functions/leads.mjs
// POST  { name, phone?, email?, message, source? } -> publik, dari form kontak
// GET   -> admin only, list semua leads (terbaru duluan)
// PATCH { id, status } -> admin only, update status lead

import { leadsStore, isAuthed, json } from "./lib/utils.mjs";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default async (request, context) => {
  const store = leadsStore();

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Body tidak valid" }, { status: 400 });
    }
    const { name, phone, email, message, source } = body || {};
    if (!name || !message) {
      return json({ error: "Nama dan pesan wajib diisi" }, { status: 400 });
    }
    const id = genId();
    const lead = {
      id,
      createdAt: new Date().toISOString(),
      source: source ? String(source).slice(0, 40) : "contact",
      name: String(name).slice(0, 200),
      phone: phone ? String(phone).slice(0, 50) : undefined,
      email: email ? String(email).slice(0, 200) : undefined,
      message: String(message).slice(0, 2000),
      status: "new",
    };
    await store.setJSON(`lead:${id}`, lead);
    return json({ ok: true, id });
  }

  if (request.method === "GET") {
    if (!isAuthed(context)) return json({ error: "Unauthorized" }, { status: 401 });
    const { blobs } = await store.list({ prefix: "lead:" });
    const leads = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return json(leads);
  }

  if (request.method === "PATCH") {
    if (!isAuthed(context)) return json({ error: "Unauthorized" }, { status: 401 });
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Body tidak valid" }, { status: 400 });
    }
    const { id, status } = body || {};
    if (!id || !status) return json({ error: "id dan status wajib diisi" }, { status: 400 });
    const lead = await store.get(`lead:${id}`, { type: "json" });
    if (!lead) return json({ error: "Lead tidak ditemukan" }, { status: 404 });
    lead.status = status;
    await store.setJSON(`lead:${id}`, lead);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

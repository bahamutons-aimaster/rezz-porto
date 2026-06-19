// netlify/functions/lib/utils.mjs
// Helper bersama buat semua function. File ini TIDAK jadi endpoint sendiri
// (Netlify cuma nge-treat file langsung di dalam netlify/functions/ sebagai
// endpoint, subfolder seperti lib/ aman dipakai buat shared code).

import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam

// ── Blob stores ───────────────────────────────────────────
export function contentStore() {
  return getStore("content");
}
export function leadsStore() {
  return getStore("leads");
}
export function analyticsStore() {
  return getStore("analytics");
}

// ── Auth (password admin + signed cookie, tanpa library tambahan) ──
function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD belum di-set. Buka Netlify dashboard → Site configuration → Environment variables, lalu tambahkan ADMIN_PASSWORD."
    );
  }
  return secret;
}

function signToken() {
  const secret = getSecret();
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expires);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  let secret;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  if (Date.now() > Number(payload)) return false; // kadaluarsa
  return true;
}

export function isAuthed(context) {
  const token = context.cookies.get(SESSION_COOKIE);
  return verifyToken(token);
}

export function setSessionCookie(context) {
  context.cookies.set({
    name: SESSION_COOKIE,
    value: signToken(),
    path: "/",
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
}

export function clearSessionCookie(context) {
  context.cookies.delete(SESSION_COOKIE);
}

export function checkPassword(input) {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(adminPw);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── Response helper ──────────────────────────────────────
export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });
}

// ── Privacy-friendly visitor hash (IP+UA di-hash per hari, gak bisa dibalik) ──
export function hashVisitor(ip, daySalt) {
  return crypto.createHash("sha256").update(`${ip}|${daySalt}`).digest("hex").slice(0, 24);
}

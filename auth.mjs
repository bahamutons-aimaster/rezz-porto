// netlify/functions/auth.mjs
// POST   { password } -> login, set cookie session
// GET    -> cek status login ({ authed: true/false })
// DELETE -> logout, hapus cookie

import { isAuthed, setSessionCookie, clearSessionCookie, checkPassword, json } from "./lib/utils.mjs";

export default async (request, context) => {
  if (request.method === "POST") {
    if (!process.env.ADMIN_PASSWORD) {
      return json(
        { error: "ADMIN_PASSWORD belum di-set di environment variable Netlify." },
        { status: 500 }
      );
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Body tidak valid" }, { status: 400 });
    }
    if (!checkPassword(body?.password)) {
      return json({ error: "Password salah" }, { status: 401 });
    }
    setSessionCookie(context);
    return json({ ok: true });
  }

  if (request.method === "GET") {
    return json({ authed: isAuthed(context) });
  }

  if (request.method === "DELETE") {
    clearSessionCookie(context);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

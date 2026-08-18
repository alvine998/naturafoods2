"use client";
const KEY = "nf_admin_auth";
// ponytail: replace with real API/auth when backend exists. Single hard-coded credential for demo.
const DEMO_USER = "admin";
const DEMO_PASS = "admin123";

export function isAuthed(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function login(user: string, pass: string): boolean {
  const ok = user === DEMO_USER && pass === DEMO_PASS;
  if (ok) try { localStorage.setItem(KEY, "1"); } catch {}
  return ok;
}
export function logout() { try { localStorage.removeItem(KEY); } catch {} }
export const DEMO_CRED_HINT = `${DEMO_USER} / ${DEMO_PASS}`;

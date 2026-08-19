"use client";
const KEY = "nf_admin_auth"; // stores username when authed
const USERS_KEY = "nf_admin_users";
export type AdminUser = { username: string; password: string };
// ponytail: plain-text demo; hash + backend when real auth exists
const SEED_USERS: AdminUser[] = [{ username: "admin", password: "admin123" }];

function loadUsers(): AdminUser[] {
  try { const v = localStorage.getItem(USERS_KEY); if (v) return JSON.parse(v) as AdminUser[]; } catch {}
  return [...SEED_USERS];
}
function saveUsers(users: AdminUser[]) { try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {} }

export function getUsers(): AdminUser[] { return loadUsers(); }
export function getCurrentUser(): string | null { try { return localStorage.getItem(KEY); } catch { return null; } }
export function isAuthed(): boolean {
  const u = getCurrentUser(); if (!u) return false;
  return loadUsers().some((x) => x.username === u);
}
export function login(user: string, pass: string): boolean {
  const ok = loadUsers().some((x) => x.username === user && x.password === pass);
  if (ok) try { localStorage.setItem(KEY, user); } catch {}
  return ok;
}
export function logout() { try { localStorage.removeItem(KEY); } catch {} }
export function addUser(username: string, password: string): boolean {
  username = username.trim(); if (!username || !password) return false;
  const users = loadUsers(); if (users.some((u) => u.username === username)) return false;
  users.push({ username, password }); saveUsers(users); return true;
}
export function removeUser(username: string): boolean {
  const users = loadUsers(); if (users.length <= 1) return false;
  if (getCurrentUser() === username) return false;
  const next = users.filter((u) => u.username !== username); if (next.length === users.length) return false;
  saveUsers(next); return true;
}
export function updatePassword(username: string, newPass: string): boolean {
  if (!newPass) return false;
  const users = loadUsers(); const idx = users.findIndex((u) => u.username === username); if (idx === -1) return false;
  users[idx] = { ...users[idx], password: newPass }; saveUsers(users); return true;
}
export const DEMO_CRED_HINT = `${SEED_USERS[0].username} / ${SEED_USERS[0].password}`;

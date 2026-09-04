"use client";
import { API_BASE, apiFetch, clearTokens, getAccessToken, getRefreshToken, setTokens } from "./api";

// Legacy localStorage keys (fallback for offline dev)
const LEGACY_KEY = "nf_admin_auth";
const USERS_KEY = "nf_admin_users";

export type AdminUserLegacy = { username: string; password: string };
export type AdminUser = {
  id: string;
  username: string;
  role: "admin" | "super_admin";
  createdAt: string;
  updatedAt: string;
};

const SEED_USERS: AdminUserLegacy[] = [{ username: "admin", password: "admin123" }];

function loadUsersLegacy(): AdminUserLegacy[] {
  try {
    const v = localStorage.getItem(USERS_KEY);
    if (v) return JSON.parse(v) as AdminUserLegacy[];
  } catch {}
  return [...SEED_USERS];
}
function saveUsersLegacy(users: AdminUserLegacy[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function getUsers(): AdminUserLegacy[] {
  return loadUsersLegacy();
}
export function getCurrentUser(): string | null {
  try {
    // Prefer API stored user
    const apiUser = localStorage.getItem("nf_user");
    if (apiUser) {
      const parsed = JSON.parse(apiUser) as { username?: string };
      if (parsed?.username) return parsed.username;
    }
    // fallback to access token existence? try to decode? just check legacy
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return legacy;
    // also check access token — if exists but nf_user missing, treat as authed but unknown user
    if (getAccessToken()) {
      // try to parse JWT payload for username? best effort
      try {
        const token = getAccessToken()!;
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        if (payload?.username) return String(payload.username);
      } catch {}
      return "admin";
    }
    return null;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  const token = getAccessToken();
  if (token) return true;
  const u = getCurrentUser();
  if (!u) return false;
  // legacy check
  return loadUsersLegacy().some((x) => x.username === u);
}

/**
 * Login — tries API POST /auth/login, falls back to local plaintext check.
 * On success stores nf_access_token / nf_refresh_token / nf_user and also legacy key for compat.
 */
export async function login(user: string, pass: string): Promise<boolean> {
  const username = user.trim();
  // Try API first
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: pass }),
    });
    const json = (await res.json().catch(() => null)) as
      | { success: boolean; data: { accessToken: string; refreshToken: string; expiresIn: number; user: { id: string; username: string; role: string } }; error: unknown }
      | null;
    if (res.ok && json?.success && json.data?.accessToken) {
      setTokens({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken, user: json.data.user });
      try {
        localStorage.setItem(LEGACY_KEY, json.data.user.username);
      } catch {}
      return true;
    }
    // If API returned 401, credentials wrong — don't fallback
    if (res.status === 401) return false;
    // otherwise fall through to local check on network error / 5xx
    if (res.ok === false && json && (json as unknown as { error?: { code?: string } })?.error) {
      // if API reachable but login failed with validation error, return false
      if (res.status >= 400 && res.status < 500) return false;
    }
  } catch {
    // network error — fall through to legacy
  }

  // Legacy fallback — plain text demo (offline dev)
  const ok = loadUsersLegacy().some((x) => x.username === username && x.password === pass);
  if (ok) {
    try {
      localStorage.setItem(LEGACY_KEY, username);
    } catch {}
    // also create dummy tokens so isAuthed works uniformly? don't create real tokens
  }
  return ok;
}

/**
 * Logout — calls POST /auth/logout with refreshToken, then clears all tokens.
 */
export async function logout(): Promise<void> {
  try {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    if (token && refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
  } catch {}
  clearTokens();
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

/**
 * Fetch current user from API GET /admin/me — falls back to local.
 */
export async function fetchMe(): Promise<AdminUser | null> {
  try {
    const json = await apiFetch<AdminUser>("/admin/me");
    if (json.success && json.data) return json.data;
  } catch {}
  const u = getCurrentUser();
  if (!u) return null;
  // synthesize legacy user
  return { id: u, username: u, role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

// Users CRUD — API-first with legacy fallback
export async function fetchUsers(params: Record<string, unknown> = {}): Promise<{ data: AdminUser[]; meta?: { page: number; limit: number; total: number; totalPages: number } | null }> {
  try {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    });
    const qs = q.toString() ? `?${q.toString()}` : "";
    const json = await apiFetch<AdminUser[]>(`/admin/users${qs}`);
    if (json.success) return { data: json.data ?? [], meta: json.meta };
  } catch {}
  // fallback: map legacy users to AdminUser shape
  const legacy = loadUsersLegacy().map((u, i) => ({
    id: `legacy-${u.username}`,
    username: u.username,
    role: "admin" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  // apply q filter if provided
  const qStr = (params.q as string | undefined)?.toLowerCase();
  const filtered = qStr ? legacy.filter((x) => x.username.toLowerCase().includes(qStr)) : legacy;
  return { data: filtered, meta: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 } };
}

export async function createUser(username: string, password: string): Promise<AdminUser> {
  try {
    const json = await apiFetch<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (json.success && json.data) return json.data;
    throw new Error(json.error?.message || "Failed to create user");
  } catch (e) {
    // if API not reachable, fallback to local
    const err = e as Error & { status?: number; code?: string };
    // if network error (status 0) treat as fallback
    if (!err.status || err.status === 0 || err.code === "NETWORK_ERROR") {
      username = username.trim();
      if (!username || !password) throw new Error("Username and password required");
      const users = loadUsersLegacy();
      if (users.some((u) => u.username === username)) throw new Error("Username already exists");
      users.push({ username, password });
      saveUsersLegacy(users);
      return { id: `legacy-${username}`, username, role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    throw e;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    // id may be legacy-username — handle fallback
    if (id.startsWith("legacy-")) {
      const username = id.replace("legacy-", "");
      const ok = removeUserLegacy(username);
      if (!ok) throw new Error("Cannot remove user");
      return;
    }
    await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
    return;
  } catch (e) {
    const err = e as Error & { status?: number; code?: string };
    if (!err.status || err.status === 0 || err.code === "NETWORK_ERROR") {
      // fallback already handled above
      throw e;
    }
    throw e;
  }
}

function removeUserLegacy(username: string): boolean {
  const users = loadUsersLegacy();
  if (users.length <= 1) return false;
  if (getCurrentUser() === username) return false;
  const next = users.filter((u) => u.username !== username);
  if (next.length === users.length) return false;
  saveUsersLegacy(next);
  return true;
}

export async function updateUserPassword(idOrUsername: string, newPass: string): Promise<void> {
  if (!newPass) throw new Error("Password required");
  try {
    // prefer API by id
    const id = idOrUsername.startsWith("legacy-") ? idOrUsername : idOrUsername;
    // if legacy fallback
    if (idOrUsername.startsWith("legacy-")) {
      const username = idOrUsername.replace("legacy-", "");
      const ok = updatePasswordLegacy(username, newPass);
      if (!ok) throw new Error("User not found");
      return;
    }
    // try API — if id is username-like, try PUT /admin/users/:id with password
    await apiFetch(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ password: newPass }),
    });
  } catch (e) {
    const err = e as Error & { status?: number; code?: string };
    if (!err.status || err.status === 0 || err.code === "NETWORK_ERROR" || (err.message && err.message.includes("Network"))) {
      // fallback to legacy username update
      const username = idOrUsername.replace("legacy-", "");
      const ok = updatePasswordLegacy(username, newPass);
      if (!ok) throw new Error("User not found");
      return;
    }
    throw e;
  }
}

function updatePasswordLegacy(username: string, newPass: string): boolean {
  if (!newPass) return false;
  const users = loadUsersLegacy();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], password: newPass };
  saveUsersLegacy(users);
  return true;
}

// Legacy sync helpers kept for backward compat (used by old pages if not migrated)
export function addUser(username: string, password: string): boolean {
  username = username.trim();
  if (!username || !password) return false;
  const users = loadUsersLegacy();
  if (users.some((u) => u.username === username)) return false;
  users.push({ username, password });
  saveUsersLegacy(users);
  return true;
}
export function removeUser(username: string): boolean {
  return removeUserLegacy(username);
}
export function updatePassword(username: string, newPass: string): boolean {
  return updatePasswordLegacy(username, newPass);
}

export const DEMO_CRED_HINT = `${SEED_USERS[0].username} / ${SEED_USERS[0].password}`;

// Validation helpers per backend spec
export const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;
export function validateUsername(u: string): string | null {
  const t = u.trim();
  if (t.length < 3 || t.length > 32) return "Username must be 3-32 chars";
  if (!USERNAME_RE.test(t)) return "Username may only contain letters, numbers, . _ -";
  if (t !== t.toLowerCase()) return "Username is lowercased";
  return null;
}

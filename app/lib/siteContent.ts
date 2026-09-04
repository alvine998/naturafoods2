"use client";
import { apiFetch } from "./api";

const KEY = "nf_content";

// ponytail: now API-first with localStorage fallback (FRONTEND_API_GUIDE.md:8)

export function loadRaw(): Record<string, unknown> {
  try {
    const v = localStorage.getItem(KEY);
    if (v) return JSON.parse(v);
  } catch {}
  return {};
}
export function saveRaw(v: Record<string, unknown>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
    try { window.dispatchEvent(new CustomEvent("nf_content_updated")); } catch {}
  } catch {}
}
export function getOverrides(): Record<string, Record<string, unknown>> {
  const raw = loadRaw() as Record<string, unknown>;
  return (raw as Record<string, Record<string, unknown>>) ?? {};
}
export function setOverrides(next: Record<string, Record<string, unknown>>) {
  saveRaw(next as unknown as Record<string, unknown>);
}
export function clearOverrides() {
  try {
    localStorage.removeItem(KEY);
    try { window.dispatchEvent(new CustomEvent("nf_content_updated")); } catch {}
  } catch {}
}

export function getLocaleOverrides(locale: string): Record<string, unknown> {
  const raw = loadRaw() as Record<string, unknown>;
  return (raw?.[locale] as Record<string, unknown>) ?? {};
}
export function setLocaleOverrides(locale: string, overrides: Record<string, unknown>) {
  const raw = loadRaw() as Record<string, unknown>;
  const next = { ...raw, [locale]: overrides };
  saveRaw(next);
}

// ---------------------------------------------------------------------------
// API — FRONTEND_API_GUIDE.md:8
// GET /site-content (all), GET /site-content/:locale, PUT /admin/site-content/:locale, DELETE
// ---------------------------------------------------------------------------

export async function fetchSiteContent(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const json = await apiFetch<Record<string, Record<string, unknown>>>("/site-content");
    if (json.success && json.data) {
      // cache to localStorage for offline
      saveRaw(json.data as unknown as Record<string, unknown>);
      return json.data;
    }
  } catch {}
  return getOverrides();
}

export async function fetchLocaleContent(locale: string): Promise<Record<string, unknown>> {
  try {
    const json = await apiFetch<Record<string, unknown>>(`/site-content/${encodeURIComponent(locale)}`);
    if (json.success && json.data) {
      setLocaleOverrides(locale, json.data);
      return json.data;
    }
  } catch {}
  return getLocaleOverrides(locale);
}

export async function saveLocaleContent(locale: string, overrides: Record<string, unknown>): Promise<void> {
  // optimistic local save
  setLocaleOverrides(locale, overrides);
  try {
    await apiFetch(`/admin/site-content/${encodeURIComponent(locale)}`, {
      method: "PUT",
      body: JSON.stringify(overrides),
    });
  } catch (e) {
    // if network error, keep local — will sync next time
    // if validation error, rethrow
    const status = (e as { status?: number })?.status;
    if (status && status >= 400 && status < 500) throw e;
  }
}

export async function deleteAllOverrides(): Promise<void> {
  clearOverrides();
  try {
    await apiFetch("/admin/site-content", { method: "DELETE" });
  } catch {}
}

export async function deleteLocaleOverrides(locale: string): Promise<void> {
  try {
    const raw = loadRaw() as Record<string, unknown>;
    if (raw[locale]) {
      delete raw[locale];
      saveRaw(raw);
    }
  } catch {}
  try {
    await apiFetch(`/admin/site-content/${encodeURIComponent(locale)}`, { method: "DELETE" });
  } catch {}
}

// deep merge: source overwrites target; arrays are replaced
export function deepMerge<T>(target: T, source: unknown): T {
  if (source === undefined) return target;
  if (source === null) return source as unknown as T;
  if (Array.isArray(source)) return source as unknown as T;
  if (typeof source !== "object") return source as unknown as T;
  if (typeof target !== "object" || target === null || Array.isArray(target)) return source as unknown as T;
  const out: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    out[k] = deepMerge((out[k] as unknown), v);
  }
  return out as T;
}

export function deepGet(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}
export function deepSet(obj: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> {
  if (path.length === 0) return (value as Record<string, unknown>) ?? obj;
  const clone: Record<string, unknown> = Array.isArray(obj) ? [...(obj as unknown[])] as unknown as Record<string, unknown> : { ...obj };
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const nxt = cur[k];
    const copy = nxt && typeof nxt === "object" && !Array.isArray(nxt) ? { ...(nxt as Record<string, unknown>) } : Array.isArray(nxt) ? [...(nxt as unknown[])] as unknown as Record<string, unknown> : {};
    cur[k] = copy;
    cur = copy as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
  return clone;
}

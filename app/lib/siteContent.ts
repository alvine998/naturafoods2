"use client";
const KEY = "nf_content";

// ponytail: localStorage only; replace with backend when multi-device persistence needed
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

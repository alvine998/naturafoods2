// lib/api.ts — Frontend API client per FRONTEND_API_GUIDE.md v1.0.0 & backend.md
// Base URL: http://localhost:4000/api/v1 (env NEXT_PUBLIC_API_URL)

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Envelope<T> = {
  success: boolean;
  data: T;
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
  error: { code: string; message: string; details: unknown; requestId: string } | null;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Token helpers (localStorage keys per FRONTEND_API_GUIDE.md:1)
// ---------------------------------------------------------------------------
const ACCESS_KEY = "nf_access_token";
const REFRESH_KEY = "nf_refresh_token";
const USER_KEY = "nf_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}
export function setTokens(tokens: { accessToken: string; refreshToken?: string; user?: unknown }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    if (tokens.user) localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  } catch {}
}
export function clearTokens() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    // legacy keys for migration cleanup — do NOT clear domain data here except auth
    localStorage.removeItem("nf_admin_auth");
  } catch {}
}
export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Query builder — matches FRONTEND_API_GUIDE.md:1 buildQuery
// ---------------------------------------------------------------------------
export function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------------------
// Core fetch — handles Envelope, 401 refresh retry, JSON errors
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;
  requestId: string | null;
  constructor(
    message: string,
    status: number,
    code: string,
    details: unknown,
    requestId: string | null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = (await res.json().catch(() => null)) as Envelope<{ accessToken: string; expiresIn?: number }> | null;
      if (res.ok && json?.success && json.data?.accessToken) {
        localStorage.setItem(ACCESS_KEY, json.data.accessToken);
        return true;
      }
      // refresh failed — clear tokens so user re-logins
      clearTokens();
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<Envelope<T>> {
  const token = getAccessToken();
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };
  // Only set JSON content type if not FormData and not already set
  if (!isFormData && !headers["Content-Type"] && !(opts.body == null)) {
    // only set when body exists and is not FormData
    const hasBody = opts.body !== undefined && opts.body !== null;
    if (hasBody) headers["Content-Type"] = "application/json";
  }
  // If body-less GET/DELETE without explicit content type, still send json header? guide says always send, but for GET omit.
  if (!isFormData && !headers["Content-Type"] && opts.method && ["POST", "PUT", "PATCH"].includes(opts.method.toUpperCase())) {
    headers["Content-Type"] = "application/json";
  }
  // For simple GETs guide sets Content-Type json anyway — ok to leave unset.

  // Only send Authorization for admin routes; public routes must be without header
  // per check: non "/admin" url is axios/fetch without header
  const needsAuth = path.startsWith("/admin");
  if (token && needsAuth) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...opts, headers });
  } catch (e) {
    throw new ApiError((e as Error).message || "Network error", 0, "NETWORK_ERROR", null, null);
  }

  // Try to parse JSON; some DELETE may return 204 empty
  let json: Envelope<T>;
  const text = await res.text();
  try {
    json = text ? (JSON.parse(text) as Envelope<T>) : ({ success: res.ok, data: null as unknown as T, meta: null, error: null } as Envelope<T>);
  } catch {
    // non-JSON response
    if (!res.ok) throw new ApiError(text || res.statusText || "Request failed", res.status, "INTERNAL_ERROR", null, null);
    // success but not json — return raw
    return { success: true, data: null as unknown as T, meta: null, error: null };
  }

  if (!res.ok && !json.error) {
    // envelope may have missing error — synthesize
    const msg = (json as unknown as { message?: string })?.message || res.statusText || "Request failed";
    throw new ApiError(msg, res.status, `HTTP_${res.status}`, (json as unknown as { details?: unknown })?.details ?? null, null);
  }

  // Handle 401 refresh once (avoid loop on /auth/refresh itself) — only for admin routes
  if (res.status === 401 && path !== "/auth/refresh" && !json.success && path.startsWith("/admin")) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // retry once with new token
      return apiFetch<T>(path, opts);
    }
  }

  if (!res.ok && json.error) {
    throw new ApiError(json.error.message || "Request failed", res.status, json.error.code || `HTTP_${res.status}`, json.error.details, json.error.requestId ?? null);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Convenience helpers matching FRONTEND_API_GUIDE.md
// ---------------------------------------------------------------------------

export async function uploadFile(file: File, folder: string): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new ApiError("Not authenticated", 401, "UNAUTHORIZED", null, null);
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await fetch(`${API_BASE}/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = (await res.json().catch(() => null)) as Envelope<{ url: string }> | null;
  if (!res.ok || !json?.success) {
    const msg = json?.error?.message || res.statusText || "Upload failed";
    throw new ApiError(msg, res.status, json?.error?.code || `HTTP_${res.status}`, json?.error?.details ?? null, json?.error?.requestId ?? null);
  }
  return json.data.url;
}

export async function uploadBase64(dataUrl: string, folder: string): Promise<string> {
  const json = await apiFetch<{ url: string }>("/admin/uploads/base64", {
    method: "POST",
    body: JSON.stringify({ dataUrl, folder }),
  });
  if (!json.success || !json.data?.url) throw new ApiError(json.error?.message || "Upload failed", 400, json.error?.code || "UPLOAD_FAILED", null, null);
  return json.data.url;
}

export async function deleteUpload(urlOrKey: { url?: string; key?: string }): Promise<void> {
  await apiFetch("/admin/uploads", {
    method: "DELETE",
    body: JSON.stringify(urlOrKey),
  });
}

// ---------------------------------------------------------------------------
// Domain-typed shortcuts (optional) — caller can also use apiFetch directly
// ---------------------------------------------------------------------------
export async function fetchProducts(params: Record<string, unknown> = {}) {
  const q = buildQuery(params);
  return apiFetch<unknown[]>(`/products${q}`);
}
export async function fetchHighlightedProducts(limit = 8) {
  // convenience alias per guide: /products/highlighted or /products?isHighlight=true&limit=8
  try {
    const j = await apiFetch<unknown[]>("/products/highlighted");
    if (j.success) return j;
  } catch {}
  return apiFetch<unknown[]>(`/products${buildQuery({ isHighlight: true, limit })}`);
}

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------
export function isApiConfigured(): boolean {
  // Always treat as configured; caller may fallback to localStorage on network error
  return !!API_BASE;
}

// Banner target links are authored by admins but can also arrive from the API
// or a stale localStorage cache, so only http(s) survives — blocks
// javascript:/data: XSS via href. Standalone (no imports) so the assert check
// `app/lib/safe-url.check.ts` can run it under `node --experimental-strip-types`.
export function safeHttpUrl(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

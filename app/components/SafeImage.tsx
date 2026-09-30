"use client";
import Image, { type ImageProps } from "next/image";

/**
 * CMS upload host. Originals there are multi-MB PNGs served from a slow origin;
 * /_next/image downloads the whole original for every width variant and aborts
 * after a hardcoded 7s upstream timeout, so those requests fail with 500.
 * Serve them straight from the CDN instead.
 */
const UNOPTIMIZED_HOSTS = ["cdn-naturafoods.alvineitsolutions.com"];

/**
 * R2 preview URLs (and data: previews) often fail inside next/image:
 * TLS cert / connectivity issues make /_next/image return 500.
 * Load those sources directly in the browser instead of via the optimizer.
 */
export function shouldUnoptimizeSrc(src: ImageProps["src"]): boolean {
  if (typeof src !== "string" || !src) return false;
  if (src.startsWith("data:")) return true;
  try {
    const url = new URL(src, "http://localhost.invalid");
    if (!/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    return (
      UNOPTIMIZED_HOSTS.includes(host) ||
      host.endsWith(".r2.dev") ||
      host.endsWith(".r2.cloudflarestorage.com")
    );
  } catch {
    return false;
  }
}

type SafeImageProps = ImageProps;

/** next/image wrapper that auto-unoptimizes flaky/slow remote hosts (CMS CDN, R2, data:). */
export default function SafeImage({ unoptimized, ...rest }: SafeImageProps) {
  const auto = unoptimized ?? shouldUnoptimizeSrc(rest.src);
  return <Image {...rest} unoptimized={auto} />;
}

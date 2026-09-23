"use client";
import Image, { type ImageProps } from "next/image";

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
    return host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}

type SafeImageProps = ImageProps;

/** next/image wrapper that auto-unoptimizes flaky remote hosts (R2, data:). */
export default function SafeImage({ unoptimized, ...rest }: SafeImageProps) {
  const auto = unoptimized ?? shouldUnoptimizeSrc(rest.src);
  return <Image {...rest} unoptimized={auto} />;
}

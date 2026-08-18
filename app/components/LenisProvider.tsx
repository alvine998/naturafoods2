"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.075,
      duration: 1.2,
      smoothWheel: true,
      gestureOrientation: "vertical",
    });
    // expose for anchors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lenis = lenis;
    return () => lenis.destroy();
  }, [enabled]);
  return null;
}

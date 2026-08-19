"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AdminProgress() {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a[href]");
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || !href.startsWith("/admin")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === pathname) return;
      } catch {}
      setPhase("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  useEffect(() => {
    if (prev.current === pathname) return;
    if (phase === "loading") {
      setPhase("done");
      const t = setTimeout(() => setPhase("idle"), 420);
      prev.current = pathname;
      return () => clearTimeout(t);
    }
    // navigation without click (router.push / back/forward) -> flash
    if (pathname?.startsWith("/admin")) {
      setPhase("loading");
      const t1 = setTimeout(() => setPhase("done"), 100);
      const t2 = setTimeout(() => setPhase("idle"), 520);
      prev.current = pathname;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prev.current = pathname;
  }, [pathname, phase]);

  if (!pathname?.startsWith("/admin")) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className={`h-full bg-[#2D4A22] ${phase === "idle" ? "opacity-0" : "opacity-100"}`}
        style={{
          width: phase === "idle" ? "0%" : phase === "loading" ? "78%" : "100%",
          transition:
            phase === "loading"
              ? "width 900ms cubic-bezier(0.4,0,0.2,1)"
              : phase === "done"
                ? "width 260ms ease-out, opacity 320ms ease 260ms"
                : "none",
          boxShadow: phase !== "idle" ? "0 0 10px rgba(45,74,34,0.35)" : "none",
        }}
      />
    </div>
  );
}

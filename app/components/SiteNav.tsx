"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { LanguageSwitcher, useLang } from "../i18n";

const PRODUCT_SUB = [
  {
    label: { en: "Chocolate", id: "Cokelat", zh: "巧克力" },
    desc: {
      en: "Couverture callets",
      id: "Callets couverture",
      zh: "调温纽扣巧克力",
    },
    href: "/products?cat=choco",
  },
  {
    label: { en: "Matcha", id: "Matcha", zh: "抹茶" },
    desc: {
      en: "Uji & Yame stone-milled",
      id: "Giling batu Uji & Yame",
      zh: "宇治·八女石磨",
    },
    href: "/products?cat=matcha",
  },
  {
    label: { en: "All Products", id: "Semua Produk", zh: "全部产品" },
    desc: { en: "Full catalog", id: "Katalog lengkap", zh: "完整目录" },
    href: "/products",
  },
];

export default function SiteNav() {
  const { locale, t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav: { label: string; href: string; dropdown?: typeof PRODUCT_SUB }[] =
    [
      { label: t.nav.about, href: "/about" },
      {
        label:
          locale === "id" ? "PRODUK" : locale === "zh" ? "产品" : "PRODUCTS",
        href: "/products",
        dropdown: PRODUCT_SUB,
      },
      {
        label:
          locale === "id" ? "ARTIKEL" : locale === "zh" ? "文章" : "ARTICLES",
        href: "/articles",
      },
      {
        label:
          locale === "id"
            ? "EDUKASI"
            : locale === "zh"
              ? "教育中心"
              : "EDUCATION",
        href: "/education",
      },
      {
        label:
          locale === "id"
            ? "INOVASI"
            : locale === "zh"
              ? "创新中心"
              : "INNOVATION",
        href: "/innovation",
      },
      {
        label:
          locale === "id"
            ? "SOSIAL MEDIA"
            : locale === "zh"
              ? "社交媒体"
              : "SOCIAL MEDIA",
        href: "/social-media",
      },
      {
        label:
          locale === "id" ? "KONTAK" : locale === "zh" ? "联系" : "CONTACT",
        href: "/contact",
      },
      {
        label: locale === "id" ? "KARIR" : locale === "zh" ? "招聘" : "CAREERS",
        href: "/careers",
      },
    ];

  const isActive = (href: string) =>
    pathname === href ||
    pathname?.startsWith(href + "?") ||
    (href !== "/" && pathname?.startsWith(href + "/"));

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all ${
          scrolled
            ? "border-[#2D4A22]/10 bg-white/90 shadow-[0_4px_24px_rgba(45,74,34,0.06)]"
            : "border-[#2D4A22]/[0.06] bg-white/75"
        }`}
      >
        <nav className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between gap-4 px-6 md:px-8">
          {/* left */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="NaturaFoods"
              className="h-7 w-auto object-contain md:h-14"
            />
          </Link>

          {/* center — desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {nav.map((n) =>
              n.dropdown ? (
                <div key={n.href} className="group relative">
                  <Link
                    href={n.href}
                    className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[11px] tracking-[0.16em] transition ${
                      isActive(n.href)
                        ? "text-[#2D4A22]"
                        : "text-[#2D4A22]/60 hover:text-[#2D4A22] hover:bg-[#2D4A22]/[0.06]"
                    }`}
                  >
                    {n.label}
                    <ChevronDown className="h-3 w-3 opacity-60 transition group-hover:rotate-180" />
                    {isActive(n.href) && (
                      <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px bg-[#2D4A22]/20" />
                    )}
                  </Link>
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="min-w-[320px] overflow-hidden rounded-[20px] border border-[#2D4A22]/10 bg-white p-2 shadow-[0_16px_48px_rgba(26,26,22,0.12)]">
                      {n.dropdown.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 hover:bg-white group/item"
                        >
                          <div>
                            <div className="text-[12px] font-medium tracking-[0.04em] text-[#2D4A22]">
                              {s.label[locale]}
                            </div>
                            <div className="text-[11px] tracking-[0.06em] text-[#8B6F47]">
                              {s.desc[locale]}
                            </div>
                          </div>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2D4A22]/10 text-[#2D4A22] transition group-hover/item:bg-[#2D4A22] group-hover/item:text-white">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative rounded-full px-3.5 py-2 text-[11px] tracking-[0.16em] transition ${
                    isActive(n.href)
                      ? "text-[#2D4A22]"
                      : "text-[#2D4A22]/60 hover:text-[#2D4A22] hover:bg-[#2D4A22]/[0.06]"
                  }`}
                >
                  {n.label}
                  {isActive(n.href) && (
                    <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px bg-[#2D4A22]/20" />
                  )}
                </Link>
              ),
            )}
          </div>

          {/* right */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <LanguageSwitcher className="hidden sm:flex" />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2D4A22]/15 bg-white text-[#2D4A22] shadow-sm transition hover:bg-white lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-[#1a1a16]/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-50 flex h-[100svh] max-h-[100dvh] w-[min(88vw,380px)] max-w-[380px] flex-col bg-white shadow-2xl supports-[height:100dvh]:h-[100dvh] lg:hidden"
            >
              <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#2D4A22]/10 px-5 sm:px-6 pt-[env(safe-area-inset-top)]">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="NaturaFoods"
                    className="h-7 w-auto"
                  />
                  <span className="text-[10px] tracking-[0.18em] text-[#8B6F47]">
                    MENU
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D4A22] text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 sm:py-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="grid gap-1">
                  {nav.map((n) =>
                    n.dropdown ? (
                      <div
                        key={n.href}
                        className="rounded-2xl border border-transparent has-[button[aria-expanded=true]]:border-[#2D4A22]/10 has-[button[aria-expanded=true]]:bg-white"
                      >
                        <div
                          className={`flex items-center ${prodOpen ? "px-2" : "px-0"}`}
                        >
                          <Link
                            href={n.href}
                            onClick={() => setOpen(false)}
                            className={`flex-1 py-3.5 text-[13px] tracking-[0.14em] ${isActive(n.href) ? "text-[#2D4A22]" : "text-[#2D4A22]/80"}`}
                          >
                            {n.label}
                          </Link>
                          <button
                            aria-expanded={prodOpen}
                            onClick={() => setProdOpen((v) => !v)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2D4A22]/10 bg-white text-[#2D4A22]"
                          >
                            <Plus
                              className={`h-3.5 w-3.5 transition ${prodOpen ? "rotate-45" : ""}`}
                            />
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {prodOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-3 pl-3">
                                <div className="grid gap-1 border-l border-[#2D4A22]/10 pl-3">
                                  {n.dropdown.map((s) => (
                                    <Link
                                      key={s.href}
                                      href={s.href}
                                      onClick={() => setOpen(false)}
                                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5"
                                    >
                                      <div>
                                        <div className="text-[12px] font-medium text-[#2D4A22]">
                                          {s.label[locale]}
                                        </div>
                                        <div className="text-[11px] text-[#8B6F47]">
                                          {s.desc[locale]}
                                        </div>
                                      </div>
                                      <ArrowRight className="h-3.5 w-3.5 text-[#2D4A22]" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-1 py-3.5 text-[13px] tracking-[0.14em] transition ${isActive(n.href) ? "text-[#2D4A22]" : "text-[#2D4A22]/80"}`}
                      >
                        {n.label}
                        <ArrowRight className="h-3.5 w-3.5 text-[#C4B5A0]" />
                      </Link>
                    ),
                  )}
                </div>

                <div className="mt-8 grid gap-3 border-t border-[#2D4A22]/10 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.16em] text-[#8B6F47]">
                      LANGUAGE
                    </span>
                    <LanguageSwitcher />
                  </div>
                  <Link
                    href="/admin/login"
                    onClick={() => setOpen(false)}
                    className="text-center text-[11px] tracking-[0.14em] text-[#8B6F47] hover:text-[#2D4A22]"
                  >
                    ADMIN LOGIN
                  </Link>
                </div>
              </div>

              <div className="shrink-0 border-t border-[#2D4A22]/10 bg-white px-5 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="text-[11px] leading-5 text-[#8B6F47]">
                  PT NaturaFoods Distribusi
                  <br />
                  Jakarta · Surabaya · Bali
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

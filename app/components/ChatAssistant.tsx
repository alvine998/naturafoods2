"use client";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLang } from "../i18n";
import { DEFAULT_ASSISTANT, loadAssistantConfig, getCopy, fetchAssistantConfig } from "../lib/assistant";

// WhatsApp-only floating button — replaces previous AI chat panel.
// Keeps admin-configurable waLink (localStorage `nf_assistant_config`) and i18n label.
export default function ChatAssistant() {
  const { locale } = useLang();
  const [waLink, setWaLink] = useState(DEFAULT_ASSISTANT.waLink);
  const [label, setLabel] = useState(DEFAULT_ASSISTANT.copy.en.wa);

  useEffect(() => {
    const syncLocal = () => {
      const cfg = loadAssistantConfig();
      setWaLink(cfg.waLink || DEFAULT_ASSISTANT.waLink);
      setLabel(getCopy(cfg, locale).wa || DEFAULT_ASSISTANT.copy.en.wa);
    };
    syncLocal();
    // Hydrate from API (public GET /assistant/config, cached 5min per guide)
    fetchAssistantConfig()
      .then((cfg) => {
        setWaLink(cfg.waLink || DEFAULT_ASSISTANT.waLink);
        setLabel(getCopy(cfg, locale).wa || DEFAULT_ASSISTANT.copy.en.wa);
      })
      .catch(() => {});
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nf_assistant_config") syncLocal();
    };
    window.addEventListener("storage", onStorage);
    const id = setInterval(syncLocal, 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [locale]);

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35),0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-all duration-200 hover:bg-[#1EBE5D] hover:shadow-[0_12px_32px_rgba(37,211,102,0.45),0_6px_16px_rgba(0,0,0,0.14)] hover:scale-[1.04] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      {/* subtle inner highlight */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent opacity-60" />
      <MessageCircle aria-hidden="true" className="relative h-7 w-7 shrink-0 fill-white stroke-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" strokeWidth={2} />
      <span className="sr-only">{label}</span>
    </a>
  );
}

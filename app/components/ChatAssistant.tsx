"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, MessageCircle, Send, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useLang } from "../i18n";
import { Input } from "@/components/ui/input";
import { DEFAULT_ASSISTANT, loadAssistantConfig, getCopy, resolveReply, type AssistantConfig } from "../lib/assistant";

type Msg = { role: "user" | "bot"; text: string };

export default function ChatAssistant() {
  const { locale } = useLang();
  const [cfg, setCfg] = useState<AssistantConfig>(DEFAULT_ASSISTANT);
  const copy = getCopy(cfg, locale);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: getCopy(DEFAULT_ASSISTANT, locale).greet }]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCfg(loadAssistantConfig());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nf_assistant_config") setCfg(loadAssistantConfig());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // live reload when admin saves in same tab: poll localStorage via custom event
  useEffect(() => {
    const tick = () => setCfg(loadAssistantConfig());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setMsgs([{ role: "bot", text: copy.greet }]); }, [copy.greet]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { role: "bot", text: resolveReply(cfg, q, locale) }]);
    }, 500 + Math.random() * 300);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with virtual assistant"}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D4A22] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-[#1e3317] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A22] focus-visible:ring-offset-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="flex"><X className="h-5 w-5" /></motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><MessageCircle className="h-4 w-4" /></span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#22c55e] border-2 border-[#2D4A22]" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed bottom-[84px] right-4 sm:right-6 z-50 flex w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-[24px] border border-[#2D4A22]/10 bg-white shadow-[0_16px_48px_rgba(26,26,22,0.18)] max-h-[min(68vh,560px)]"
          >
            {/* header */}
            <div className="flex items-center gap-3 bg-[#2D4A22] px-4 py-4 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Sparkles className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-none">{copy.title}</p>
                <p className="mt-1 text-[11px] leading-none text-white/70">{copy.sub}</p>
              </div>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] tracking-[0.08em]">● ONLINE</span>
            </div>

            {/* messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto bg-[#FFFCF2] px-3 py-4 sm:px-4 space-y-3">
              {msgs.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 ${m.role === "user" ? "bg-[#2D4A22] text-white rounded-br-md" : "bg-white border border-[#2D4A22]/10 text-[#2D4A22] rounded-bl-md shadow-[0_2px_8px_rgba(26,26,22,0.04)]"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white border border-[#2D4A22]/10 px-3.5 py-2.5 text-[#8B6F47]">
                    <span className="flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B6F47]/60" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B6F47]/60" style={{ animationDelay: "120ms" }} /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B6F47]/60" style={{ animationDelay: "240ms" }} /></span>
                  </div>
                </div>
              )}
            </div>

            {/* quick chips + human handoff */}
            <div className="border-t border-[#2D4A22]/10 bg-white px-3 py-3">
              <div className="flex flex-wrap gap-1.5">
                {copy.quick.map((q: string) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-3 py-1.5 text-[11px] tracking-[0.04em] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white transition">
                    {q}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <a href={cfg.waLink} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2D4A22] py-2 text-center text-[11px] tracking-[0.08em] text-white hover:bg-[#1e3317]">{copy.wa} <ArrowUpRight className="h-3 w-3" /></a>
                <Link href="/contact" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#2D4A22]/15 bg-white py-2 text-center text-[11px] tracking-[0.08em] text-[#2D4A22] hover:bg-[#FFFCF2]">{copy.contact}</Link>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-center gap-2 rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-2 py-1.5 focus-within:border-[#2D4A22]/30 focus-within:bg-white">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={copy.placeholder} className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-auto py-1" />
                <button type="submit" disabled={!input.trim()} className="inline-flex items-center gap-1 rounded-full bg-[#2D4A22] px-4 py-2 text-[11px] tracking-[0.08em] text-white disabled:opacity-40 hover:bg-[#1e3317]"><Send className="h-3 w-3" /> {copy.send}</button>
              </form>
              <p className="mt-2 text-center text-[10px] leading-4 text-[#8B6F47]">AI helper — for accurate quote, our team replies within 24h.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

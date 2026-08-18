"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, MessageCircle, Send, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useLang } from "../i18n";

type Msg = { role: "user" | "bot"; text: string };

const COPY: Record<string, { title: string; sub: string; placeholder: string; send: string; quick: string[]; greet: string; fallback: string; wa: string; contact: string }> = {
  en: {
    title: "Natura Assistant",
    sub: "Virtual assistant · replies instantly",
    placeholder: "Ask about products, price, delivery...",
    send: "Send",
    quick: ["Products", "Price list", "Delivery", "Training"],
    greet: "Hi! I'm Natura Assistant — your virtual helper for choco & matcha. Ask me about products, MOQ, cold-chain delivery, or training. How can I help?",
    fallback: "I can help with products, pricing (MOQ 6kg), 48h Jabodetabek delivery, cold-chain, and barista training. Try a quick question or contact our team.",
    wa: "Chat on WhatsApp",
    contact: "Contact form",
  },
  id: {
    title: "Asisten Natura",
    sub: "Asisten virtual · balas instan",
    placeholder: "Tanya produk, harga, pengiriman...",
    send: "Kirim",
    quick: ["Produk", "Daftar harga", "Pengiriman", "Pelatihan"],
    greet: "Hai! Saya Asisten Natura — helper virtual untuk choco & matcha. Tanya soal produk, MOQ, pengiriman cold-chain, atau pelatihan. Ada yang bisa dibantu?",
    fallback: "Saya bisa bantu soal produk, harga (MOQ 6kg), pengiriman 48 jam Jabodetabek, cold-chain, dan pelatihan barista. Coba pertanyaan cepat atau hubungi tim kami.",
    wa: "Chat WhatsApp",
    contact: "Form kontak",
  },
  zh: {
    title: "Natura 智能助手",
    sub: "虚拟助手 · 即时回复",
    placeholder: "咨询产品、价格、配送...",
    send: "发送",
    quick: ["产品", "报价单", "配送", "培训"],
    greet: "你好！我是 Natura 智能助手，帮你了解巧克力与抹茶。可咨询产品、MOQ、冷链配送或培训。需要什么帮助？",
    fallback: "我可以解答产品、价格（MOQ 6kg）、雅加达都市圈48小时配送、冷链与咖啡师培训。试试快捷问题或联系人工。",
    wa: "WhatsApp 咨询",
    contact: "联系表单",
  },
};

function getReply(q: string, locale: string): string {
  const s = q.toLowerCase();
  const is = (k: string[]) => k.some((x) => s.includes(x));
  if (is(["price", "pricing", "catalog", "moq", "wholesale", "harga", "katalog", "报价", "价格", "批发"])) {
    if (locale === "id") return "MOQ grosir mulai 6kg, reorder fleksibel, konsinyasi untuk mitra volume tinggi (Net-14). Minta daftar harga + sampel di /contact atau chat Sales via WhatsApp. Mau saya carikan produk choco atau matcha?";
    if (locale === "zh") return "批发 MOQ 6kg 起，灵活补货，高销量可寄售（Net-14）。可在 /contact 索取报价单与样品，或转人工 WhatsApp。需要巧克力还是抹茶？";
    return "Wholesale MOQ from 6kg, flexible reorder, consignment for high-volume (Net-14). Get price list + samples at /contact or chat Sales via WhatsApp. Looking for choco or matcha?";
  }
  if (is(["delivery", "shipping", "cold chain", "cold-chain", "logistics", "warehouse", "stock", "pengiriman", "logistik", "gudang", "stok", "配送", "物流", "冷链", "仓储"])) {
    if (locale === "id") return "Gudang di Jakarta suhu tercatat (choco 18–20°C, matcha 5°C), traceability batch + COA on request. Pengiriman Jabodetabek 48 jam, nasional via cold-chain. Penggantian jika meleleh/rusak.";
    if (locale === "zh") return "雅加达温控仓储（巧克力 18–20°C，抹茶 5°C），批次可追溯、按需提供 COA。雅加达都市圈48小时达，全国冷链。融化/破损包换。";
    return "Temp-logged Jakarta warehouse (choco 18–20°C, matcha 5°C), batch traceability + COA on request. 48h Jabodetabek, nationwide cold-chain. Replacements for melt/damage.";
  }
  if (is(["matcha", "uji", "yame", "ceremonial", "culinary", "hojicha", "nishio", "抹茶", "宇治", "焙茶"])) {
    if (locale === "id") return "Matcha giling batu Uji & Yame, segel nitrogen: Ceremonial Grade A (30g/500g) untuk usucha, Grade B 1kg untuk latte/bakery, dan Hojicha low-caffeine. Stok Jakarta, siap 48 jam. Lihat di /products?cat=matcha";
    if (locale === "zh") return "宇治·八女石磨、氮气密封：仪式级 A级（30g/500g）用于薄茶/浓茶，料理级 B级 1kg 用于拿铁/烘焙，另有低咖啡因焙茶。雅加达现货，48小时达。查看 /products?cat=matcha";
    return "Stone-milled Uji & Yame, nitrogen-sealed: Ceremonial Grade A (30g/500g) for usucha, Culinary Grade B 1kg for latte/bakery, plus Hojicha low-caffeine. Jakarta stock, 48h ready. See /products?cat=matcha";
  }
  if (is(["choco", "chocolate", "couverture", "cokelat", "coklat", "temper", "ganache", "callets", "巧克力"])) {
    if (locale === "id") return "Couverture Belgia & Ekuador bentuk callets: Dark 72% single-origin, Milk 33% creamy, White 28% — stabil temper untuk minuman, pastry & cetakan. Lihat di /products?cat=choco. Butuh panduan tempering? Cek /articles";
    if (locale === "zh") return "比利时与厄瓜多尔纽扣调温巧克力：72% 黑巧单一产地、33% 牛奶、28% 白巧 — 回温稳定，适用于饮品/甜点/模具。查看 /products?cat=choco，调温指南见 /articles";
    return "Belgian & Ecuadorian callets: Dark 72% single-origin, Milk 33% creamy, White 28% — stable temper for drinks, pastry & moulding. See /products?cat=choco. Need tempering guide? Check /articles";
  }
  if (is(["training", "education", "workshop", "barista", "pastry", "costing", "edukasi", "pelatihan", "kelas", "培训", "教育", "课程"])) {
    if (locale === "id") return "Edukasi: Barista Matcha Essentials (1 hari Jakarta), Choco Pastry Lab (2 hari Surabaya), dan Menu Costing (half-day online). Gratis untuk mitra. Daftar di /education atau /contact";
    if (locale === "zh") return "培训：抹茶咖啡师基础（1天 雅加达）、巧克力甜点实验室（2天 泗水）、菜单成本（半天 线上）。合作伙伴免费。报名见 /education 或 /contact";
    return "Education: Barista Matcha Essentials (1 day Jakarta), Choco Pastry Lab (2 days Surabaya), Menu Costing (half-day online). Free for partners. Join at /education or /contact";
  }
  if (is(["innovation", "r&d", "nusantara", "low sugar", "packaging", "inovasi", "研发", "创新"])) {
    if (locale === "id") return "Inovasi: Nusantara Single-Origin (Sulawesi), Low-Sugar Couverture (30% less sugar), dan kemasan retail nitrogen-seal 500g. Lihat slide penuh di /innovation — tiap slide bisa link ke YouTube.";
    if (locale === "zh") return "创新：Nusantara 单一产地（苏拉威西）、低糖调温巧克力（少糖30%）、500g 氮封零售包。全屏轮播见 /innovation，支持 YouTube 外链。";
    return "Innovation: Nusantara Single-Origin (Sulawesi), Low-Sugar Couverture (30% less sugar), Nitrogen-sealed 500g retail packs. See full-height slider at /innovation — each slide links to YouTube.";
  }
  if (is(["contact", "whatsapp", "email", "phone", "hubungi", "alamat", "kontak", "联系", "电话", "邮箱"])) {
    if (locale === "id") return "Hubungi: hello@naturafoods.id · +62 812-3456-7890 (WA) · PT NaturaFoods Jakarta·Surabaya·Bali. Jam 09:00–18:00 WIB. Form di /contact";
    if (locale === "zh") return "联系：hello@naturafoods.id · +62 812-3456-7890 (WhatsApp) · 雅加达·泗水·巴厘岛。时间 09:00–18:00 WIB。表单见 /contact";
    return "Contact: hello@naturafoods.id · +62 812-3456-7890 (WA) · Jakarta·Surabaya·Bali. Hours 09:00–18:00 WIB. Form at /contact";
  }
  if (is(["hello", "hi", "hey", "halo", "hai", "help", "bantu", "你好", "您好"])) {
    return COPY[locale]?.greet ?? COPY.en.greet;
  }
  return COPY[locale]?.fallback ?? COPY.en.fallback;
}

export default function ChatAssistant() {
  const { locale } = useLang();
  const copy = COPY[locale] ?? COPY.en;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: copy.greet }]);
  const listRef = useRef<HTMLDivElement>(null);

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
      setMsgs((m) => [...m, { role: "bot", text: getReply(q, locale) }]);
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
                {copy.quick.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-3 py-1.5 text-[11px] tracking-[0.04em] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white transition">
                    {q}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2D4A22] py-2 text-center text-[11px] tracking-[0.08em] text-white hover:bg-[#1e3317]">{copy.wa} <ArrowUpRight className="h-3 w-3" /></a>
                <Link href="/contact" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#2D4A22]/15 bg-white py-2 text-center text-[11px] tracking-[0.08em] text-[#2D4A22] hover:bg-[#FFFCF2]">{copy.contact}</Link>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-center gap-2 rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-2 py-1.5 focus-within:border-[#2D4A22]/30 focus-within:bg-white">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={copy.placeholder} className="flex-1 bg-transparent px-2 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none" />
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

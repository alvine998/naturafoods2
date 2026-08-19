"use client";
import { useEffect, useState } from "react";

export type LocaleCopy = {
  title: string;
  sub: string;
  placeholder: string;
  send: string;
  quick: string[];
  greet: string;
  fallback: string;
  wa: string;
  contact: string;
};

export type KnowledgeEntry = {
  id: string;
  keywords: string[]; // comma-split, matched lowercased includes
  reply: Record<string, string>; // locale -> reply
};

export type AssistantTuning = {
  tone: "friendly" | "professional" | "concise";
  length: "short" | "medium" | "detailed";
  strict: boolean; // if true, never fall back to generic; use fallback copy only
};

export type AssistantConfig = {
  waLink: string; // e.g. https://wa.me/6281234567890
  persona: string; // system prompt / fine-tune instruction, used as context
  tuning: AssistantTuning;
  copy: Record<string, LocaleCopy>;
  knowledge: KnowledgeEntry[];
};

export const ASSISTANT_KEY = "nf_assistant_config";

export const DEFAULT_COPY: Record<string, LocaleCopy> = {
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

export const DEFAULT_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "pricing",
    keywords: ["price", "pricing", "catalog", "moq", "wholesale", "harga", "katalog", "报价", "价格", "批发"],
    reply: {
      en: "Wholesale MOQ from 6kg, flexible reorder, consignment for high-volume (Net-14). Get price list + samples at /contact or chat Sales via WhatsApp. Looking for choco or matcha?",
      id: "MOQ grosir mulai 6kg, reorder fleksibel, konsinyasi untuk mitra volume tinggi (Net-14). Minta daftar harga + sampel di /contact atau chat Sales via WhatsApp. Mau saya carikan produk choco atau matcha?",
      zh: "批发 MOQ 6kg 起，灵活补货，高销量可寄售（Net-14）。可在 /contact 索取报价单与样品，或转人工 WhatsApp。需要巧克力还是抹茶？",
    },
  },
  {
    id: "delivery",
    keywords: ["delivery", "shipping", "cold chain", "cold-chain", "logistics", "warehouse", "stock", "pengiriman", "logistik", "gudang", "stok", "配送", "物流", "冷链", "仓储"],
    reply: {
      en: "Temp-logged Jakarta warehouse (choco 18–20°C, matcha 5°C), batch traceability + COA on request. 48h Jabodetabek, nationwide cold-chain. Replacements for melt/damage.",
      id: "Gudang di Jakarta suhu tercatat (choco 18–20°C, matcha 5°C), traceability batch + COA on request. Pengiriman Jabodetabek 48 jam, nasional via cold-chain. Penggantian jika meleleh/rusak.",
      zh: "雅加达温控仓储（巧克力 18–20°C，抹茶 5°C），批次可追溯、按需提供 COA。雅加达都市圈48小时达，全国冷链。融化/破损包换。",
    },
  },
  {
    id: "matcha",
    keywords: ["matcha", "uji", "yame", "ceremonial", "culinary", "hojicha", "nishio", "抹茶", "宇治", "焙茶"],
    reply: {
      en: "Stone-milled Uji & Yame, nitrogen-sealed: Ceremonial Grade A (30g/500g) for usucha, Culinary Grade B 1kg for latte/bakery, plus Hojicha low-caffeine. Jakarta stock, 48h ready. See /products?cat=matcha",
      id: "Matcha giling batu Uji & Yame, segel nitrogen: Ceremonial Grade A (30g/500g) untuk usucha, Grade B 1kg untuk latte/bakery, dan Hojicha low-caffeine. Stok Jakarta, siap 48 jam. Lihat di /products?cat=matcha",
      zh: "宇治·八女石磨、氮气密封：仪式级 A级（30g/500g）用于薄茶/浓茶，料理级 B级 1kg 用于拿铁/烘焙，另有低咖啡因焙茶。雅加达现货，48小时达。查看 /products?cat=matcha",
    },
  },
  {
    id: "choco",
    keywords: ["choco", "chocolate", "couverture", "cokelat", "coklat", "temper", "ganache", "callets", "巧克力"],
    reply: {
      en: "Belgian & Ecuadorian callets: Dark 72% single-origin, Milk 33% creamy, White 28% — stable temper for drinks, pastry & moulding. See /products?cat=choco. Need tempering guide? Check /articles",
      id: "Couverture Belgia & Ekuador bentuk callets: Dark 72% single-origin, Milk 33% creamy, White 28% — stabil temper untuk minuman, pastry & cetakan. Lihat di /products?cat=choco. Butuh panduan tempering? Cek /articles",
      zh: "比利时与厄瓜多尔纽扣调温巧克力：72% 黑巧单一产地、33% 牛奶、28% 白巧 — 回温稳定，适用于饮品/甜点/模具。查看 /products?cat=choco，调温指南见 /articles",
    },
  },
  {
    id: "training",
    keywords: ["training", "education", "workshop", "barista", "pastry", "costing", "edukasi", "pelatihan", "kelas", "培训", "教育", "课程"],
    reply: {
      en: "Education: Barista Matcha Essentials (1 day Jakarta), Choco Pastry Lab (2 days Surabaya), Menu Costing (half-day online). Free for partners. Join at /education or /contact",
      id: "Edukasi: Barista Matcha Essentials (1 hari Jakarta), Choco Pastry Lab (2 hari Surabaya), dan Menu Costing (half-day online). Gratis untuk mitra. Daftar di /education atau /contact",
      zh: "培训：抹茶咖啡师基础（1天 雅加达）、巧克力甜点实验室（2天 泗水）、菜单成本（半天 线上）。合作伙伴免费。报名见 /education 或 /contact",
    },
  },
  {
    id: "innovation",
    keywords: ["innovation", "r&d", "nusantara", "low sugar", "packaging", "inovasi", "研发", "创新"],
    reply: {
      en: "Innovation: Nusantara Single-Origin (Sulawesi), Low-Sugar Couverture (30% less sugar), Nitrogen-sealed 500g retail packs. See full-height slider at /innovation — each slide links to YouTube.",
      id: "Inovasi: Nusantara Single-Origin (Sulawesi), Low-Sugar Couverture (30% less sugar), dan kemasan retail nitrogen-seal 500g. Lihat slide penuh di /innovation — tiap slide bisa link ke YouTube.",
      zh: "创新：Nusantara 单一产地（苏拉威西）、低糖调温巧克力（少糖30%）、500g 氮封零售包。全屏轮播见 /innovation，支持 YouTube 外链。",
    },
  },
  {
    id: "contact",
    keywords: ["contact", "whatsapp", "email", "phone", "hubungi", "alamat", "kontak", "联系", "电话", "邮箱"],
    reply: {
      en: "Contact: hello@naturafoods.id · +62 812-3456-7890 (WA) · Jakarta·Surabaya·Bali. Hours 09:00–18:00 WIB. Form at /contact",
      id: "Hubungi: hello@naturafoods.id · +62 812-3456-7890 (WA) · PT NaturaFoods Jakarta·Surabaya·Bali. Jam 09:00–18:00 WIB. Form di /contact",
      zh: "联系：hello@naturafoods.id · +62 812-3456-7890 (WhatsApp) · 雅加达·泗水·巴厘岛。时间 09:00–18:00 WIB。表单见 /contact",
    },
  },
];

export const DEFAULT_TUNING: AssistantTuning = { tone: "friendly", length: "medium", strict: false };

export const DEFAULT_ASSISTANT: AssistantConfig = {
  waLink: "https://wa.me/6281234567890",
  persona: "You are Natura Assistant for PT Natura Inti Sukses — helpful, concise, B2B, focused on choco & matcha, MOQ 6kg, cold-chain, training. Reply in user's language.",
  tuning: DEFAULT_TUNING,
  copy: DEFAULT_COPY,
  knowledge: DEFAULT_KNOWLEDGE,
};

export function loadAssistantConfig(): AssistantConfig {
  try {
    const raw = localStorage.getItem(ASSISTANT_KEY);
    if (!raw) return structuredClone(DEFAULT_ASSISTANT) as AssistantConfig;
    const parsed = JSON.parse(raw) as Partial<AssistantConfig>;
    // shallow merge with defaults for missing locales/fields
    return {
      waLink: parsed.waLink || DEFAULT_ASSISTANT.waLink,
      persona: parsed.persona ?? DEFAULT_ASSISTANT.persona,
      tuning: { ...DEFAULT_TUNING, ...(parsed.tuning as any) },
      copy: {
        en: { ...DEFAULT_COPY.en, ...(parsed.copy as any)?.en },
        id: { ...DEFAULT_COPY.id, ...(parsed.copy as any)?.id },
        zh: { ...DEFAULT_COPY.zh, ...(parsed.copy as any)?.zh },
      } as Record<string, LocaleCopy>,
      knowledge: Array.isArray(parsed.knowledge) && parsed.knowledge.length ? (parsed.knowledge as KnowledgeEntry[]) : DEFAULT_KNOWLEDGE,
    };
  } catch {
    return structuredClone(DEFAULT_ASSISTANT) as AssistantConfig;
  }
}

export function saveAssistantConfig(cfg: AssistantConfig) {
  try {
    localStorage.setItem(ASSISTANT_KEY, JSON.stringify(cfg));
  } catch {}
}

export function getCopy(cfg: AssistantConfig, locale: string): LocaleCopy {
  return cfg.copy[locale] ?? cfg.copy.en ?? DEFAULT_COPY.en;
}

function applyTuning(text: string, tuning: AssistantTuning): string {
  let out = text.trim();
  if (tuning.tone === "concise") out = out.replace(/\s+/g, " ").trim();
  if (tuning.tone === "professional") out = out.replace(/!+/g, ".");
  if (tuning.length === "short") {
    const first = out.split(/(?<=[.!?])\s+/)[0];
    if (first && first.length < out.length) out = first;
  } else if (tuning.length === "detailed") {
    // keep as-is; persona already guides detail; hook for LLM expansion later
  }
  return out;
}

export function resolveReply(cfg: AssistantConfig, q: string, locale: string): string {
  const tuning = cfg.tuning ?? DEFAULT_TUNING;
  const s = q.toLowerCase();
  for (const entry of cfg.knowledge) {
    if (entry.keywords.some((k) => s.includes(k.toLowerCase()))) {
      const raw = entry.reply[locale] ?? entry.reply.en ?? entry.reply.id ?? Object.values(entry.reply)[0] ?? getCopy(cfg, locale).fallback;
      return applyTuning(raw, tuning);
    }
  }
  if (["hello", "hi", "hey", "halo", "hai", "help", "bantu", "你好", "您好"].some((k) => s.includes(k))) {
    return applyTuning(getCopy(cfg, locale).greet, tuning);
  }
  return applyTuning(getCopy(cfg, locale).fallback, tuning);
}

export function useAssistantConfig() {
  const [cfg, setCfg] = useState<AssistantConfig>(DEFAULT_ASSISTANT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setCfg(loadAssistantConfig());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) saveAssistantConfig(cfg);
  }, [cfg, ready]);
  const reset = () => {
    const d = structuredClone(DEFAULT_ASSISTANT) as AssistantConfig;
    setCfg(d);
    try {
      localStorage.removeItem(ASSISTANT_KEY);
    } catch {}
  };
  return { cfg, setCfg, ready, reset };
}

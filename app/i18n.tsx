"use client";
import { createContext, useContext, useEffect, useState } from "react";

export const locales = ["id", "en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const localeLabels: Record<Locale, string> = { id: "ID", en: "EN", zh: "中文" };
const STORAGE_KEY = "locale";

type Slide = { type: "image" | "video"; src: string; poster?: string; eyebrow: string; title: string; desc: string; cta: string; ctaId: string };
type Product = { title: string; note: string; tag: string; img: string };

type Dict = {
  nav: { about: string; choco: string; matcha: string; partners: string; contact: string; becomePartner: string };
  heroBadge: string;
  heroTitle1: string; heroTitleItalic: string; heroTitleAfterItalic: string; heroTitleLine3: string; heroTitleLine4: string; heroDesc: string;
  viewCatalog: string; companyProfile: string;
  stat1k: string; stat1v: string; stat2k: string; stat2v: string; stat3k: string; stat3v: string;
  cardChocoLabel: string; cardMatchaLabel: string; cardPriceEyebrow: string; cardPriceTitle: string; cardPriceSub: string; cardRequestPrice: string;
  marquee: string[]; aboutEyebrow: string; aboutTitle1: string; aboutTitle2: string; aboutDesc: string; aboutBullets: string[]; aboutQuote: string; aboutQuoteAttr: string; aboutBadges: string[];
  chocoEyebrow: string; chocoTitle1: string; chocoTitle2: string; chocoDesc: string; chocoProducts: Product[];
  matchaEyebrow: string; matchaTitle1: string; matchaTitle2: string; matchaDesc: string; matchaProducts: Product[];
  requestQuote: string; bannerEyebrow: string; bannerTitle1: string; bannerTitleItalic: string; bannerTitle3: string; bannerDesc: string;
  partnersEyebrow: string; partnersTitle1: string; partnersTitle2: string; partnersCards: { n: string; t: string; d: string }[];
  trustedBy: string; morePartners: string; contactTitle: string; contactDesc: string; contactAddr: string;
  formOutlet: string; formCity: string; formInterest: string; formInterests: string[]; formWhatsapp: string; formEmail: string; formSubmit: string; formFoot: string; formThanks: string; formThanksSuffix: string;
  footerCopy: string; footerLinks: string[]; heroSlides: Slide[]; splashSub: string; splashFoot: string;
  aboutPage: { eyebrow: string; title: string; desc: string; mission: string; missionDesc: string; timeline: { y: string; t: string; d: string }[]; values: { t: string; d: string }[] };
  productsPage: { eyebrow: string; title: string; desc: string; all: string; choco: string; matcha: string };
  articlesPage: { eyebrow: string; title: string; desc: string; readMore: string; empty: string };
  articleDetail: { back: string; notFound: string };
  eduPage: { eyebrow: string; title: string; desc: string; level: string; duration: string; join: string };
  innovPage: { eyebrow: string; title: string; desc: string };
  contactPage: { eyebrow: string; title: string; desc: string; infoTitle: string; formTitle: string; addr: string; email: string; phone: string; hours: string; hoursVal: string };
  careersPage: { eyebrow: string; title: string; desc: string; dept: string; loc: string; type: string; apply: string; empty: string };
  admin: { loginTitle: string; user: string; pass: string; signIn: string; hint: string; invalid: string; dashTitle: string; logout: string; tabs: string[]; add: string; edit: string; delete: string; save: string; cancel: string; reset: string; resetConfirm: string; noData: string };
};

const dict: Record<Locale, Dict> = {
  en: {
    nav: { about: "ABOUT", choco: "CHOCO", matcha: "MATCHA", partners: "PARTNERS", contact: "CONTACT", becomePartner: "BECOME A PARTNER" },
    heroBadge: "DISTRIBUTOR · IMPORTER · B2B SUPPLY",
    heroTitle1: "Premium", heroTitleItalic: "choco", heroTitleAfterItalic: "& matcha", heroTitleLine3: "for cafés, hotels", heroTitleLine4: "& kitchens.",
    heroDesc: "NaturaFoods is a Jakarta-based distributor supplying choco & matcha to 400+ cafés, hotels, bakeries and retailers. Direct sourcing from Belgium, Ecuador & Uji — with cold-chain logistics and barista training.",
    viewCatalog: "VIEW CATALOG", companyProfile: "COMPANY PROFILE",
    stat1k: "400+", stat1v: "partners", stat2k: "3", stat2v: "origins direct", stat3k: "48h", stat3v: "Jabodetabek delivery",
    cardChocoLabel: "CHOCO", cardMatchaLabel: "MATCHA", cardPriceEyebrow: "STARTING FROM", cardPriceTitle: "Wholesale MOQ 6kg", cardPriceSub: "Samples & barista kit available", cardRequestPrice: "REQUEST PRICE LIST",
    marquee: ["BELGIAN COUVERTURE", "UJI CEREMONIAL MATCHA", "COLD-CHAIN LOGISTICS", "HORECA SUPPLY", "BARISTA TRAINING", "NATIONWIDE DISTRIBUTION"],
    aboutEyebrow: "01 — COMPANY PROFILE", aboutTitle1: "Distributor,", aboutTitle2: "not just a supplier.",
    aboutDesc: "Since 2019 we bridge makers and kitchens — importing directly and holding stock in Jakarta so cafés get fresh couverture and stone-milled matcha without import hassle.",
    aboutBullets: ["Licensed import & BPOM for food service.", "Temperature-controlled storage & 48h Jabodetabek delivery.", "Recipe, costing & barista training for partners."],
    aboutQuote: "We keep the chain short so the flavour stays honest.", aboutQuoteAttr: "— Operations, NaturaFoods",
    aboutBadges: ["BPOM CERTIFIED", "HALAL", "HACCP WAREHOUSE"],
    chocoEyebrow: "02 — CHOCO", chocoTitle1: "Couverture for", chocoTitle2: "professionals.", chocoDesc: "Belgian & Ecuadorian couverture in callets — temper-stable for drinks, pastry & moulding.",
    chocoProducts: [
      { title: "Belgian Dark 72%", note: "Callets · Single origin Ecuador", tag: "Bulk · 2.5kg", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=700&q=80" },
      { title: "Milk Couverture 33%", note: "Creamy & caramel — for drinks & ganache", tag: "2.5kg · 10kg", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80" },
      { title: "White Chocolate 28%", note: "Valrhona-style · for pastry & glaze", tag: "2.5kg", img: "https://images.unsplash.com/photo-1549007990-7d2dd8e7499a?w=700&q=80" },
    ],
    matchaEyebrow: "03 — MATCHA", matchaTitle1: "Uji matcha,", matchaTitle2: "properly stored.", matchaDesc: "Stone-milled in Uji & Yame, nitrogen-sealed, cold-chain to Jakarta. Ceremonial to culinary.",
    matchaProducts: [
      { title: "Uji Ceremonial — Yame", note: "First harvest · hand-picked", tag: "Grade A · 30g / 500g", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=700&q=80" },
      { title: "Culinary Matcha — Nishio", note: "For latte, bakery & gelato", tag: "Grade B · 1kg", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80" },
      { title: "Hojicha Roasted", note: "Low caffeine · nutty caramel", tag: "500g · 1kg", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=80" },
    ],
    requestQuote: "REQUEST QUOTE",
    bannerEyebrow: "FROM ORIGIN TO CUP", bannerTitle1: "Supply that keeps", bannerTitleItalic: "the ritual", bannerTitle3: "consistent.", bannerDesc: "Same temper, same whisk, every service. We hold stock so you don't chase imports.",
    partnersEyebrow: "04 — WHY PARTNERS CHOOSE US", partnersTitle1: "Built for", partnersTitle2: "HORECA.",
    partnersCards: [
      { n: "01", t: "Wholesale & consignment", d: "MOQ from 6kg, flexible reorder, consignment for high-volume partners. Net-14 terms." },
      { n: "02", t: "Cold chain & QC", d: "Temp-logged warehouse, batch traceability, COA on request. Replacements for melt/damage." },
      { n: "03", t: "Menu & training", d: "Free barista & pastry training, costed recipes, seasonal menu development with your team." },
    ],
    trustedBy: "TRUSTED BY", morePartners: "+ 400 more",
    contactTitle: "Become a partner.", contactDesc: "Tell us your outlet, volume and city — we'll send a price list and samples. No commitment.", contactAddr: "PT NaturaFoods Distribusi — Jakarta · Surabaya · Bali",
    formOutlet: "Outlet / company name", formCity: "City", formInterest: "Interest", formInterests: ["Choco", "Matcha", "Both"],
    formWhatsapp: "WhatsApp number", formEmail: "Email (optional)", formSubmit: "REQUEST PRICE LIST", formFoot: "Response within 24h · samples available",
    formThanks: "Thanks", formThanksSuffix: "— our team will contact you within 24h.",
    footerCopy: "NATURAFOODS — CHOCO & MATCHA DISTRIBUTION · JAKARTA · EST. 2019",
    footerLinks: ["CATALOG PDF", "INSTAGRAM", "CAREERS"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "BELGIAN COUVERTURE · NEW HARVEST", title: "Chocolate that\ntempers every time.", desc: "Direct from Belgium & Ecuador — callets for drinks, ganache & moulding.", cta: "VIEW CHOCO", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "UJI & YAME · STONE-MILLED · COLD-CHAIN", title: "Matcha, properly\nstored in Jakarta.", desc: "Nitrogen-sealed from Uji — ceremonial to culinary, ready in 48h.", cta: "VIEW MATCHA", ctaId: "matcha" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "FROM ORIGIN TO CUP — 400+ PARTNERS", title: "Supply that keeps\nthe ritual consistent.", desc: "We hold stock so you don't chase imports. Samples & barista training.", cta: "BECOME A PARTNER", ctaId: "contact" },
    ],
    splashSub: "CHOCO & MATCHA DISTRIBUTION", splashFoot: "EST. 2019 — JAKARTA · TOKYO · MELBOURNE",
    aboutPage: { eyebrow: "ABOUT US", title: "About NaturaFoods", desc: "Jakarta-based choco & matcha distributor since 2019. Direct import, cold-chain, and training for 400+ HORECA partners.", mission: "Mission", missionDesc: "Keep the chain short so flavour stays honest — from origin to cup, without import hassle.", timeline: [{ y: "2019", t: "Founded in Jakarta", d: "Started importing Belgian couverture for specialty cafés." }, { y: "2021", t: "Matcha from Uji", d: "Direct sourcing from Uji & Yame, nitrogen-sealed cold-chain." }, { y: "2024", t: "400+ partners", d: "Nationwide distribution — Jakarta, Surabaya, Bali." }], values: [{ t: "Quality", d: "Temp-logged warehouse, batch traceability, COA on request." }, { t: "Partnership", d: "Free barista & pastry training, menu development." }, { t: "Integrity", d: "Licensed import, BPOM, HALAL, HACCP." }] },
    productsPage: { eyebrow: "PRODUCTS", title: "Our Products", desc: "Couverture & matcha for professionals — wholesale MOQ 6kg. Filter by category.", all: "All", choco: "Choco", matcha: "Matcha" },
    articlesPage: { eyebrow: "ARTICLES", title: "Journal", desc: "Guides for cafés, hotels & kitchens — tempering, matcha grades, cold-chain and more.", readMore: "Read more", empty: "No articles yet." },
    articleDetail: { back: "Back to articles", notFound: "Article not found." },
    eduPage: { eyebrow: "EDUCATION CENTER", title: "Learn with us", desc: "Barista, pastry and costing workshops for partners — Jakarta, Surabaya & online.", level: "Level", duration: "Duration", join: "Join class" },
    innovPage: { eyebrow: "INNOVATION CENTER", title: "Innovation", desc: "R&D pilots — Nusantara single-origin, low-sugar couverture & new retail packs." },
    contactPage: { eyebrow: "CONTACT US", title: "Get in touch", desc: "Tell us your outlet, volume and city — we'll send a price list and samples.", infoTitle: "Contact info", formTitle: "Send a message", addr: "PT NaturaFoods Distribusi — Jakarta · Surabaya · Bali", email: "hello@naturafoods.id", phone: "+62 812-3456-7890", hours: "Hours", hoursVal: "Mon–Sat 09:00–18:00 WIB" },
    careersPage: { eyebrow: "CAREERS", title: "Join NaturaFoods", desc: "Build the supply chain that keeps the ritual consistent. Open roles below.", dept: "Dept", loc: "Location", type: "Type", apply: "Apply", empty: "No open roles — check back soon." },
    admin: { loginTitle: "Admin Login", user: "Username", pass: "Password", signIn: "Sign in", hint: "Demo: admin / admin123", invalid: "Invalid credentials.", dashTitle: "Dashboard CMS", logout: "Logout", tabs: ["Products", "Articles", "Education", "Innovation", "Careers", "Inquiries"], add: "Add", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", reset: "Reset to seed", resetConfirm: "Reset all data to seed? This cannot be undone.", noData: "No data." },
  },
  id: {
    nav: { about: "TENTANG", choco: "COKELAT", matcha: "MATCHA", partners: "MITRA", contact: "KONTAK", becomePartner: "JADI MITRA" },
    heroBadge: "DISTRIBUTOR · IMPORTIR · SUPLAI B2B",
    heroTitle1: "Choco & matcha", heroTitleItalic: "premium", heroTitleAfterItalic: "untuk", heroTitleLine3: "kafe, hotel", heroTitleLine4: "& dapur.",
    heroDesc: "NaturaFoods adalah distributor berbasis di Jakarta yang memasok choco & matcha ke 400+ kafe, hotel, bakery, dan retail. Sumber langsung dari Belgia, Ekuador & Uji — dengan logistik rantai dingin dan pelatihan barista.",
    viewCatalog: "LIHAT KATALOG", companyProfile: "PROFIL PERUSAHAAN",
    stat1k: "400+", stat1v: "mitra", stat2k: "3", stat2v: "asal langsung", stat3k: "48j", stat3v: "pengiriman Jabodetabek",
    cardChocoLabel: "COKELAT", cardMatchaLabel: "MATCHA", cardPriceEyebrow: "MULAI DARI", cardPriceTitle: "Grosir MOQ 6kg", cardPriceSub: "Sampel & barista kit tersedia", cardRequestPrice: "MINTA DAFTAR HARGA",
    marquee: ["COUVERTURE BELGIA", "MATCHA SEREMONIAL UJI", "LOGISTIK RANTAI DINGIN", "SUPLAI HORECA", "PELATIHAN BARISTA", "DISTRIBUSI NASIONAL"],
    aboutEyebrow: "01 — PROFIL PERUSAHAAN", aboutTitle1: "Distributor,", aboutTitle2: "bukan sekadar pemasok.",
    aboutDesc: "Sejak 2019 kami menjembatani produsen dan dapur — impor langsung dan stok di Jakarta agar kafe mendapat couverture segar dan matcha giling batu tanpa repot impor.",
    aboutBullets: ["Impor berizin & BPOM untuk food service.", "Penyimpanan suhu terkontrol & pengiriman Jabodetabek 48 jam.", "Resep, costing & pelatihan barista untuk mitra."],
    aboutQuote: "Rantai kami pendek agar rasa tetap jujur.", aboutQuoteAttr: "— Operasional, NaturaFoods",
    aboutBadges: ["TERSERTIFIKASI BPOM", "HALAL", "GUDANG HACCP"],
    chocoEyebrow: "02 — COKELAT", chocoTitle1: "Couverture untuk", chocoTitle2: "profesional.", chocoDesc: "Couverture Belgia & Ekuador bentuk callets — stabil untuk minuman, pastry & cetakan.",
    chocoProducts: [
      { title: "Belgian Dark 72%", note: "Callets · Single origin Ekuador", tag: "Curah · 2,5kg", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=700&q=80" },
      { title: "Milk Couverture 33%", note: "Creamy & karamel — untuk minuman & ganache", tag: "2,5kg · 10kg", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80" },
      { title: "White Chocolate 28%", note: "Gaya Valrhona · untuk pastry & glaze", tag: "2,5kg", img: "https://images.unsplash.com/photo-1549007990-7d2dd8e7499a?w=700&q=80" },
    ],
    matchaEyebrow: "03 — MATCHA", matchaTitle1: "Matcha Uji,", matchaTitle2: "disimpan dengan benar.", matchaDesc: "Giling batu di Uji & Yame, segel nitrogen, rantai dingin ke Jakarta. Seremonial hingga kuliner.",
    matchaProducts: [
      { title: "Uji Ceremonial — Yame", note: "Panen pertama · petik tangan", tag: "Grade A · 30g / 500g", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=700&q=80" },
      { title: "Culinary Matcha — Nishio", note: "Untuk latte, bakery & gelato", tag: "Grade B · 1kg", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80" },
      { title: "Hojicha Roasted", note: "Rendah kafein · karamel nutty", tag: "500g · 1kg", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=80" },
    ],
    requestQuote: "MINTA PENAWARAN",
    bannerEyebrow: "DARI ASAL KE CANGKIR", bannerTitle1: "Pasokan yang menjaga", bannerTitleItalic: "ritual", bannerTitle3: "tetap konsisten.", bannerDesc: "Temper sama, whisk sama, setiap service. Kami stok agar Anda tak kejar impor.",
    partnersEyebrow: "04 — KENAPA MITRA MEMILIH KAMI", partnersTitle1: "Dibuat untuk", partnersTitle2: "HORECA.",
    partnersCards: [
      { n: "01", t: "Grosir & konsinyasi", d: "MOQ mulai 6kg, reorder fleksibel, konsinyasi untuk mitra volume tinggi. Termin Net-14." },
      { n: "02", t: "Rantai dingin & QC", d: "Gudang tercatat suhu, traceability batch, COA on request. Penggantian jika meleleh/rusak." },
      { n: "03", t: "Menu & pelatihan", d: "Pelatihan barista & pastry gratis, resep dengan costing, pengembangan menu musiman bersama tim Anda." },
    ],
    trustedBy: "DIPERCAYA OLEH", morePartners: "+ 400 lainnya",
    contactTitle: "Jadi mitra.", contactDesc: "Beri tahu outlet, volume, dan kota Anda — kami kirim daftar harga dan sampel. Tanpa komitmen.", contactAddr: "PT NaturaFoods Distribusi — Jakarta · Surabaya · Bali",
    formOutlet: "Nama outlet / perusahaan", formCity: "Kota", formInterest: "Minat", formInterests: ["Cokelat", "Matcha", "Keduanya"],
    formWhatsapp: "Nomor WhatsApp", formEmail: "Email (opsional)", formSubmit: "MINTA DAFTAR HARGA", formFoot: "Respon dalam 24 jam · sampel tersedia",
    formThanks: "Terima kasih", formThanksSuffix: "— tim kami akan menghubungi dalam 24 jam.",
    footerCopy: "NATURAFOODS — DISTRIBUSI CHOCO & MATCHA · JAKARTA · EST. 2019",
    footerLinks: ["KATALOG PDF", "INSTAGRAM", "KARIR"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "COUVERTURE BELGIA · PANEN BARU", title: "Cokelat yang tempernya\nselalu pas.", desc: "Langsung dari Belgia & Ekuador — callets untuk minuman, ganache & cetakan.", cta: "LIHAT COKELAT", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "UJI & YAME · GILING BATU · RANTAI DINGIN", title: "Matcha tersimpan\nbenar di Jakarta.", desc: "Segel nitrogen dari Uji — seremonial hingga kuliner, siap 48 jam.", cta: "LIHAT MATCHA", ctaId: "matcha" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "DARI ASAL KE CANGKIR — 400+ MITRA", title: "Pasokan yang menjaga\nritual tetap konsisten.", desc: "Kami stok agar Anda tak kejar impor. Sampel & pelatihan barista.", cta: "JADI MITRA", ctaId: "contact" },
    ],
    splashSub: "DISTRIBUSI CHOCO & MATCHA", splashFoot: "EST. 2019 — JAKARTA · TOKYO · MELBOURNE",
    aboutPage: { eyebrow: "TENTANG KAMI", title: "Tentang NaturaFoods", desc: "Distributor choco & matcha berbasis Jakarta sejak 2019. Impor langsung, rantai dingin, pelatihan untuk 400+ mitra HORECA.", mission: "Misi", missionDesc: "Jaga rantai tetap pendek agar rasa jujur — dari asal ke cangkir, tanpa repot impor.", timeline: [{ y: "2019", t: "Didirikan di Jakarta", d: "Mulai impor couverture Belgia untuk kafe specialty." }, { y: "2021", t: "Matcha dari Uji", d: "Sumber langsung dari Uji & Yame, segel nitrogen rantai dingin." }, { y: "2024", t: "400+ mitra", d: "Distribusi nasional — Jakarta, Surabaya, Bali." }], values: [{ t: "Kualitas", d: "Gudang tercatat suhu, traceability batch, COA on request." }, { t: "Kemitraan", d: "Pelatihan barista & pastry gratis, pengembangan menu." }, { t: "Integritas", d: "Impor berizin, BPOM, HALAL, HACCP." }] },
    productsPage: { eyebrow: "PRODUK", title: "Produk Kami", desc: "Couverture & matcha untuk profesional — grosir MOQ 6kg. Filter kategori.", all: "Semua", choco: "Cokelat", matcha: "Matcha" },
    articlesPage: { eyebrow: "ARTIKEL", title: "Jurnal", desc: "Panduan untuk kafe, hotel & dapur — tempering, grade matcha, rantai dingin dll.", readMore: "Baca selengkapnya", empty: "Belum ada artikel." },
    articleDetail: { back: "Kembali ke artikel", notFound: "Artikel tidak ditemukan." },
    eduPage: { eyebrow: "PUSAT EDUKASI", title: "Belajar bersama kami", desc: "Workshop barista, pastry & costing untuk mitra — Jakarta, Surabaya & online.", level: "Level", duration: "Durasi", join: "Ikut kelas" },
    innovPage: { eyebrow: "PUSAT INOVASI", title: "Inovasi", desc: "Pilot R&D — single-origin Nusantara, couverture rendah gula & kemasan retail baru." },
    contactPage: { eyebrow: "HUBUNGI KAMI", title: "Hubungi kami", desc: "Beri tahu outlet, volume & kota — kami kirim daftar harga & sampel.", infoTitle: "Info kontak", formTitle: "Kirim pesan", addr: "PT NaturaFoods Distribusi — Jakarta · Surabaya · Bali", email: "hello@naturafoods.id", phone: "+62 812-3456-7890", hours: "Jam", hoursVal: "Senin–Sabtu 09:00–18:00 WIB" },
    careersPage: { eyebrow: "KARIR", title: "Bergabung dengan NaturaFoods", desc: "Bangun rantai pasok yang menjaga ritual tetap konsisten. Lowongan di bawah.", dept: "Dept", loc: "Lokasi", type: "Tipe", apply: "Lamar", empty: "Belum ada lowongan — cek lagi nanti." },
    admin: { loginTitle: "Login Admin", user: "Username", pass: "Password", signIn: "Masuk", hint: "Demo: admin / admin123", invalid: "Kredensial salah.", dashTitle: "Dashboard CMS", logout: "Keluar", tabs: ["Produk", "Artikel", "Edukasi", "Inovasi", "Karir", "Inquiry"], add: "Tambah", edit: "Edit", delete: "Hapus", save: "Simpan", cancel: "Batal", reset: "Reset ke seed", resetConfirm: "Reset semua data ke seed? Tidak bisa dibatalkan.", noData: "Tidak ada data." },
  },
  zh: {
    nav: { about: "关于", choco: "巧克力", matcha: "抹茶", partners: "合作伙伴", contact: "联系我们", becomePartner: "成为伙伴" },
    heroBadge: "分销商 · 进口商 · B2B 供应",
    heroTitle1: "为咖啡馆、酒店", heroTitleItalic: "与厨房", heroTitleAfterItalic: "提供", heroTitleLine3: "优质巧克力", heroTitleLine4: "与抹茶。",
    heroDesc: "NaturaFoods 是一家总部位于雅加达的分销商，为400多家咖啡馆、酒店、面包房和零售商供应巧克力与抹茶。直接从比利时、厄瓜多尔和宇治采购 — 配备冷链物流与咖啡师培训。",
    viewCatalog: "查看目录", companyProfile: "公司简介",
    stat1k: "400+", stat1v: "合作伙伴", stat2k: "3", stat2v: "直采产地", stat3k: "48小时", stat3v: "雅加达都市圈配送",
    cardChocoLabel: "巧克力", cardMatchaLabel: "抹茶", cardPriceEyebrow: "起订量", cardPriceTitle: "批发 MOQ 6kg", cardPriceSub: "提供样品与咖啡师套件", cardRequestPrice: "索取报价单",
    marquee: ["比利时调温巧克力", "宇治仪式级抹茶", "冷链物流", "酒店餐饮供应", "咖啡师培训", "全国分销"],
    aboutEyebrow: "01 — 公司简介", aboutTitle1: "分销商，", aboutTitle2: "不只是供应商。",
    aboutDesc: "自2019年起，我们连接原产地与厨房 — 直接进口并在雅加达备货，让咖啡馆无需繁琐进口即可获得新鲜调温巧克力和石磨抹茶。",
    aboutBullets: ["持证进口，具备餐饮用 BPOM 认证。", "温控仓储，雅加达都市圈48小时配送。", "为合作伙伴提供配方、成本核算与咖啡师培训。"],
    aboutQuote: "我们让供应链更短，让风味更真实。", aboutQuoteAttr: "— NaturaFoods 运营团队",
    aboutBadges: ["BPOM 认证", "清真认证", "HACCP 仓库"],
    chocoEyebrow: "02 — 巧克力", chocoTitle1: "专业级", chocoTitle2: "调温巧克力。", chocoDesc: "比利时与厄瓜多尔调温巧克力纽扣 — 回温稳定，适用于饮品、甜点与模具。",
    chocoProducts: [
      { title: "比利时黑巧 72%", note: "纽扣 · 厄瓜多尔单一产地", tag: "散装 · 2.5kg", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=700&q=80" },
      { title: "牛奶调温巧克力 33%", note: "顺滑焦糖 — 适用于饮品与甘纳许", tag: "2.5kg · 10kg", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80" },
      { title: "白巧克力 28%", note: "Valrhona 风格 · 适用于甜点与淋面", tag: "2.5kg", img: "https://images.unsplash.com/photo-1549007990-7d2dd8e7499a?w=700&q=80" },
    ],
    matchaEyebrow: "03 — 抹茶", matchaTitle1: "宇治抹茶，", matchaTitle2: "妥善储存。", matchaDesc: "在宇治与八女石磨、氮气密封、冷链运至雅加达。仪式级至料理级全覆盖。",
    matchaProducts: [
      { title: "宇治仪式级 — 八女", note: "首采 · 手摘", tag: "A级 · 30g / 500g", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=700&q=80" },
      { title: "料理抹茶 — 西尾", note: "适用于拿铁、烘焙与意式冰淇淋", tag: "B级 · 1kg", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80" },
      { title: "焙茶", note: "低咖啡因 · 坚果焦糖香", tag: "500g · 1kg", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=80" },
    ],
    requestQuote: "索取报价",
    bannerEyebrow: "从产地到杯中", bannerTitle1: "让", bannerTitleItalic: "仪式感", bannerTitle3: "始终如一的供应。", bannerDesc: "同样的回温，同样的点茶，每一次出品都稳定。我们备货，您无需追逐进口。",
    partnersEyebrow: "04 — 为何选择我们", partnersTitle1: "为", partnersTitle2: "酒店餐饮而生。",
    partnersCards: [
      { n: "01", t: "批发与寄售", d: "MOQ 6kg 起，灵活补货，高销量伙伴可寄售。Net-14 账期。" },
      { n: "02", t: "冷链与品控", d: "全程温控仓库，批次可追溯，按需提供 COA。融化/破损包换。" },
      { n: "03", t: "菜单与培训", d: "免费咖啡师与甜点培训、成本化配方、与您的团队共研季节菜单。" },
    ],
    trustedBy: "信赖之选", morePartners: "+ 400 家",
    contactTitle: "成为合作伙伴。", contactDesc: "告诉我们您的门店、用量和城市 — 我们将发送报价单与样品。无任何承诺。", contactAddr: "PT NaturaFoods Distribusi — 雅加达 · 泗水 · 巴厘岛",
    formOutlet: "门店 / 公司名称", formCity: "城市", formInterest: "意向", formInterests: ["巧克力", "抹茶", "两者都要"],
    formWhatsapp: "WhatsApp 号码", formEmail: "邮箱（可选）", formSubmit: "索取报价单", formFoot: "24小时内回复 · 可提供样品",
    formThanks: "谢谢", formThanksSuffix: "— 我们的团队将在24小时内联系您。",
    footerCopy: "NATURAFOODS — 巧克力与抹茶分销 · 雅加达 · 始于 2019",
    footerLinks: ["目录 PDF", "Instagram", "加入我们"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "比利时调温巧克力 · 新季", title: "每次都能完美\n调温的巧克力。", desc: "直采比利时与厄瓜多尔 — 纽扣状，适用于饮品、甘纳许与模具。", cta: "查看巧克力", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "宇治与八女 · 石磨 · 冷链", title: "在雅加达\n妥善储存的抹茶。", desc: "来自宇治的氮气密封 — 仪式级至料理级，48小时送达。", cta: "查看抹茶", ctaId: "matcha" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "从产地到杯中 — 400+ 合作伙伴", title: "让仪式感\n始终如一的供应。", desc: "我们备货，您无需追逐进口。提供样品与咖啡师培训。", cta: "成为伙伴", ctaId: "contact" },
    ],
    splashSub: "巧克力与抹茶分销", splashFoot: "始于 2019 — 雅加达 · 东京 · 墨尔本",
    aboutPage: { eyebrow: "关于我们", title: "关于 NaturaFoods", desc: "自2019年起总部位于雅加达的巧克力与抹茶分销商。直采、冷链与培训，服务400+酒店餐饮伙伴。", mission: "使命", missionDesc: "让供应链更短，让风味更真实 — 从产地到杯中，无需繁琐进口。", timeline: [{ y: "2019", t: "雅加达创立", d: "开始为精品咖啡馆进口比利时调温巧克力。" }, { y: "2021", t: "宇治抹茶", d: "直采宇治与八女，氮气密封冷链。" }, { y: "2024", t: "400+ 伙伴", d: "全国分销 — 雅加达、泗水、巴厘岛。" }], values: [{ t: "品质", d: "温控仓库，批次追溯，按需提供 COA。" }, { t: "伙伴关系", d: "免费咖啡师与甜点培训、菜单共创。" }, { t: "诚信", d: "持证进口，BPOM、清真、HACCP。" }] },
    productsPage: { eyebrow: "产品", title: "我们的产品", desc: "专业级调温巧克力与抹茶 — 批发 MOQ 6kg。可按分类筛选。", all: "全部", choco: "巧克力", matcha: "抹茶" },
    articlesPage: { eyebrow: "文章", title: "期刊", desc: "为咖啡馆、酒店与厨房准备的指南 — 调温、抹茶分级、冷链等。", readMore: "阅读更多", empty: "暂无文章。" },
    articleDetail: { back: "返回文章", notFound: "未找到文章。" },
    eduPage: { eyebrow: "教育中心", title: "与我们一起学习", desc: "为合作伙伴开设的咖啡师、甜点与成本工作坊 — 雅加达、泗水与线上。", level: "等级", duration: "时长", join: "报名" },
    innovPage: { eyebrow: "创新中心", title: "创新", desc: "研发试点 — 印度尼西亚单一产地、低糖调温巧克力与新零售包装。" },
    contactPage: { eyebrow: "联系我们", title: "联系我们", desc: "告诉我们您的门店、用量与城市 — 我们将发送报价单与样品。", infoTitle: "联系信息", formTitle: "发送消息", addr: "PT NaturaFoods Distribusi — 雅加达 · 泗水 · 巴厘岛", email: "hello@naturafoods.id", phone: "+62 812-3456-7890", hours: "营业时间", hoursVal: "周一至周六 09:00–18:00 WIB" },
    careersPage: { eyebrow: "招聘", title: "加入 NaturaFoods", desc: "共建让仪式感始终如一的供应链。开放职位如下。", dept: "部门", loc: "地点", type: "类型", apply: "申请", empty: "暂无开放职位 — 请稍后再看。" },
    admin: { loginTitle: "管理员登录", user: "用户名", pass: "密码", signIn: "登录", hint: "演示：admin / admin123", invalid: "账号或密码错误。", dashTitle: "管理后台", logout: "退出", tabs: ["产品", "文章", "教育", "创新", "招聘", "咨询"], add: "新增", edit: "编辑", delete: "删除", save: "保存", cancel: "取消", reset: "重置为初始数据", resetConfirm: "确定重置所有数据？此操作不可撤销。", noData: "暂无数据。" },
  },
};

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: Dict };
const Ctx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>("en");
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && locales.includes(saved)) setLocaleRaw(saved);
    else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("id")) setLocaleRaw("id");
      else if (nav.startsWith("zh")) setLocaleRaw("zh");
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);
  const setLocale = (l: Locale) => setLocaleRaw(l);
  return <Ctx.Provider value={{ locale, setLocale, t: dict[locale] }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang outside provider");
  return v;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLang();
  return (
    <div className={`flex items-center gap-1 rounded-full border border-[#2D4A22]/10 bg-white p-1 ${className}`}>
      {(locales as readonly Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-label={`Switch to ${l}`}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] transition ${locale === l ? "bg-[#2D4A22] text-white shadow" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { deepMerge, loadRaw, fetchSiteContent } from "./lib/siteContent";

export const locales = ["id", "en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const localeLabels: Record<Locale, string> = { id: "ID", en: "EN", zh: "中文" };
const STORAGE_KEY = "locale";

type Slide = { type: "image" | "video"; src: string; poster?: string; eyebrow: string; title: string; desc: string; cta: string; ctaId: string };
type Product = { title: string; note: string; tag: string; img: string };

export type Dict = {
  nav: { about: string; choco: string; matcha: string; partners: string; contact: string; becomePartner: string };
  heroBadge: string;
  heroVideoSrc: string; heroVideoPoster: string; heroBannerCta: string;
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
  welcomeTitle: string; welcomeSub: string;
  aboutPage: { eyebrow: string; title: string; desc: string; mission: string; missionDesc: string; timeline: { y: string; t: string; d: string }[]; values: { t: string; d: string }[] };
  productsPage: { eyebrow: string; title: string; desc: string; all: string; choco: string; matcha: string };
  articlesPage: { eyebrow: string; title: string; desc: string; readMore: string; empty: string };
  articleDetail: { back: string; notFound: string };
  eduPage: { eyebrow: string; title: string; desc: string; level: string; duration: string; join: string };
  innovPage: { eyebrow: string; title: string; desc: string };
  contactPage: { eyebrow: string; title: string; desc: string; heroDesc: string; infoTitle: string; formTitle: string; addr: string; email: string; phone: string; hours: string; hoursVal: string; whatsappDesc: string; emailDesc: string; locationTitle: string; locationName: string; viewLargerMap: string; nameLabel: string; namePlaceholder: string; emailLabel: string; emailPlaceholder: string; subjectLabel: string; subjectPlaceholder: string; messageLabel: string; messagePlaceholder: string; formSubmit: string; formThanks: string; formThanksSuffix: string };
  careersPage: { eyebrow: string; title: string; desc: string; dept: string; loc: string; type: string; apply: string; empty: string };
  productDetail: { notFound: string; back: string; requestPrice: string; viewAll: string };
  homeCommon: { viewMore: string; viewDetail: string; viewAllProducts: string };
  aboutDetail: { kicker: string; titleA: string; titleB: string; lead: string; toc: string[]; storyEyebrow: string; storyTitle: string; storyTitleIt: string; storyP1: string; storyP2: string; storyP3: string; quote: string; quoteBy: string; stats: { k: string; v: string }[]; journeyEyebrow: string; journeyTitle: string; journeyTitleIt: string; timeline: { y: string; t: string; d: string }[]; chainEyebrow: string; chainTitle: string; chainTitleIt: string; steps: { n: string; t: string; d: string }[]; valuesEyebrow: string; values: { t: string; d: string }[]; originsEyebrow: string; origins: { place: string; name: string; desc: string; img: string }[]; whEyebrow: string; whTitle: string; whTitleIt: string; whBullets: string[]; ctaTitle: string; ctaDesc: string; ctaBtn: string; aboutHeroVideoSrc: string; aboutHeroVideoPoster: string; aboutHeroEyebrow: string; aboutHeroTitle: string; aboutHeroDesc: string };
  admin: { loginTitle: string; user: string; pass: string; signIn: string; hint: string; invalid: string; dashTitle: string; logout: string; tabs: string[]; add: string; edit: string; delete: string; save: string; cancel: string; reset: string; resetConfirm: string; noData: string; contentReset: string; contentResetConfirm: string; contentSaved: string; contentTitle: string; contentDesc: string; contentSearchPlaceholder: string; contentOverridden: string; contentDefault: string; contentClearOverride: string; contentNoMatch: string; contentHint: string; contentGroups: { home: string; nav: string; about: string; aboutDetail: string; products: string; articles: string; education: string; innovation: string; contact: string; careers: string }; contentDefaultLabel: string; contentJsonPlaceholder: string; users: { title: string; addUser: string; username: string; password: string; newPassword: string; create: string; remove: string; changePass: string; you: string; exists: string; lastUser: string; selfDelete: string } };
};

export const dict: Record<Locale, Dict> = {
  en: {
    nav: { about: "ABOUT", choco: "CHOCO", matcha: "MATCHA", partners: "PARTNERS", contact: "CONTACT", becomePartner: "BECOME A PARTNER" },
    heroBadge: "PT NATURA INTI SUKSES · IMPORTER & DISTRIBUTOR",
    heroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20Home%20Website%20(1).mp4",
    heroVideoPoster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    heroBannerCta: "BECOME A PARTNER",
    heroTitle1: "Baking", heroTitleItalic: "ingredients", heroTitleAfterItalic: "for", heroTitleLine3: "food & beverage", heroTitleLine4: "professionals.",
    heroDesc: "PT Natura Inti Sukses is an importer & distributor of food & beverage ingredients in Indonesia — focused on baking ingredients. Built on import experience from 2010–2016, strong principal partnerships & a nationwide marketing network.",
    viewCatalog: "VIEW CATALOG", companyProfile: "COMPANY PROFILE",
    stat1k: "2010–", stat1v: "import experience", stat2k: "F&B", stat2v: "baking focus", stat3k: "Nationwide", stat3v: "marketing network",
    cardChocoLabel: "BAKING", cardMatchaLabel: "F&B INGREDIENTS", cardPriceEyebrow: "PT NATURA INTI SUKSES", cardPriceTitle: "Food Ingredients & Additives", cardPriceSub: "Selected quality — qualified team", cardRequestPrice: "REQUEST PRICE LIST",
    marquee: ["PT NATURA INTI SUKSES", "FOOD & BEVERAGE INGREDIENTS", "BAKING INGREDIENTS", "FOOD ADDITIVES", "IMPORTIR & DISTRIBUTOR", "MARKET LEADER VISION"],
    aboutEyebrow: "01 — COMPANY PROFILE", aboutTitle1: "PT Natura Inti Sukses,", aboutTitle2: "your ingredients partner.",
    aboutDesc: "PT Natura Inti Sukses is an importer & distributor of food & beverage ingredients in Indonesia, specializing in baking ingredients. With team import experience from 2010–2016 and strong principal relationships, we grow market share together — delivering selected quality products through a qualified team and marketing network.",
    aboutBullets: ["Food & beverage ingredients — focused on baking ingredients & additives.", "Import track record 2010–2016; strong principals for continuity & growth.", "Vision: Market Leader for Food Ingredients & Additives in Indonesia."],
    aboutQuote: "Selected quality products, supported by qualified people and a strong marketing network.", aboutQuoteAttr: "— Mission, PT Natura Inti Sukses",
    aboutBadges: ["PT NATURA INTI SUKSES", "2010–2016 EXPERIENCE", "B2B SUPPLY"],
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
    trustedBy: "TRUSTED BY", morePartners: "+ principals & bakeries nationwide",
    contactTitle: "Become a partner.", contactDesc: "Tell us your outlet, volume and city — we'll send a price list and samples. Selected quality, qualified support.", contactAddr: "PT Natura Inti Sukses — Indonesia · Baking Ingredients & Food Additives",
    formOutlet: "Outlet / company name", formCity: "City", formInterest: "Interest", formInterests: ["Baking", "F&B Ingredients", "Both"],
    formWhatsapp: "WhatsApp number", formEmail: "Email (optional)", formSubmit: "REQUEST PRICE LIST", formFoot: "Response within 24h · samples available",
    formThanks: "Thanks", formThanksSuffix: "— our team will contact you within 24h.",
    footerCopy: "PT NATURA INTI SUKSES — FOOD & BEVERAGE INGREDIENTS · BAKING INGREDIENTS · INDONESIA",
    footerLinks: ["CATALOG PDF", "INSTAGRAM", "CAREERS"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "PT NATURA INTI SUKSES · BAKING INGREDIENTS", title: "Baking ingredients\nwe stand behind.", desc: "Food & beverage ingredients — selected quality from trusted principals.", cta: "VIEW PRODUCTS", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "IMPORT EXPERIENCE 2010–2016 · NATIONWIDE NETWORK", title: "Built on experience,\ngrown with principals.", desc: "Strong partnerships to continue & develop the market together.", cta: "COMPANY PROFILE", ctaId: "about" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "VISI: MARKET LEADER — FOOD INGREDIENT & ADDITIVES", title: "Customer satisfaction.\nMajor market share.", desc: "Selected quality products & marketing network, supported by qualified human resources.", cta: "BECOME A PARTNER", ctaId: "contact" },
    ],
    splashSub: "PT NATURA INTI SUKSES — FOOD & BEVERAGE INGREDIENTS", splashFoot: "BAKING INGREDIENTS · IMPORT EXPERIENCE 2010–2016 · INDONESIA",
    welcomeTitle: "Welcome to PT Natura Inti Sukses",
    welcomeSub: "Your trusted partner for premium baking ingredients and food additives — import experience 2010–2016, nationwide reach.",
    aboutPage: { eyebrow: "ABOUT US", title: "About PT Natura Inti Sukses", desc: "Importer & distributor of food & beverage ingredients in Indonesia — especially baking ingredients. Proven import experience 2010–2016, strong principal ties, nationwide growth.", mission: "Mission", missionDesc: "Achieve customer satisfaction & major market share with selected quality products & marketing network supported by qualified human resources.", timeline: [{ y: "2010–16", t: "Import foundation", d: "Team built experience importing various products for customers — the base for NaturaFoods." }, { y: "Today", t: "PT Natura Inti Sukses", d: "Importer & distributor of F&B ingredients, focused on baking ingredients, with strong principal relationships." }, { y: "Next", t: "Market leader vision", d: "Continue & develop more market in Indonesia — Visi: Market Leader for Food Ingredient & Additives." }], values: [{ t: "Selected Quality", d: "Curated products from trusted principals — quality that wins repeat orders." }, { t: "Strong Principals", d: "Long-term relationships that ensure continuity, supply & joint market development." }, { t: "Qualified Team", d: "Marketing network powered by qualified HR — service, technical & growth support." }] },
    productsPage: { eyebrow: "PRODUCTS", title: "Our Products", desc: "Couverture & matcha for professionals — wholesale MOQ 6kg. Filter by category.", all: "All", choco: "Choco", matcha: "Matcha" },
    articlesPage: { eyebrow: "ARTICLES", title: "Journal", desc: "Guides for cafés, hotels & kitchens — tempering, matcha grades, cold-chain and more.", readMore: "Read more", empty: "No articles yet." },
    articleDetail: { back: "Back to articles", notFound: "Article not found." },
    eduPage: { eyebrow: "EDUCATION CENTER", title: "Learn with us", desc: "Barista, pastry and costing workshops for partners — Jakarta, Surabaya & online.", level: "Level", duration: "Duration", join: "Join class" },
    innovPage: { eyebrow: "INNOVATION CENTER", title: "Innovation", desc: "R&D pilots — Nusantara single-origin, low-sugar couverture & new retail packs." },
    contactPage: { eyebrow: "GET IN TOUCH", title: "Contact Us", desc: "Tell us your outlet, volume and city — we'll send a price list and samples.", heroDesc: "Kami siap membantu Anda. Silakan hubungi kami melalui informasi di bawah ini atau isi form di samping.", infoTitle: "Contact info", formTitle: "Contact Us", addr: "PT Natura Inti Sukses — Jl. Pangeran Tubagus Angke No.128-129, RT.15/RW.2, Angke, Kec. Tambora, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11330", email: "info@naturafoods.co.id", phone: "0812 9507 1397", hours: "Hours", hoursVal: "Mon–Sat 09:00–18:00 WIB", whatsappDesc: "Hubungi kami langsung melalui WhatsApp untuk respons lebih cepat.", emailDesc: "Kirim pertanyaan, permintaan, atau informasi lainnya melalui email.", locationTitle: "Our Location", locationName: "PT Natura Inti Sukses", viewLargerMap: "Lihat peta lebih besar", nameLabel: "Name", namePlaceholder: "Your name", emailLabel: "E-Mail", emailPlaceholder: "Your email", subjectLabel: "Subject", subjectPlaceholder: "Subject", messageLabel: "Message", messagePlaceholder: "Write your message here...", formSubmit: "SUBMIT FORM", formThanks: "Thank you", formThanksSuffix: "We will get back to you shortly." },
    careersPage: { eyebrow: "CAREERS", title: "Join NaturaFoods", desc: "Build the supply chain that keeps the ritual consistent. Open roles below.", dept: "Dept", loc: "Location", type: "Type", apply: "Apply", empty: "No open roles — check back soon." },
    productDetail: { notFound: "Product not found.", back: "Back to products", requestPrice: "Request price", viewAll: "View all products" },
    homeCommon: { viewMore: "View more", viewDetail: "View Detail", viewAllProducts: "View all products" },
    aboutDetail: { kicker: "ABOUT US — PT NATURA INTI SUKSES · INDONESIA", titleA: "Importer & distributor", titleB: "of food & beverage ingredients.", lead: "PT Natura Inti Sukses is an importer & distributor of food and beverage ingredients in Indonesia — especially baking ingredients. Built on team import experience 2010–2016 and strong principal partnerships to achieve huge markets across Indonesia — and to keep growing them.", toc: ["Profile", "Journey", "Supply chain", "Vision & Mission", "Categories", "Warehouse"], storyEyebrow: "01 — COMPANY PROFILE", storyTitle: "PT Natura Inti Sukses,", storyTitleIt: "your ingredients partner.", storyP1: "We are an Indonesian importer & distributor focused on food & beverage ingredients, especially baking ingredients — serving bakeries, food manufacturers, cafés, hotels and retail.", storyP2: "Our team has previous import experience from 2010–2016, delivering several products to customers across Indonesia. That foundation in sourcing, compliance, cold-chain and service is what we now scale for F&B ingredients.", storyP3: "It's a great opportunity & challenge: to prove we can achieve huge markets in Indonesia, and — through the strong relationship between NaturaFoods and principals — be assured to continue & develop more market in the next future.", quote: "Achieve customer satisfaction & major market share with selected quality products & marketing network supported by qualified human resources.", quoteBy: "— Mission, PT Natura Inti Sukses", stats: [{ k: "2010–", v: "import experience" }, { k: "F&B", v: "baking focus" }, { k: "Nationwide", v: "marketing network" }, { k: "Trusted", v: "principals" }], journeyEyebrow: "02 — JOURNEY", journeyTitle: "Experience,", journeyTitleIt: "then scale.", timeline: [{ y: "2010–16", t: "Import foundation", d: "Team builds import experience across several products and customers — sourcing, compliance, freight & service." }, { y: "Opportunity", t: "A huge market to prove", d: "The challenge: achieve large share in Indonesia's F&B market — quality-led, network-driven." }, { y: "Strength", t: "Principals who stay", d: "Strong NaturaFoods–principal relationships as the assurance to continue & expand together." }, { y: "Today", t: "PT Natura Inti Sukses", d: "Importer & distributor for food & beverage ingredients — especially baking — marketing network + qualified HR." }, { y: "Growth", t: "More market, next future", d: "Develop new coverage, SKUs and channels without losing the quality bar that principals expect." }, { y: "Vision", t: "Market leader ambition", d: "To be a Market Leader for Food Ingredient & Additives in Indonesia." }], chainEyebrow: "03 — HOW WE WORK", chainTitle: "Principals to pantry,", chainTitleIt: "reliably.", steps: [{ n: "01", t: "Principals & SKUs", d: "Selected quality products from trusted principals — baking ingredients, additives & F&B essentials on one supply." }, { n: "02", t: "Import & compliance", d: "Licensed import, documentation & warehousing — continuity you can plan production around." }, { n: "03", t: "Marketing network", d: "Nationwide reach + qualified human resources for support, sampling, application & after-sales." }, { n: "04", t: "Customer satisfaction", d: "Move with the customer from inquiry to reorder — service that earns major market share over time." }], valuesEyebrow: "04 — VISION & MISSION", values: [{ t: "Visi", d: "To be a Market Leader for Food Ingredient & Additives in Indonesia." }, { t: "Misi", d: "To achieve Customer's Satisfaction & Major Market Share with selected Quality Products & Marketing Network supported by qualified human resources." }, { t: "Opportunity & challenge", d: "We have proven import experience (2010–2016) — now we prove scale, through strong principals and a team that delivers." }], originsEyebrow: "05 — CATEGORIES", origins: [{ place: "BAKING · PASTRY", name: "Baking Ingredients", desc: "Core focus — reliable SKUs bakeries & pastry kitchens build daily production on.", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" }, { place: "F&B · ADDITIVES", name: "Food Ingredients & Additives", desc: "Selected quality for food & beverage — consistent, documented, principal-backed.", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" }], whEyebrow: "06 — SUPPLY ASSURANCE", whTitle: "Principals that stay,", whTitleIt: "stock that stays.", whBullets: ["Import track record 2010–2016 — sourcing, compliance & delivery proven", "Strong principal relationships for continuity & joint market development", "Marketing network + qualified HR for service & nationwide support", "Selected quality — the foundation for major market share"], ctaTitle: "Let's build the market together.", ctaDesc: "Tell us your business, category & city — we share specs, price list & distribution options within 24h.", ctaBtn: "BECOME A PARTNER", aboutHeroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20About%20Website.mp4", aboutHeroVideoPoster: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80", aboutHeroEyebrow: "ABOUT US · PT NATURA INTI SUKSES", aboutHeroTitle: "Our story, through the principal's lens.", aboutHeroDesc: "Importer & distributor of F&B ingredients in Indonesia — focused on baking, built on 2010–2016 import experience and strong principal partnerships." },
    admin: { loginTitle: "Admin Login", user: "Username", pass: "Password", signIn: "Sign in", hint: "Demo: admin / admin123", invalid: "Invalid credentials.", dashTitle: "Dashboard CMS", logout: "Logout", tabs: ["Products", "Official Partners", "Articles", "Education", "Innovation", "Careers", "Inquiries", "Users", "AI Assistant", "Content"], add: "Add", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", reset: "Reset to seed", resetConfirm: "Reset all data to seed? This cannot be undone.", noData: "No data.", contentReset: "Reset wording", contentResetConfirm: "Reset all page wording to defaults? This cannot be undone.", contentSaved: "Saved.", contentTitle: "Edit wording", contentDesc: "Every page's text per language. Overrides save to localStorage and apply instantly. Empty = use default.", contentSearchPlaceholder: "Search key or value…", contentOverridden: "OVERRIDDEN", contentDefault: "DEFAULT", contentClearOverride: "Clear override", contentNoMatch: "No match.", contentHint: "Arrays (e.g. marquee, bullets, toc) edit as JSON. Strings support multiline. Changes apply after Save.", contentGroups: { home: "Home", nav: "Navigation", about: "About page", aboutDetail: "About detail (full)", products: "Products page", articles: "Articles page", education: "Education", innovation: "Innovation", contact: "Contact page", careers: "Careers page" }, contentDefaultLabel: "Default", contentJsonPlaceholder: 'JSON array, e.g. ["a","b"]', users: { title: "Users", addUser: "Add user", username: "Username", password: "Password", newPassword: "New password", create: "Create", remove: "Remove", changePass: "Update password", you: "you", exists: "Username already exists.", lastUser: "Cannot remove last user.", selfDelete: "Cannot remove yourself." } },
  },
  id: {
    nav: { about: "TENTANG", choco: "COKELAT", matcha: "MATCHA", partners: "MITRA", contact: "KONTAK", becomePartner: "JADI MITRA" },
    heroBadge: "PT NATURA INTI SUKSES · IMPORTIR & DISTRIBUTOR",
    heroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20Home%20Website%20(1).mp4",
    heroVideoPoster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    heroBannerCta: "JADI MITRA",
    heroTitle1: "Bahan baku", heroTitleItalic: "kue premium", heroTitleAfterItalic: "untuk", heroTitleLine3: "industri makanan", heroTitleLine4: "& minuman.",
    heroDesc: "PT Natura Inti Sukses adalah importir & distributor bahan baku makanan dan minuman di Indonesia — fokus pada baking ingredients. Berbekal pengalaman impor tim sejak 2010–2016, kemitraan principal yang kuat & jaringan pemasaran nasional.",
    viewCatalog: "LIHAT KATALOG", companyProfile: "PROFIL PERUSAHAAN",
    stat1k: "2010–", stat1v: "pengalaman impor", stat2k: "F&B", stat2v: "fokus baking", stat3k: "Nasional", stat3v: "jaringan pemasaran",
    cardChocoLabel: "BAKING", cardMatchaLabel: "BAHAN BAKU F&B", cardPriceEyebrow: "PT NATURA INTI SUKSES", cardPriceTitle: "Food Ingredients & Additives", cardPriceSub: "Produk selektif — SDM berkualitas", cardRequestPrice: "MINTA DAFTAR HARGA",
    marquee: ["PT NATURA INTI SUKSES", "BAHAN BAKU MAKANAN & MINUMAN", "BAKING INGREDIENTS", "FOOD ADDITIVES", "IMPORTIR & DISTRIBUTOR", "VISI MARKET LEADER"],
    aboutEyebrow: "01 — PROFIL PERUSAHAAN", aboutTitle1: "PT Natura Inti Sukses,", aboutTitle2: "mitra bahan baku Anda.",
    aboutDesc: "PT Natura Inti Sukses adalah perusahaan importir & distributor bahan baku makanan & minuman, khususnya bahan baku kue di Indonesia. Dengan pengalaman impor tim 2010–2016 & hubungan kuat bersama principal, kami kembangkan pangsa pasar — kepuasan pelanggan melalui produk berkualitas terseleksi & jaringan pemasaran yang didukung SDM berkualitas.",
    aboutBullets: ["Bahan baku F&B — fokus baking ingredients & additives.", "Track record impor 2010–2016; kemitraan principal yang kuat untuk kontinuitas & ekspansi.", "Visi: Market Leader Food Ingredients & Additives di Indonesia."],
    aboutQuote: "Produk berkualitas terseleksi, didukung SDM berkualitas & jaringan pemasaran.", aboutQuoteAttr: "— Misi, PT Natura Inti Sukses",
    aboutBadges: ["PT NATURA INTI SUKSES", "PENGALAMAN 2010–2016", "SUPLAI B2B"],
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
    trustedBy: "DIPERCAYA OLEH", morePartners: "+ principal & bakery di seluruh Indonesia",
    contactTitle: "Jadi mitra.", contactDesc: "Beri tahu outlet, volume & kota — kami kirim daftar harga & sampel. Produk terseleksi, dukungan profesional.", contactAddr: "PT Natura Inti Sukses — Indonesia · Baking Ingredients & Food Additives",
    formOutlet: "Nama outlet / perusahaan", formCity: "Kota", formInterest: "Minat", formInterests: ["Baking", "Bahan Baku F&B", "Keduanya"],
    formWhatsapp: "Nomor WhatsApp", formEmail: "Email (opsional)", formSubmit: "MINTA DAFTAR HARGA", formFoot: "Respon dalam 24 jam · sampel tersedia",
    formThanks: "Terima kasih", formThanksSuffix: "— tim kami akan menghubungi dalam 24 jam.",
    footerCopy: "PT NATURA INTI SUKSES — BAHAN BAKU MAKANAN & MINUMAN · BAKING INGREDIENTS · INDONESIA",
    footerLinks: ["KATALOG PDF", "INSTAGRAM", "KARIR"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "PT NATURA INTI SUKSES · BAKING INGREDIENTS", title: "Bahan baku kue\npilihan terpercaya.", desc: "Bahan baku makanan & minuman — kualitas terseleksi dari principal terpercaya.", cta: "LIHAT PRODUK", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "PENGALAMAN IMPOR 2010–2016 · JARINGAN NASIONAL", title: "Berbekal pengalaman,\nbertumbuh bersama principal.", desc: "Kemitraan kuat untuk melanjutkan & mengembangkan pasar bersama.", cta: "PROFIL PERUSAHAAN", ctaId: "about" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "VISI: MARKET LEADER — FOOD INGREDIENT & ADDITIVES", title: "Kepuasan pelanggan.\nPangsa pasar utama.", desc: "Produk berkualitas terseleksi & jaringan pemasaran yang didukung SDM berkualitas.", cta: "JADI MITRA", ctaId: "contact" },
    ],
    splashSub: "PT NATURA INTI SUKSES — BAHAN BAKU MAKANAN & MINUMAN", splashFoot: "BAKING INGREDIENTS · PENGALAMAN IMPOR 2010–2016 · INDONESIA",
    welcomeTitle: "Selamat Datang di PT Natura Inti Sukses",
    welcomeSub: "Mitra terpercaya Anda untuk bahan baku kue premium dan food additives — pengalaman impor 2010–2016, jangkauan nasional.",
    aboutPage: { eyebrow: "TENTANG KAMI", title: "Tentang PT Natura Inti Sukses", desc: "Importir & distributor bahan baku makanan & minuman di Indonesia — khususnya bahan baku kue. Pengalaman impor 2010–2016, kemitraan principal kuat, ekspansi nasional.", mission: "Misi", missionDesc: "Mencapai kepuasan pelanggan & pangsa pasar utama dengan produk berkualitas terseleksi & jaringan pemasaran yang didukung SDM berkualitas.", timeline: [{ y: "2010–16", t: "Fondasi impor", d: "Tim membangun pengalaman impor berbagai produk untuk pelanggan — fondasi NaturaFoods." }, { y: "Kini", t: "PT Natura Inti Sukses", d: "Importir & distributor bahan baku F&B, fokus pada baking ingredients, dengan relasi principal yang kuat." }, { y: "Ke depan", t: "Visi market leader", d: "Melanjutkan & mengembangkan pasar di Indonesia — Visi: Market Leader Food Ingredient & Additives." }], values: [{ t: "Kualitas Terseleksi", d: "Produk kurasi dari principal terpercaya — kualitas yang bikin repeat order." }, { t: "Kemitraan Principal Kuat", d: "Relasi jangka panjang yang menjamin kontinuitas, suplai & pengembangan pasar bersama." }, { t: "SDM Berkualitas", d: "Jaringan pemasaran didukung SDM berkualitas — layanan, teknis & dukungan pertumbuhan." }] },
    productsPage: { eyebrow: "PRODUK", title: "Produk Kami", desc: "Couverture & matcha untuk profesional — grosir MOQ 6kg. Filter kategori.", all: "Semua", choco: "Cokelat", matcha: "Matcha" },
    articlesPage: { eyebrow: "ARTIKEL", title: "Jurnal", desc: "Panduan untuk kafe, hotel & dapur — tempering, grade matcha, rantai dingin dll.", readMore: "Baca selengkapnya", empty: "Belum ada artikel." },
    articleDetail: { back: "Kembali ke artikel", notFound: "Artikel tidak ditemukan." },
    eduPage: { eyebrow: "PUSAT EDUKASI", title: "Belajar bersama kami", desc: "Workshop barista, pastry & costing untuk mitra — Jakarta, Surabaya & online.", level: "Level", duration: "Durasi", join: "Ikut kelas" },
    innovPage: { eyebrow: "PUSAT INOVASI", title: "Inovasi", desc: "Pilot R&D — single-origin Nusantara, couverture rendah gula & kemasan retail baru." },
    contactPage: { eyebrow: "HUBUNGI KAMI", title: "Hubungi Kami", desc: "Beri tahu outlet, volume & kota — kami kirim daftar harga & sampel.", heroDesc: "Kami siap membantu Anda. Silakan hubungi kami melalui informasi di bawah ini atau isi form di samping.", infoTitle: "Info kontak", formTitle: "Hubungi Kami", addr: "PT Natura Inti Sukses — Jl. Pangeran Tubagus Angke No.128-129, RT.15/RW.2, Angke, Kec. Tambora, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11330", email: "info@naturafoods.co.id", phone: "0812 9507 1397", hours: "Jam", hoursVal: "Senin–Sabtu 09:00–18:00 WIB", whatsappDesc: "Hubungi kami langsung melalui WhatsApp untuk respons lebih cepat.", emailDesc: "Kirim pertanyaan, permintaan, atau informasi lainnya melalui email.", locationTitle: "Lokasi Kami", locationName: "PT Natura Inti Sukses", viewLargerMap: "Lihat peta lebih besar", nameLabel: "Nama", namePlaceholder: "Nama Anda", emailLabel: "Email", emailPlaceholder: "Email Anda", subjectLabel: "Subjek", subjectPlaceholder: "Subjek", messageLabel: "Pesan", messagePlaceholder: "Tulis pesan Anda di sini...", formSubmit: "KIRIM PESAN", formThanks: "Terima kasih", formThanksSuffix: "Tim kami akan segera menghubungi Anda." },
    careersPage: { eyebrow: "KARIR", title: "Bergabung dengan NaturaFoods", desc: "Bangun rantai pasok yang menjaga ritual tetap konsisten. Lowongan di bawah.", dept: "Dept", loc: "Lokasi", type: "Tipe", apply: "Lamar", empty: "Belum ada lowongan — cek lagi nanti." },
    productDetail: { notFound: "Produk tidak ditemukan.", back: "Kembali ke produk", requestPrice: "Minta harga", viewAll: "Lihat semua produk" },
    homeCommon: { viewMore: "Lihat selengkapnya", viewDetail: "Lihat Detail", viewAllProducts: "Lihat semua produk" },
    aboutDetail: { kicker: "TENTANG KAMI — PT NATURA INTI SUKSES · INDONESIA", titleA: "Importir & distributor", titleB: "bahan baku F&B.", lead: "PT Natura Inti Sukses adalah perusahaan importir & distributor bahan baku makanan dan minuman di Indonesia — khususnya bahan baku kue. Berbekal pengalaman impor tim 2010–2016 & kemitraan kuat bersama principal untuk meraih pasar besar di Indonesia — dan terus mengembangkannya.", toc: ["Profil", "Perjalanan", "Cara Kerja", "Visi & Misi", "Kategori", "Jaminan Pasok"], storyEyebrow: "01 — PROFIL PERUSAHAAN", storyTitle: "PT Natura Inti Sukses,", storyTitleIt: "mitra bahan baku Anda.", storyP1: "Kami adalah importir & distributor bahan baku makanan dan minuman di Indonesia yang fokus pada baking ingredients — melayani bakery, manufaktur pangan, kafe, hotel & retail.", storyP2: "Tim kami memiliki pengalaman impor sejak 2010–2016, mengirimkan berbagai produk kepada pelanggan di seluruh Indonesia. Fondasi sourcing, kepatuhan, rantai dingin & layanan inilah yang kini kami skalakan untuk bahan baku F&B.", storyP3: "Ini peluang & tantangan besar: membuktikan kami mampu meraih pasar besar di Indonesia, dan — melalui hubungan kuat NaturaFoods & principal — memastikan untuk melanjutkan & mengembangkan pasar lebih luas di masa depan.", quote: "Mencapai kepuasan pelanggan & pangsa pasar utama dengan produk berkualitas terseleksi & jaringan pemasaran yang didukung SDM berkualitas.", quoteBy: "— Misi, PT Natura Inti Sukses", stats: [{ k: "2010–", v: "pengalaman impor" }, { k: "F&B", v: "fokus baking" }, { k: "Nasional", v: "jaringan pemasaran" }, { k: "Terpercaya", v: "principal" }], journeyEyebrow: "02 — PERJALANAN", journeyTitle: "Berpengalaman,", journeyTitleIt: "lalu berkembang.", timeline: [{ y: "2010–16", t: "Fondasi impor", d: "Tim membangun pengalaman impor berbagai produk & pelanggan — sourcing, kepatuhan, freight & layanan." }, { y: "Peluang", t: "Pasar besar untuk dibuktikan", d: "Tantangan: meraih pangsa besar di pasar F&B Indonesia — dengan kualitas & jaringan." }, { y: "Kekuatan", t: "Principal yang setia", d: "Hubungan kuat NaturaFoods–principal sebagai jaminan untuk terus & ekspansi bersama." }, { y: "Hari ini", t: "PT Natura Inti Sukses", d: "Importir & distributor bahan baku F&B — khususnya baking — jaringan pemasaran + SDM berkualitas." }, { y: "Tumbuh", t: "Pasar lebih luas, masa depan", d: "Kembangkan cakupan, SKU & kanal baru tanpa menurunkan standar kualitas yang diharapkan principal." }, { y: "Visi", t: "Ambisi market leader", d: "Menjadi Market Leader untuk Food Ingredient & Additives di Indonesia." }], chainEyebrow: "03 — CARA KERJA", chainTitle: "Principal ke dapur,", chainTitleIt: "andalan.", steps: [{ n: "01", t: "Principal & SKU", d: "Produk berkualitas terseleksi dari principal terpercaya — baking ingredients, additives & kebutuhan F&B dalam satu pasokan." }, { n: "02", t: "Impor & kepatuhan", d: "Impor berizin, dokumentasi & pergudangan — kontinuitas yang bisa Anda rencanakan untuk produksi." }, { n: "03", t: "Jaringan pemasaran", d: "Jangkauan nasional + SDM berkualitas untuk dukungan, sampling, aplikasi & after-sales." }, { n: "04", t: "Kepuasan pelanggan", d: "Berjalan bersama pelanggan dari inquiry hingga reorder — layanan yang membangun pangsa pasar utama dari waktu ke waktu." }], valuesEyebrow: "04 — VISI & MISI", values: [{ t: "Visi", d: "To be a Market Leader for Food Ingredient & Additives in Indonesia." }, { t: "Misi", d: "Mencapai kepuasan pelanggan & pangsa pasar utama dengan produk berkualitas terseleksi & jaringan pemasaran yang didukung SDM berkualitas." }, { t: "Peluang & tantangan", d: "Kami punya pengalaman impor (2010–2016) — kini buktikan skala, melalui principal kuat & tim yang deliver." }], originsEyebrow: "05 — KATEGORI", origins: [{ place: "BAKING · PASTRY", name: "Baking Ingredients", desc: "Fokus utama — SKU andalan untuk produksi harian bakery & pastry.", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" }, { place: "F&B · ADDITIVES", name: "Bahan Baku & Additives", desc: "Kualitas terseleksi untuk makanan & minuman — konsisten, terdokumentasi, didukung principal.", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" }], whEyebrow: "06 — JAMINAN PASOK", whTitle: "Principal yang setia,", whTitleIt: "stok yang terjaga.", whBullets: ["Track record impor 2010–2016 — sourcing, kepatuhan & pengiriman terbukti", "Relasi principal kuat untuk kontinuitas & pengembangan pasar bersama", "Jaringan pemasaran + SDM berkualitas untuk layanan & dukungan nasional", "Kualitas terseleksi — fondasi untuk pangsa pasar utama"], ctaTitle: "Mari bangun pasar bersama.", ctaDesc: "Beri tahu bisnis, kategori & kota Anda — kami bagikan spec, price list & opsi distribusi dalam 24 jam.", ctaBtn: "JADI MITRA", aboutHeroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20About%20Website.mp4", aboutHeroVideoPoster: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80", aboutHeroEyebrow: "TENTANG KAMI · PT NATURA INTI SUKSES", aboutHeroTitle: "Cerita kami, lewat lensa principal.", aboutHeroDesc: "Importir & distributor bahan baku F&B Indonesia — fokus baking, dibangun dari pengalaman impor 2010–2016 dan kemitraan principal yang kuat." },
    admin: { loginTitle: "Login Admin", user: "Username", pass: "Password", signIn: "Masuk", hint: "Demo: admin / admin123", invalid: "Kredensial salah.", dashTitle: "Dashboard CMS", logout: "Keluar", tabs: ["Produk", "Mitra Resmi", "Artikel", "Edukasi", "Inovasi", "Karir", "Inquiry", "Pengguna", "AI Assistant", "Konten"], add: "Tambah", edit: "Edit", delete: "Hapus", save: "Simpan", cancel: "Batal", reset: "Reset ke seed", resetConfirm: "Reset semua data ke seed? Tidak bisa dibatalkan.", noData: "Tidak ada data.", contentReset: "Reset kata", contentResetConfirm: "Reset semua kata halaman ke default? Tidak bisa dibatalkan.", contentSaved: "Tersimpan.", contentTitle: "Edit kata", contentDesc: "Teks setiap halaman per bahasa. Override disimpan ke localStorage dan langsung berlaku. Kosong = pakai default.", contentSearchPlaceholder: "Cari kunci atau nilai…", contentOverridden: "DI-OVERRIDE", contentDefault: "DEFAULT", contentClearOverride: "Hapus override", contentNoMatch: "Tidak ada hasil.", contentHint: "Array (mis. marquee, bullets, toc) edit sebagai JSON. String bisa multiline. Perubahan berlaku setelah Simpan.", contentGroups: { home: "Beranda", nav: "Navigasi", about: "Halaman Tentang", aboutDetail: "Tentang detail (lengkap)", products: "Halaman Produk", articles: "Halaman Artikel", education: "Edukasi", innovation: "Inovasi", contact: "Halaman Kontak", careers: "Halaman Karir" }, contentDefaultLabel: "Default", contentJsonPlaceholder: 'Array JSON, mis. ["a","b"]', users: { title: "Pengguna", addUser: "Tambah pengguna", username: "Username", password: "Password", newPassword: "Password baru", create: "Buat", remove: "Hapus", changePass: "Ganti password", you: "kamu", exists: "Username sudah ada.", lastUser: "Tidak bisa hapus user terakhir.", selfDelete: "Tidak bisa hapus diri sendiri." } },
  },
  zh: {
    nav: { about: "关于", choco: "巧克力", matcha: "抹茶", partners: "合作伙伴", contact: "联系我们", becomePartner: "成为伙伴" },
    heroBadge: "PT NATURA INTI SUKSES · 进口商与分销商",
    heroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20Home%20Website%20(1).mp4",
    heroVideoPoster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    heroBannerCta: "成为伙伴",
    heroTitle1: "为食品饮料", heroTitleItalic: "行业", heroTitleAfterItalic: "提供", heroTitleLine3: "优质烘焙原料", heroTitleLine4: "与添加剂。",
    heroDesc: "PT Natura Inti Sukses 是印度尼西亚食品饮料原料的进口商与分销商 — 专注烘焙原料。团队自2010–2016年积累进口经验，依托稳固的品牌合作与全国营销网络。",
    viewCatalog: "查看目录", companyProfile: "公司简介",
    stat1k: "2010–", stat1v: "进口经验", stat2k: "F&B", stat2v: "专注烘焙", stat3k: "全国", stat3v: "营销网络",
    cardChocoLabel: "烘焙", cardMatchaLabel: "食品原料", cardPriceEyebrow: "PT NATURA INTI SUKSES", cardPriceTitle: "食品原料与添加剂", cardPriceSub: "精选品质 — 专业团队支持", cardRequestPrice: "索取报价单",
    marquee: ["PT NATURA INTI SUKSES", "食品饮料原料", "烘焙原料", "食品添加剂", "进口商与分销商", "市场领导者愿景"],
    aboutEyebrow: "01 — 公司简介", aboutTitle1: "PT Natura Inti Sukses，", aboutTitle2: "您的原料伙伴。",
    aboutDesc: "PT Natura Inti Sukses 是印度尼西亚食品饮料原料的进口商与分销商，专注烘焙原料。2010–2016年团队进口经验与稳固的品牌关系，助我们共同扩大市场 — 以精选优质产品与专业团队支持的营销网络实现客户满意度。",
    aboutBullets: ["食品饮料原料 — 专注烘焙原料与添加剂。", "2010–2016年进口履历；与品牌方紧密合作保障持续与扩张。", "愿景：成为印度尼西亚食品原料与添加剂的市场领导者。"],
    aboutQuote: "精选优质产品，由专业人才与强大营销网络支撑。", aboutQuoteAttr: "— PT Natura Inti Sukses 使命",
    aboutBadges: ["PT NATURA INTI SUKSES", "2010–2016 经验", "B2B 供应"],
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
    footerCopy: "PT NATURA INTI SUKSES — 食品饮料原料 · 烘焙原料 · 印度尼西亚",
    footerLinks: ["目录 PDF", "Instagram", "加入我们"],
    heroSlides: [
      { type: "image", src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "PT NATURA INTI SUKSES · 烘焙原料", title: "值得信赖的\n烘焙原料。", desc: "食品饮料原料 — 来自可信品牌的精选品质。", cta: "查看产品", ctaId: "choco" },
      { type: "image", src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80", eyebrow: "进口经验 2010–2016 · 全国网络", title: "以经验为基，\n与品牌共成长。", desc: "稳固合作，持续共同开拓印度尼西亚市场。", cta: "公司简介", ctaId: "about" },
      { type: "video", src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4", poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "愿景：食品原料与添加剂市场领导者", title: "客户满意。\n市场占有率领先。", desc: "精选优质产品与营销网络，由专业人才支持。", cta: "成为伙伴", ctaId: "contact" },
    ],
    splashSub: "PT NATURA INTI SUKSES — 食品饮料原料", splashFoot: "烘焙原料 · 进口经验 2010–2016 · 印度尼西亚",
    welcomeTitle: "欢迎来到 PT Natura Inti Sukses",
    welcomeSub: "您值得信赖的优质烘焙原料与食品添加剂伙伴 — 2010–2016年进口经验，覆盖全国。",
    aboutPage: { eyebrow: "关于我们", title: "关于 PT Natura Inti Sukses", desc: "印度尼西亚食品饮料原料进口商与分销商 — 专注烘焙原料。2010–2016年进口经验，稳固的品牌关系，全国化发展。", mission: "使命", missionDesc: "以精选优质产品与专业人才支持的营销网络，实现客户满意度与主要市场份额。", timeline: [{ y: "2010–16", t: "进口奠基", d: "团队为客户进口多种产品积累经验 — NaturaFoods 的基础。" }, { y: "今日", t: "PT Natura Inti Sukses", d: "食品饮料原料进口与分销，专注烘焙原料，与品牌方紧密合作。" }, { y: "未来", t: "市场领导者愿景", d: "持续共同开拓印度尼西亚市场 — 愿景：食品原料与添加剂市场领导者。" }], values: [{ t: "精选品质", d: "来自可信品牌的精选产品 — 品质赢得回头客。" }, { t: "稳固品牌合作", d: "长期关系保障持续供应与共同市场开发。" }, { t: "专业团队", d: "由专业人才驱动的营销网络 — 服务、技术与增长支持。" }] },
    productsPage: { eyebrow: "产品", title: "我们的产品", desc: "专业级调温巧克力与抹茶 — 批发 MOQ 6kg。可按分类筛选。", all: "全部", choco: "巧克力", matcha: "抹茶" },
    articlesPage: { eyebrow: "文章", title: "期刊", desc: "为咖啡馆、酒店与厨房准备的指南 — 调温、抹茶分级、冷链等。", readMore: "阅读更多", empty: "暂无文章。" },
    articleDetail: { back: "返回文章", notFound: "未找到文章。" },
    eduPage: { eyebrow: "教育中心", title: "与我们一起学习", desc: "为合作伙伴开设的咖啡师、甜点与成本工作坊 — 雅加达、泗水与线上。", level: "等级", duration: "时长", join: "报名" },
    innovPage: { eyebrow: "创新中心", title: "创新", desc: "研发试点 — 印度尼西亚单一产地、低糖调温巧克力与新零售包装。" },
    contactPage: { eyebrow: "联系我们", title: "联系我们", desc: "告诉我们您的门店、用量与城市 — 我们将发送报价单与样品。", heroDesc: "我们随时为您提供帮助。请通过以下信息联系我们，或填写旁边的表格。", infoTitle: "联系信息", formTitle: "联系我们", addr: "PT Natura Inti Sukses — Jl. Pangeran Tubagus Angke No.128-129, RT.15/RW.2, Angke, Kec. Tambora, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11330", email: "info@naturafoods.co.id", phone: "0812 9507 1397", hours: "营业时间", hoursVal: "周一至周六 09:00–18:00 WIB", whatsappDesc: "通过WhatsApp联系我们，获得更快的回复。", emailDesc: "通过电子邮件发送咨询、请求或其他信息。", locationTitle: "我们的位置", locationName: "PT Natura Inti Sukses", viewLargerMap: "查看完整地图", nameLabel: "姓名", namePlaceholder: "您的姓名", emailLabel: "电子邮件", emailPlaceholder: "您的邮箱", subjectLabel: "主题", subjectPlaceholder: "主题", messageLabel: "留言", messagePlaceholder: "在此输入您的留言...", formSubmit: "提交表单", formThanks: "谢谢", formThanksSuffix: "我们会尽快与您联系。" },
    careersPage: { eyebrow: "招聘", title: "加入 NaturaFoods", desc: "共建让仪式感始终如一的供应链。开放职位如下。", dept: "部门", loc: "地点", type: "类型", apply: "申请", empty: "暂无开放职位 — 请稍后再看。" },
    productDetail: { notFound: "未找到产品。", back: "返回产品", requestPrice: "索取报价", viewAll: "查看全部产品" },
    homeCommon: { viewMore: "查看更多", viewDetail: "查看详情", viewAllProducts: "查看全部产品" },
    aboutDetail: { kicker: "关于我们 — PT NATURA INTI SUKSES · 印度尼西亚", titleA: "食品饮料原料", titleB: "进口商与分销商。", lead: "PT Natura Inti Sukses 是印度尼西亚食品饮料原料的进口商与分销商 — 专注烘焙原料。团队自2010–2016年积累进口经验，依托稳固的品牌合作在印尼开拓大市场 — 并持续共同成长。", toc: ["简介", "历程", "如何运作", "愿景与使命", "品类", "供应保障"], storyEyebrow: "01 — 公司简介", storyTitle: "PT Natura Inti Sukses，", storyTitleIt: "您的原料伙伴。", storyP1: "我们专注食品饮料原料，尤以烘焙原料为核心 — 服务烘焙坊、食品工厂、咖啡馆、酒店与零售。", storyP2: "团队自2010–2016年为客户进口多种产品，积累了采购、合规、物流与服务的完整经验，如今规模化应用于食品饮料原料。", storyP3: "这是巨大的机会与挑战：证明我们在印尼能拿下大市场，并通过 NaturaFoods 与品牌方的紧密关系，确保未来继续共同开拓更多市场。", quote: "以精选优质产品与专业人才支持的营销网络，实现客户满意度与主要市场份额。", quoteBy: "— PT Natura Inti Sukses 使命", stats: [{ k: "2010–", v: "进口经验" }, { k: "F&B", v: "专注烘焙" }, { k: "全国", v: "营销网络" }, { k: "可信", v: "品牌合作" }], journeyEyebrow: "02 — 历程", journeyTitle: "以经验为基，", journeyTitleIt: "再求规模化。", timeline: [{ y: "2010–16", t: "进口奠基", d: "团队为客户进口多种产品 — 采购、合规、货运与服务全链路。" }, { y: "机会", t: "待证明的大市场", d: "挑战：在印尼食品饮料市场拿下大份额 — 以品质与网络驱动。" }, { y: "实力", t: "稳固的品牌关系", d: "NaturaFoods 与品牌方的紧密合作是持续与扩张的保障。" }, { y: "今日", t: "PT Natura Inti Sukses", d: "食品饮料原料进口与分销，专注烘焙 — 营销网络+专业人才。" }, { y: "增长", t: "开拓更多市场", d: "拓展覆盖、SKU与渠道，不降低品牌方期待的品质标准。" }, { y: "愿景", t: "市场领导者雄心", d: "成为印度尼西亚食品原料与添加剂的市场领导者。" }], chainEyebrow: "03 — 如何运作", chainTitle: "从品牌到厨房，", chainTitleIt: "稳定可靠。", steps: [{ n: "01", t: "品牌与 SKU", d: "来自可信品牌的精选优质产品 — 烘焙原料、添加剂与食品饮料必需品一站式供应。" }, { n: "02", t: "进口与合规", d: "持证进口、单证与仓储 — 可计划的持续供应。" }, { n: "03", t: "营销网络", d: "全国覆盖+专业人才，提供支持、打样、应用与售后。" }, { n: "04", t: "客户满意", d: "从询盘到复购全程陪伴 — 以服务赢得长期主要市场份额。" }], valuesEyebrow: "04 — 愿景与使命", values: [{ t: "愿景", d: "成为印度尼西亚食品原料与添加剂的市场领导者。" }, { t: "使命", d: "以精选优质产品与专业人才支持的营销网络，实现客户满意度与主要市场份额。" }, { t: "机会与挑战", d: "我们已证明进口能力（2010–2016）— 如今通过稳固品牌与能交付的团队证明规模化能力。" }], originsEyebrow: "05 — 品类", origins: [{ place: "烘焙 · 甜点", name: "烘焙原料", desc: "核心 focus — 烘焙与甜点厨房每日生产依赖的可靠 SKU。", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" }, { place: "食品 · 添加剂", name: "食品原料与添加剂", desc: "精选品质，用于食品饮料 — 稳定、可追溯、有品牌背书。", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" }], whEyebrow: "06 — 供应保障", whTitle: "品牌长久，", whTitleIt: "库存常在。", whBullets: ["2010–2016年进口履历 — 采购、合规与交付已验证", "稳固的品牌关系保障持续与共同市场开发", "营销网络+专业人才提供服务与全国支持", "精选品质 — 主要市场份额的基础"], ctaTitle: "一起开拓市场。", ctaDesc: "告诉我们业务、品类与城市 — 24小时内发送规格、报价与分销方案。", ctaBtn: "成为伙伴", aboutHeroVideoSrc: "https://cdn.alvineitsolutions.com/naturafoods/Video%20About%20Website.mp4", aboutHeroVideoPoster: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80", aboutHeroEyebrow: "关于我们 · PT NATURA INTI SUKSES", aboutHeroTitle: "我们的故事，透过品牌的镜头。", aboutHeroDesc: "印度尼西亚食品饮料原料进口商与分销商 — 专注烘焙，2010–2016年进口经验与稳固品牌合作共建。" },
    admin: { loginTitle: "管理员登录", user: "用户名", pass: "密码", signIn: "登录", hint: "演示：admin / admin123", invalid: "账号或密码错误。", dashTitle: "管理后台", logout: "退出", tabs: ["产品", "官方合作伙伴", "文章", "教育", "创新", "招聘", "咨询", "用户", "AI 助手", "内容"], add: "新增", edit: "编辑", delete: "删除", save: "保存", cancel: "取消", reset: "重置为初始数据", resetConfirm: "确定重置所有数据？此操作不可撤销。", noData: "暂无数据。", contentReset: "重置文案", contentResetConfirm: "确定重置所有文案？此操作不可撤销。", contentSaved: "已保存。", contentTitle: "编辑文案", contentDesc: "按语言编辑每页文字。覆盖保存至 localStorage 并即时生效。留空 = 使用默认。", contentSearchPlaceholder: "搜索键或值…", contentOverridden: "已覆盖", contentDefault: "默认", contentClearOverride: "清除覆盖", contentNoMatch: "无匹配。", contentHint: "数组（如 marquee、bullets、toc）以 JSON 编辑。字符串支持多行。保存后生效。", contentGroups: { home: "首页", nav: "导航", about: "关于页面", aboutDetail: "关于详情（完整）", products: "产品页面", articles: "文章页面", education: "教育", innovation: "创新", contact: "联系页面", careers: "招聘页面" }, contentDefaultLabel: "默认", contentJsonPlaceholder: 'JSON 数组，例如 ["a","b"]', users: { title: "用户", addUser: "添加用户", username: "用户名", password: "密码", newPassword: "新密码", create: "创建", remove: "删除", changePass: "更新密码", you: "你", exists: "用户名已存在。", lastUser: "不能删除最后一个用户。", selfDelete: "不能删除自己。" } },
  },
};

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: Dict };
const Ctx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>("en");
  const [overrides, setOverrides] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && locales.includes(saved)) setLocaleRaw(saved);
    else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("id")) setLocaleRaw("id");
      else if (nav.startsWith("zh")) setLocaleRaw("zh");
    }
    // Load local cache instantly
    setOverrides(loadRaw() as Record<string, unknown>);
    // Then hydrate from API (FRONTEND_API_GUIDE.md:8)
    fetchSiteContent()
      .then((data) => {
        if (data && Object.keys(data).length) setOverrides(data as unknown as Record<string, unknown>);
      })
      .catch(() => {});
    const onUpd = () => setOverrides(loadRaw() as Record<string, unknown>);
    window.addEventListener("nf_content_updated" as never, onUpd);
    window.addEventListener("storage", onUpd);
    return () => { window.removeEventListener("nf_content_updated" as never, onUpd); window.removeEventListener("storage", onUpd); };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);
  const setLocale = (l: Locale) => setLocaleRaw(l);
  const base = dict[locale];
  const ov = overrides ? (overrides as Record<string, Record<string, unknown>>)[locale] : undefined;
  const t = ov ? deepMerge(base as unknown as Record<string, unknown>, ov) as unknown as Dict : base;
  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
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

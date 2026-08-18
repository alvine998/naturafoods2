export type Product = { slug: string; cat: "choco" | "matcha"; title: string; note: string; tag: string; img: string; desc: string };
export type Article = { slug: string; title: string; excerpt: string; content: string; date: string; category: string; img: string };
export type Edu = { id: string; title: string; desc: string; duration: string; level: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Innovation = { id: string; title: string; desc: string; tag: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Job = { id: string; title: string; dept: string; loc: string; type: string; desc: string };
export type Inquiry = { id: string; name: string; city: string; whatsapp: string; interest: string; date: string };

export const SEED_PRODUCTS: Product[] = [
  { slug: "belgian-dark-72", cat: "choco", title: "Belgian Dark 72%", note: "Callets · Single origin Ecuador", tag: "Bulk · 2.5kg", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=700&q=80", desc: "Single-origin Ecuador beans, 72% — stable temper, clean snap. For enrobing, moulding & dark ganache." },
  { slug: "milk-couverture-33", cat: "choco", title: "Milk Couverture 33%", note: "Creamy & caramel — for drinks & ganache", tag: "2.5kg · 10kg", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80", desc: "Caramel-forward milk, 33% cocoa. Great for hot chocolate, soft ganache and bakery fillings." },
  { slug: "white-chocolate-28", cat: "choco", title: "White Chocolate 28%", note: "Valrhona-style · for pastry & glaze", tag: "2.5kg", img: "https://images.unsplash.com/photo-1549007990-7d2dd8e7499a?w=700&q=80", desc: "28% cocoa butter, vanilla-forward. Pastry, glaze and white ganache." },
  { slug: "uji-ceremonial-yame", cat: "matcha", title: "Uji Ceremonial — Yame", note: "First harvest · hand-picked", tag: "Grade A · 30g / 500g", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=700&q=80", desc: "First harvest Yame, hand-picked, stone-milled. Vibrant, umami, low bitterness." },
  { slug: "culinary-matcha-nishio", cat: "matcha", title: "Culinary Matcha — Nishio", note: "For latte, bakery & gelato", tag: "Grade B · 1kg", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80", desc: "Robust colour & flavour for latte, bakery and gelato. Cost-efficient at scale." },
  { slug: "hojicha-roasted", cat: "matcha", title: "Hojicha Roasted", note: "Low caffeine · nutty caramel", tag: "500g · 1kg", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=80", desc: "Roasted tencha, nutty caramel, low caffeine. Latte, dessert and HSR." },
];

export const SEED_ARTICLES: Article[] = [
  { slug: "tempering-guide", title: "The Tempering Guide for Cafés", excerpt: "Why 31–32°C matters and how to hold temper during service.", content: "<p>Temper is everything. In this guide we cover tabling vs seeding, holding at 31–32°C, and how to rescue bloomed batches without wasting callets. Includes a one-page SOP for service.</p><p>Key takeaway: hold your bain-marie at 45°C melt, seed to 27°C, reheat to 31.5°C — whisk, don't stir.</p>", date: "2026-02-10", category: "Choco", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&q=80" },
  { slug: "matcha-grades", title: "Ceremonial vs Culinary — What Shops Actually Need", excerpt: "Grade, colour and cost-per-serve breakdown for latte programs.", content: "<p>Not all matcha is equal. We break down Grade A vs B, colour (L*a*b*), and cost-per-serve so you can choose without overpaying.</p><p>Rule of thumb: ceremonial for usucha/koicha, Grade B for latte where milk dominates.</p>", date: "2026-01-18", category: "Matcha", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=900&q=80" },
  { slug: "cold-chain-jakarta", title: "Cold-Chain in Jakarta: Why We Hold Stock", excerpt: "How temp-logged warehousing protects couverture & matcha.", content: "<p>Jakarta heat kills flavour. Our warehouse is temp-logged at 18–20°C for choco and 5°C for matcha, with batch traceability and COA on request.</p>", date: "2025-12-03", category: "Operations", img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80" },
];

export const SEED_EDU: Edu[] = [
  { id: "barista-matcha", title: "Barista Matcha Essentials", desc: "Whisking, dosing (4g/70ml), latte dial-in & milk pairing.", duration: "1 day · Jakarta", level: "Beginner", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "EDUCATION · WORKSHOP", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cta: "Watch intro" },
  { id: "choco-pastry", title: "Choco Pastry Lab", desc: "Ganache, tempering & moulding for bakery and HORECA.", duration: "2 days · Surabaya", level: "Intermediate", img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1600&q=80", eyebrow: "EDUCATION · LAB", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cta: "Watch intro" },
  { id: "menu-costing", title: "Menu Costing Workshop", desc: "Cost-per-serve, waste and pricing for owners.", duration: "Half day · Online", level: "All levels", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80", eyebrow: "EDUCATION · ONLINE", link: "https://youtube.com", cta: "Watch on YouTube" },
];

export const SEED_INNOVATION: Innovation[] = [
  { id: "single-origin-nusantara", title: "Nusantara Single-Origin", desc: "Estate cacao from Sulawesi — ferment & roast trials with Belgian partners.", tag: "R&D · 2026", img: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80", eyebrow: "INNOVATION · R&D", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cta: "Watch film" },
  { id: "low-sugar-couverture", title: "Low-Sugar Couverture", desc: "30% less sugar, same temper — pilot with 12 cafés.", tag: "Pilot", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=1600&q=80", eyebrow: "INNOVATION · PILOT", link: "https://youtube.com", cta: "Watch on YouTube" },
  { id: "nitrogen-matcha", title: "Nitrogen-Sealed Retail Packs", desc: "500g matcha bricks with 12-month colour lock.", tag: "Packaging", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=1600&q=80", eyebrow: "INNOVATION · PACKAGING", link: "https://youtube.com", cta: "Learn more" },
];

export const SEED_JOBS: Job[] = [
  { id: "sales-jkt", title: "Sales — HORECA Jakarta", dept: "Sales", loc: "Jakarta", type: "Full-time", desc: "Own 60+ café accounts, samples, training coordination. 2y F&B sales required." },
  { id: "qc-warehouse", title: "QC & Warehouse Staff", dept: "Operations", loc: "Jakarta", type: "Full-time", desc: "Temp-log, batch QC, cold-chain handling. HACCP knowledge a plus." },
  { id: "barista-trainer", title: "Barista Trainer (Matcha & Choco)", dept: "Education", loc: "Jakarta · Surabaya", type: "Part-time", desc: "Deliver academy classes, menu development with partners." },
];

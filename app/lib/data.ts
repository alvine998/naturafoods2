export type ProductType = "home-brand" | "small-pack" | "general";
export type Product = { slug: string; cat: "choco" | "matcha"; title: string; note: string; tag: string; img: string; desc: string; type?: ProductType; isHighlight?: boolean };
export type Article = { slug: string; title: string; excerpt: string; content: string; contentId?: string; contentEn?: string; contentZh?: string; date: string; category: string; img: string };
export type Edu = { id: string; title: string; desc: string; duration: string; level: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Innovation = { id: string; title: string; desc: string; tag: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Job = { id: string; title: string; dept: string; loc: string; type: string; desc: string };
export type Inquiry = { id: string; name: string; city: string; whatsapp: string; interest: string; date: string };
export type OfficialPartner = { id: string; name: string; description: string; image: string; background: string; isPublished: boolean };

export const SEED_PRODUCTS: Product[] = [
  { slug: "belgian-dark-72", cat: "choco", title: "Belgian Dark 72%", note: "Callets · Single origin Ecuador", tag: "Bulk · 2.5kg", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=700&q=80", desc: "Single-origin Ecuador beans, 72% — stable temper, clean snap. For enrobing, moulding & dark ganache.", type: "home-brand", isHighlight: true },
  { slug: "milk-couverture-33", cat: "choco", title: "Milk Couverture 33%", note: "Creamy & caramel — for drinks & ganache", tag: "2.5kg · 10kg", img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=700&q=80", desc: "Caramel-forward milk, 33% cocoa. Great for hot chocolate, soft ganache and bakery fillings.", type: "home-brand", isHighlight: true },
  { slug: "white-chocolate-28", cat: "choco", title: "White Chocolate 28%", note: "Valrhona-style · for pastry & glaze", tag: "2.5kg", img: "https://images.unsplash.com/photo-1549007990-7d2dd8e7499a?w=700&q=80", desc: "28% cocoa butter, vanilla-forward. Pastry, glaze and white ganache.", type: "small-pack", isHighlight: false },
  { slug: "uji-ceremonial-yame", cat: "matcha", title: "Uji Ceremonial — Yame", note: "First harvest · hand-picked", tag: "Grade A · 30g / 500g", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=700&q=80", desc: "First harvest Yame, hand-picked, stone-milled. Vibrant, umami, low bitterness.", type: "general", isHighlight: true },
  { slug: "culinary-matcha-nishio", cat: "matcha", title: "Culinary Matcha — Nishio", note: "For latte, bakery & gelato", tag: "Grade B · 1kg", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80", desc: "Robust colour & flavour for latte, bakery and gelato. Cost-efficient at scale.", type: "small-pack", isHighlight: false },
  { slug: "hojicha-roasted", cat: "matcha", title: "Hojicha Roasted", note: "Low caffeine · nutty caramel", tag: "500g · 1kg", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=80", desc: "Roasted tencha, nutty caramel, low caffeine. Latte, dessert and HSR.", type: "general", isHighlight: false },
];

export const SEED_ARTICLES: Article[] = [
  {
    slug: "tempering-guide",
    title: "The Tempering Guide for Cafés",
    excerpt: "Why 31–32°C matters and how to hold temper during service.",
    content: "<p>Temper is everything. In this guide we cover tabling vs seeding, holding at 31–32°C, and how to rescue bloomed batches without wasting callets. Includes a one-page SOP for service.</p><p>Key takeaway: hold your bain-marie at 45°C melt, seed to 27°C, reheat to 31.5°C — whisk, don't stir.</p>",
    contentEn: "<p>Temper is everything. In this guide we cover tabling vs seeding, holding at 31–32°C, and how to rescue bloomed batches without wasting callets. Includes a one-page SOP for service.</p><p>Key takeaway: hold your bain-marie at 45°C melt, seed to 27°C, reheat to 31.5°C — whisk, don't stir.</p>",
    contentId: "<p>Temper adalah segalanya. Panduan ini membahas tabling vs seeding, menjaga 31–32°C, dan cara menyelamatkan batch yang blooming tanpa membuang callets. Termasuk SOP satu halaman untuk service.</p><p>Poin kunci: lelehkan di bain-marie 45°C, seed ke 27°C, panaskan ulang ke 31,5°C — whisk, jangan diaduk.</p>",
    contentZh: "<p>回温至关重要。本指南涵盖大理石降温与籽晶法、保持31–32°C以及如何在不浪费纽扣巧克力的情况下拯救起霜批次。包含一页服务SOP。</p><p>要点：隔水加热至45°C融化，籽晶降至27°C，再加热至31.5°C——用 whisk 搅拌，不要搅动。</p>",
    date: "2026-02-10",
    category: "Choco",
    img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&q=80",
  },
  {
    slug: "matcha-grades",
    title: "Ceremonial vs Culinary — What Shops Actually Need",
    excerpt: "Grade, colour and cost-per-serve breakdown for latte programs.",
    content: "<p>Not all matcha is equal. We break down Grade A vs B, colour (L*a*b*), and cost-per-serve so you can choose without overpaying.</p><p>Rule of thumb: ceremonial for usucha/koicha, Grade B for latte where milk dominates.</p>",
    contentEn: "<p>Not all matcha is equal. We break down Grade A vs B, colour (L*a*b*), and cost-per-serve so you can choose without overpaying.</p><p>Rule of thumb: ceremonial for usucha/koicha, Grade B for latte where milk dominates.</p>",
    contentId: "<p>Tidak semua matcha sama. Kami membedah Grade A vs B, warna (L*a*b*), dan cost-per-serve agar Anda memilih tanpa overpay.</p><p>Aturan praktis: ceremonial untuk usucha/koicha, Grade B untuk latte di mana susu mendominasi.</p>",
    contentZh: "<p>并非所有抹茶都一样。我们解析 A级与 B级、颜色（L*a*b*）以及每杯成本，帮你做出性价比之选。</p><p>经验法则：仪式级用于薄茶/浓茶，B级用于拿铁等奶味主导的饮品。</p>",
    date: "2026-01-18",
    category: "Matcha",
    img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=900&q=80",
  },
  {
    slug: "cold-chain-jakarta",
    title: "Cold-Chain in Jakarta: Why We Hold Stock",
    excerpt: "How temp-logged warehousing protects couverture & matcha.",
    content: "<p>Jakarta heat kills flavour. Our warehouse is temp-logged at 18–20°C for choco and 5°C for matcha, with batch traceability and COA on request.</p>",
    contentEn: "<p>Jakarta heat kills flavour. Our warehouse is temp-logged at 18–20°C for choco and 5°C for matcha, with batch traceability and COA on request.</p>",
    contentId: "<p>Panas Jakarta merusak rasa. Gudang kami tercatat suhu 18–20°C untuk choco dan 5°C untuk matcha, dengan traceability batch dan COA on request.</p>",
    contentZh: "<p>雅加达的高温会破坏风味。我们的仓库全程温控记录：巧克力 18–20°C、抹茶 5°C，批次可追溯、按需提供 COA。</p>",
    date: "2025-12-03",
    category: "Operations",
    img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80",
  },
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

export const SEED_OFFICIAL_PARTNERS: OfficialPartner[] = [
  { id: "bensdorp", name: "Bens Dorp", description: "Cocoa powder berkualitas tinggi untuk cita rasa cokelat yang kaya dan autentik.", image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80", background: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1200&q=80", isPublished: true },
  { id: "afya", name: "Afya", description: "Bubuk teh hijau premium dengan warna cerah dan rasa khas jepang.", image: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=600&q=80", background: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=1200&q=80", isPublished: true },
  { id: "trang-nghi", name: "Trang Nghi", description: "Filling premium untuk berbagai kreasi roti, kue, dan pastry dengan tekstur lembut dan rasa istimewa.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", background: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", isPublished: true },
  { id: "ofi", name: "OFI", description: "Kacang pilihan dengan kualitas terbaik untuk kreasi yang lebih beragam.", image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80", background: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=1200&q=80", isPublished: true },
  { id: "le-bourne", name: "Le Bourne", description: "Cokelat berkualitas tinggi dengan rasa lezat dan tekstur sempurna untuk berbagai kebutuhan.", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80", background: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=80", isPublished: true },
  { id: "kingland", name: "KingLand", description: "Kismis berkualitas dari pilihan terbaik untuk rasa manis alami dan tekstur yang sempurna.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80", background: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80", isPublished: true },
];

export type ProductType = "home-brand" | "small-pack" | "general";
export type ProductCategory = { id: string; slug: string; name: string; description?: string; isActive: boolean; isHighlight?: boolean };
export type Product = { slug: string; cat: string; categoryId?: string; category?: ProductCategory; title: string; note: string; tag: string; img: string; desc: string; type?: ProductType; isHighlight?: boolean };
export type Article = { slug: string; title: string; excerpt: string; content: string; contentId?: string; contentEn?: string; contentZh?: string; date: string; category: string; img: string };
export type Edu = { id: string; title: string; desc: string; duration: string; level: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Innovation = { id: string; title: string; desc: string; tag: string; img: string; link?: string; cta?: string; eyebrow?: string };
export type Job = { id: string; title: string; dept: string; loc: string; type: string; desc: string };
export type Inquiry = { id: string; name: string; city: string; whatsapp: string; interest: string; date: string };
export type OfficialPartner = { id: string; name: string; description: string; image: string; background: string; images?: string[]; color?: string; order?: number; isPublished: boolean };
export type SalesContact = { id: string; name: string; gender: string; position: string; whatsapp: string; email: string; photo: string; location: string; published: boolean; isPublished?: boolean };
export type HomeBrand = { id: string; name: string; image: string; desc: string; createdAt?: string; updatedAt?: string };
export type SocialMedia = { id: string; name: string; description: string; image: string; instagram: string; facebook: string; tiktok: string; createdAt?: string; updatedAt?: string };

export const SEED_PRODUCTS: Product[] = [];

export const SEED_ARTICLES: Article[] = [];

export const SEED_EDU: Edu[] = [
  { id: "barista-matcha", title: "Barista Matcha Essentials", desc: "Whisking, dosing (4g/70ml), latte dial-in & milk pairing.", duration: "1 day · Jakarta", level: "Beginner", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", eyebrow: "EDUCATION · WORKSHOP", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cta: "Watch intro" },
  { id: "choco-pastry", title: "Choco Pastry Lab", desc: "Ganache, tempering & moulding for bakery and HORECA.", duration: "2 days · Surabaya", level: "Intermediate", img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1600&q=80", eyebrow: "EDUCATION · LAB", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cta: "Watch intro" },
  { id: "menu-costing", title: "Menu Costing Workshop", desc: "Cost-per-serve, waste and pricing for owners.", duration: "Half day · Online", level: "All levels", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80", eyebrow: "EDUCATION · ONLINE", link: "https://youtube.com", cta: "Watch on YouTube" },
];

export const SEED_INNOVATION: Innovation[] = [];

export const SEED_JOBS: Job[] = [
  { id: "sales-jkt", title: "Sales — HORECA Jakarta", dept: "Sales", loc: "Jakarta", type: "Full-time", desc: "Own 60+ café accounts, samples, training coordination. 2y F&B sales required." },
  { id: "qc-warehouse", title: "QC & Warehouse Staff", dept: "Operations", loc: "Jakarta", type: "Full-time", desc: "Temp-log, batch QC, cold-chain handling. HACCP knowledge a plus." },
  { id: "barista-trainer", title: "Barista Trainer (Matcha & Choco)", dept: "Education", loc: "Jakarta · Surabaya", type: "Part-time", desc: "Deliver academy classes, menu development with partners." },
];

export const SEED_OFFICIAL_PARTNERS: OfficialPartner[] = [
  { id: "bensdorp", name: "Bens Dorp", description: "Cocoa powder berkualitas tinggi untuk cita rasa cokelat yang kaya dan autentik.", image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80", background: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1200&q=80", order: 0, isPublished: true },
  { id: "afya", name: "Afya", description: "Bubuk teh hijau premium dengan warna cerah dan rasa khas jepang.", image: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=600&q=80", background: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=1200&q=80", order: 1, isPublished: true },
  { id: "trang-nghi", name: "Trang Nghi", description: "Filling premium untuk berbagai kreasi roti, kue, dan pastry dengan tekstur lembut dan rasa istimewa.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", background: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", order: 2, isPublished: true },
  { id: "ofi", name: "OFI", description: "Kacang pilihan dengan kualitas terbaik untuk kreasi yang lebih beragam.", image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80", background: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=1200&q=80", order: 3, isPublished: true },
  { id: "le-bourne", name: "Le Bourne", description: "Cokelat berkualitas tinggi dengan rasa lezat dan tekstur sempurna untuk berbagai kebutuhan.", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80", background: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=80", order: 4, isPublished: true },
  { id: "kingland", name: "KingLand", description: "Kismis berkualitas dari pilihan terbaik untuk rasa manis alami dan tekstur yang sempurna.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80", background: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80", order: 5, isPublished: true },
];

// No dummy sales — real contacts come from GET /sales. Keep the export (empty)
// so existing imports keep working.
export const SEED_SALES_CONTACTS: SalesContact[] = [];

export const SEED_HOMEBRANDS: HomeBrand[] = [];

// No dummy social media — real rows come from GET /social-media and are managed
// in /admin/social-media. Keep the export (empty) so existing imports keep working.
export const SEED_SOCIAL_MEDIA: SocialMedia[] = [];

export const SEED_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "cat-choco", slug: "choco", name: "Choco", description: "Couverture & chocolate products", isActive: true, isHighlight: true },
  { id: "cat-matcha", slug: "matcha", name: "Matcha", description: "Matcha & tea products", isActive: true, isHighlight: true },
  { id: "cat-other", slug: "other", name: "Other", description: "Other categories", isActive: true, isHighlight: false },
];

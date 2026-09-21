"use client";
import { useEffect, useSyncExternalStore } from "react";
import { SEED_ARTICLES, SEED_EDU, SEED_HOMEBRANDS, SEED_INNOVATION, SEED_JOBS, SEED_MASTER_BRANDS, SEED_OFFICIAL_PARTNERS, SEED_PRODUCT_CATEGORIES, SEED_PRODUCTS, SEED_SOCIAL_MEDIA } from "./data";
import type { Article, Edu, HomeBrand, Innovation, Job, MasterBrand, OfficialPartner, Product, ProductCategory, Inquiry, SalesContact, SocialMedia } from "./data";
import { apiFetch, buildQuery } from "./api";

const KEYS = { products: "nf_products", articles: "nf_articles", edu: "nf_edu", innovation: "nf_innovation", jobs: "nf_jobs", inquiries: "nf_inquiries", officialPartners: "nf_official_partners", salesContacts: "nf_sales_contacts", homeBrands: "nf_home_brands", productCategories: "nf_product_categories", socialMedia: "nf_social_media", masterBrands: "nf_master_brands" } as const;

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
// localStorage is a paint-first cache, not the source of truth. Writing tens of MB
// (articles with inlined base64 images) throws QuotaExceededError, which swallowed
// silently left a stale cache behind — skip oversized payloads instead.
const MAX_CACHED_BYTES = 3_000_000;

function save(key: string, v: unknown) {
  try {
    const raw = JSON.stringify(v);
    if (raw.length > MAX_CACHED_BYTES) return;
    localStorage.setItem(key, raw);
  } catch {}
}

// ---------------------------------------------------------------------------
// API helpers — best-effort fetch with fallback to localStorage / seed
// ---------------------------------------------------------------------------
async function fetchFromApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const json = await apiFetch<T>(path);
    if (json.success && json.data != null) return json.data as T;
    return fallback;
  } catch {
    return fallback;
  }
}

// Normalize product from API which may have different shape (e.g. isPublished, id fields)
function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return SEED_PRODUCTS;
  return raw.map((p: Record<string, unknown>) => {
    const catObj = p.category as Record<string, unknown> | undefined;
    const catSlug = String(catObj?.slug ?? p.cat ?? "choco");
    const catId = String(p.categoryId ?? catObj?.id ?? "");
    return {
      slug: String(p.slug ?? p.id ?? ""),
      cat: catSlug,
      categoryId: catId || undefined,
      category: catObj ? { id: String(catObj.id ?? ""), slug: String(catObj.slug ?? catSlug), name: String(catObj.name ?? catSlug), description: String(catObj.description ?? ""), isActive: Boolean(catObj.isActive ?? true) } : undefined,
      title: String(p.title ?? ""),
      note: String(p.note ?? ""),
      tag: String(p.tag ?? ""),
      img: String(p.img ?? p.image ?? ""),
      desc: String(p.desc ?? p.description ?? ""),
      type: (p.type as Product["type"]) ?? "general",
      isHighlight: Boolean(p.isHighlight ?? p.is_highlight ?? false),
      file: String(p.file ?? p.file ?? "") || null,
    };
  }).filter((p) => p.slug && p.title);
}

function normalizeArticles(raw: unknown): Article[] {
  if (!Array.isArray(raw)) return SEED_ARTICLES;
  return raw.map((a: Record<string, unknown>) => ({
    slug: String(a.slug ?? ""),
    title: String(a.title ?? ""),
    excerpt: String(a.excerpt ?? ""),
    content: String(a.content ?? a.contentEn ?? a.contentEN ?? ""),
    contentId: String(a.contentId ?? a.contentID ?? a.content ?? ""),
    contentEn: String(a.contentEn ?? a.contentEN ?? a.content ?? ""),
    contentZh: String(a.contentZh ?? a.contentZN ?? a.contentZh ?? a.content ?? ""),
    date: String(a.date ?? a.published_date ?? new Date().toISOString().slice(0, 10)),
    category: String(a.category ?? "General"),
    img: String(a.img ?? a.thumbnail ?? ""),
  })).filter((a) => a.slug && a.title);
}

function parseOrder(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

export function normalizeSalesContacts(raw: unknown): SalesContact[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: Record<string, unknown>) => {
    const published = (c.published ?? c.isPublished ?? (c as Record<string, unknown>).is_published ?? c.is_active ?? (c as Record<string, unknown>).isActive ?? true) ? true : false;
    return {
      id: String(c.id ?? c.slug ?? ""),
      name: String(c.name ?? ""),
      gender: String(c.gender ?? ""),
      position: String(c.position ?? c.role ?? ""),
      whatsapp: String(c.whatsapp ?? c.phone ?? ""),
      email: String(c.email ?? ""),
      photo: String(c.photo ?? c.image ?? c.avatar ?? ""),
      location: String(c.location ?? c.city ?? ""),
      published,
      isPublished: published,
    };
  }).filter((c) => c.id && c.name);
}

export function normalizeSocialMedia(raw: unknown): SocialMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s: Record<string, unknown>) => ({
    id: String(s.id ?? s.slug ?? ""),
    name: String(s.name ?? ""),
    description: String(s.description ?? s.desc ?? ""),
    image: String(s.image ?? s.logo ?? s.img ?? ""),
    instagram: String(s.instagram ?? ""),
    facebook: String(s.facebook ?? ""),
    tiktok: String(s.tiktok ?? ""),
    createdAt: s.createdAt as string | undefined,
    updatedAt: s.updatedAt as string | undefined,
  })).filter((s) => s.id && s.name);
}

// Dummy social media rows (seeded from the old hardcoded /social-media page) were
// removed — drop any cached copies still sitting in browsers' localStorage.
const REMOVED_DUMMY_SOCIAL_IDS = new Set([
  "barry-callebaut",
  "bensdorp",
  "avante",
  "dc6701b8-5ca2-4325-9154-c4479bdcb4b4",
  "94073507-d464-48d1-b21a-7143b2ab3158",
  "e8189d4c-76ae-42db-a7c7-6ba7293f4849",
]);

function migrateSocialMedia(raw: unknown): SocialMedia[] {
  return normalizeSocialMedia(raw).filter((m) => !REMOVED_DUMMY_SOCIAL_IDS.has(m.id));
}

function normalizeHomeBrands(raw: unknown): HomeBrand[] {
  if (!Array.isArray(raw)) return SEED_HOMEBRANDS;
  return raw.map((h: Record<string, unknown>) => ({
    id: String(h.id ?? ""),
    name: String(h.name ?? ""),
    image: String(h.image ?? h.img ?? ""),
    desc: String(h.desc ?? h.description ?? ""),
    brandIds: parseBrandIds(h) ?? [],
    createdAt: h.createdAt as string | undefined,
    updatedAt: h.updatedAt as string | undefined,
  })).filter((h) => h.id && h.name);
}

// Legacy dummy contacts removed from SEED_SALES_CONTACTS — drop any cached
// copies still sitting in browsers' localStorage so they don't resurface.
const REMOVED_DUMMY_SALES_IDS = new Set(["andi-wijaya", "sinta-putri"]);

function migrateSalesContacts(list: SalesContact[]): SalesContact[] {
  return (Array.isArray(list) ? list : []).map((c) => {
    const raw = c as unknown as Record<string, unknown>;
    const published = (c.published ?? raw.isPublished ?? raw.is_published ?? raw.isActive ?? true) ? true : false;
    return {
      id: String(c.id ?? ""),
      name: String(c.name ?? ""),
      gender: String(c.gender ?? ""),
      position: String(c.position ?? raw.role ?? ""),
      whatsapp: String(c.whatsapp ?? raw.phone ?? ""),
      email: String(c.email ?? ""),
      photo: String(c.photo ?? raw.image ?? raw.avatar ?? ""),
      location: String(c.location ?? raw.city ?? ""),
      published,
      isPublished: published,
    } as SalesContact;
  }).filter((c) => c.id && c.name && !REMOVED_DUMMY_SALES_IDS.has(c.id));
}

function normalizeOfficialPartners(raw: unknown): OfficialPartner[] {  if (!Array.isArray(raw)) return SEED_OFFICIAL_PARTNERS;
  return raw.map((p: Record<string, unknown>, idx: number) => {
    // Semantics: background = single right-side visual, images[] = bottom-bar logos (more than one)
    const rawImages = p.images ?? (p as Record<string, unknown>).logos ?? null;
    let images: string[] | undefined;
    if (Array.isArray(rawImages)) images = rawImages.map((v) => String(v ?? "")).filter(Boolean);
    else if (typeof rawImages === "string" && rawImages) images = [rawImages];
    const image = String((p.image as unknown) ?? (Array.isArray(p.image) ? (p.image as unknown[])[0] : "") ?? p.brandLogo ?? images?.[0] ?? "");
    const background = String(p.background ?? p.mainImage ?? "");
    const rawColor = typeof p.color === "string" ? p.color.trim() : "";
    const order = parseOrder(p.order ?? (p as Record<string, unknown>).sortOrder) ?? idx;
    const brandIds = parseBrandIds(p);
    const link = typeof p.link === "string" && p.link.trim() ? p.link.trim() : undefined;
    return {
      id: String(p.id ?? ""),
      name: String(p.name ?? ""),
      description: String(p.description ?? p.desc ?? ""),
      image,
      background,
      ...(images && images.length ? { images } : {}),
      ...(rawColor ? { color: rawColor } : {}),
      order,
      isPublished: p.isPublished ?? p.is_published ?? true ? true : false,
      ...(brandIds ? { brandIds } : {}),
      ...(link ? { link } : {}),
    };
  }).filter((p) => p.id && p.name);
}

function isValidHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim());
}

function parseStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) {
    // backend may return string ids or {id} objects (join table)
    const out = (v as unknown[])
      .map((x) => {
        if (typeof x === "string") return x.trim();
        if (x && typeof x === "object") {
          const o = x as Record<string, unknown>;
          const id = o.id ?? o.brandId ?? o.brand_id ?? o.value ?? o.slug;
          return String(id ?? "").trim();
        }
        return String(x ?? "").trim();
      })
      .filter(Boolean);
    // support comma-separated single entry e.g. ["a,b"] or "a,b"
    const split = out.flatMap((s) => s.split(",").map((s2) => s2.trim()).filter(Boolean));
    return split.length ? [...new Set(split)] : undefined;
  }
  if (typeof v === "string" && v.trim() !== "") {
    const out = v.split(",").map((s) => s.trim()).filter(Boolean);
    return out.length ? [...new Set(out)] : undefined;
  }
  return undefined;
}

// Backend uses snake_case `brand_ids`; frontend uses camelCase `brandIds`.
// Also accept `brands: [{id}]` join shape.
function parseBrandIds(raw: Record<string, unknown>): string[] | undefined {
  return (
    parseStringArray(raw.brandIds) ??
    parseStringArray(raw.brand_ids) ??
    parseStringArray(raw.brandIDs) ??
    parseStringArray(raw.brands) ??
    parseStringArray(raw.Brands) ??
    undefined
  );
}

function migrateOfficialPartners(list: OfficialPartner[]): OfficialPartner[] {
  return (Array.isArray(list) ? list : []).map((p, idx) => {
    const raw = p as unknown as Record<string, unknown>;
    // merge legacy logos[] into images[] (bottom logos), deduped
    const fromImages = parseStringArray(p.images);
    const fromLogos = parseStringArray(raw.logos);
    const merged = [...(fromImages ?? []), ...(fromLogos ?? [])].filter((v, i, a) => v && a.indexOf(v) === i);
    const images = merged.length ? merged : undefined;
    const image = String(p.image ?? images?.[0] ?? "");
    // normalize snake_case brand_ids (backend) -> brandIds (frontend)
    const brandIds = parseBrandIds(raw) ?? parseStringArray(p.brandIds);
    const { logos: _drop, brand_ids: _drop2, brands: _drop3, ...rest } = raw as Record<string, unknown> & { logos?: unknown; brand_ids?: unknown; brands?: unknown };
    void _drop;
    void _drop2;
    void _drop3;
    return { ...rest, id: String(p.id ?? ""), name: String(p.name ?? ""), description: String(p.description ?? ""), image, background: String(p.background ?? ""), ...(images ? { images } : {}), ...(isValidHexColor(p.color) ? { color: (p.color as string).trim() } : {}), order: parseOrder(p.order) ?? idx, ...(brandIds ? { brandIds } : {}) } as OfficialPartner;
  });
}

export function sortOfficialPartners<T extends { order?: number; name?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ---------------------------------------------------------------------------
// Singleton store — one fetch for the whole app, shared via useSyncExternalStore
// ---------------------------------------------------------------------------
type StoreState = {
  ready: boolean;
  apiReady: boolean;
  products: Product[];
  articles: Article[];
  edu: Edu[];
  innovation: Innovation[];
  jobs: Job[];
  officialPartners: OfficialPartner[];
  salesContacts: SalesContact[];
  homeBrands: HomeBrand[];
  productCategories: ProductCategory[];
  socialMedia: SocialMedia[];
  masterBrands: MasterBrand[];
  inquiries: Inquiry[];
};

type StoreSetter = Partial<StoreState> | ((prev: StoreState) => Partial<StoreState>);
type FieldUpdater<T> = T | ((prev: T) => T);

let storeState: StoreState = {
  ready: false,
  apiReady: false,
  products: SEED_PRODUCTS,
  articles: SEED_ARTICLES,
  edu: SEED_EDU,
  innovation: SEED_INNOVATION,
  jobs: SEED_JOBS,
  officialPartners: SEED_OFFICIAL_PARTNERS,
  salesContacts: [],
  homeBrands: SEED_HOMEBRANDS,
  productCategories: SEED_PRODUCT_CATEGORIES,
  socialMedia: SEED_SOCIAL_MEDIA,
  masterBrands: SEED_MASTER_BRANDS,
  inquiries: [],
};

let initPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function subscribeStore(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function getStoreSnapshot(): StoreState {
  return storeState;
}

function patchStore(partial: StoreSetter) {
  const next = typeof partial === "function" ? partial(storeState) : partial;
  if (!Object.keys(next).length) return;
  // IMPORTANT: replace the reference (immutable update). useSyncExternalStore
  // bails out when getSnapshot() returns the same reference (Object.is), so
  // the previous Object.assign(storeState, next) mutation meant API results
  // were stored but no component ever re-rendered — UI stayed on seed data.
  storeState = { ...storeState, ...next };
  // Save updated values to localStorage
  const s = storeState;
  if (s.ready) {
    save(KEYS.products, s.products);
    save(KEYS.articles, s.articles);
    save(KEYS.edu, s.edu);
    save(KEYS.innovation, s.innovation);
    save(KEYS.jobs, s.jobs);
    save(KEYS.officialPartners, s.officialPartners);
    save(KEYS.salesContacts, s.salesContacts);
    save(KEYS.homeBrands, s.homeBrands);
    save(KEYS.productCategories, s.productCategories);
    save(KEYS.socialMedia, s.socialMedia);
    save(KEYS.masterBrands, s.masterBrands);
    save(KEYS.inquiries, s.inquiries);
  }
  emitChange();
}

function initStore() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // Load local first for instant paint
    patchStore({
      products: migrateProducts(load(KEYS.products, SEED_PRODUCTS)),
      // Load cached articles like every other entity (getSeedArticles migrates
      // legacy single-content rows and falls back to SEED_ARTICLES). Previously
      // hardcoded to the empty seed, so LatestStoriesSection always nulled on
      // first paint until the API round-trip finished.
      articles: getSeedArticles(),
      edu: load(KEYS.edu, SEED_EDU) as Edu[],
      innovation: load(KEYS.innovation, SEED_INNOVATION) as Innovation[],
      jobs: load(KEYS.jobs, SEED_JOBS) as Job[],
      officialPartners: migrateOfficialPartners(load(KEYS.officialPartners, SEED_OFFICIAL_PARTNERS)) as OfficialPartner[],
      salesContacts: migrateSalesContacts(load(KEYS.salesContacts, [] as SalesContact[])) as SalesContact[],
      homeBrands: load(KEYS.homeBrands, SEED_HOMEBRANDS) as HomeBrand[],
      productCategories: load(KEYS.productCategories, SEED_PRODUCT_CATEGORIES) as ProductCategory[],
      socialMedia: migrateSocialMedia(load(KEYS.socialMedia, SEED_SOCIAL_MEDIA)) as SocialMedia[],
      masterBrands: load(KEYS.masterBrands, SEED_MASTER_BRANDS) as MasterBrand[],
      inquiries: load(KEYS.inquiries, [] as Inquiry[]) as Inquiry[],
    });

    // Skip API if localStorage was populated recently (5 min)
    const CACHE_TTL_MS = 5 * 60 * 1000;
    const lastFetch = Number(localStorage.getItem("nf_last_fetch_ts") || "0");
    if (Date.now() - lastFetch < CACHE_TTL_MS) {
      patchStore({ ready: true, apiReady: true });
      return;
    }

    // Then try API — overwrite if successful
    const fetchSalesList = async (): Promise<unknown> => {
      try {
        const json = await apiFetch<unknown>("/sales-contacts?limit=50");
        if (json.success && json.data != null) return json.data as unknown;
      } catch {}
      return null as unknown;
    };

    const [apiProducts, apiArticles, apiPartners, apiEdu, apiInnov, apiJobs, apiSales, apiHomeBrands, apiProductCategories, apiSocialMedia, apiMasterBrands] = await Promise.all([
      fetchFromApi<unknown>("/products?limit=50", null as unknown),
      fetchFromApi<unknown>("/articles?limit=50", null as unknown),
      fetchFromApi<unknown>("/official-partners?limit=50", null as unknown),
      fetchFromApi<unknown>("/education?limit=50", null as unknown),
      fetchFromApi<unknown>("/innovations?limit=50", null as unknown),
      fetchFromApi<unknown>("/jobs?limit=50", null as unknown),
      fetchSalesList(),
      fetchFromApi<unknown>("/home-brands?limit=50", null as unknown),
      fetchFromApi<unknown>("/categories?limit=50", null as unknown),
      fetchFromApi<unknown>("/social-media?limit=50", null as unknown),
      fetchFromApi<unknown>("/brands?limit=50", null as unknown),
    ]);

    const patch: Partial<StoreState> = { ready: true, apiReady: true };
    if (apiProducts) { const norm = normalizeProducts(apiProducts); if (norm.length) patch.products = norm; }
    if (apiArticles) { const norm = normalizeArticles(apiArticles); if (norm.length) patch.articles = norm as Article[]; }
    if (apiPartners) { const norm = normalizeOfficialPartners(apiPartners); if (norm.length) patch.officialPartners = norm as OfficialPartner[]; }
    if (apiEdu && Array.isArray(apiEdu) && apiEdu.length) patch.edu = apiEdu as Edu[];
    if (apiInnov && Array.isArray(apiInnov) && apiInnov.length) patch.innovation = apiInnov as Innovation[];
    if (apiJobs && Array.isArray(apiJobs) && apiJobs.length) patch.jobs = apiJobs as Job[];
    if (apiHomeBrands && Array.isArray(apiHomeBrands) && apiHomeBrands.length) {
      const norm = normalizeHomeBrands(apiHomeBrands);
      if (norm.length) patch.homeBrands = norm;
    }
    if (apiProductCategories && Array.isArray(apiProductCategories) && apiProductCategories.length) {
      const norm = apiProductCategories.map((c: Record<string, unknown>) => ({
        id: String(c.id ?? ""),
        slug: String(c.slug ?? c.id ?? ""),
        name: String(c.name ?? ""),
        description: String(c.description ?? c.desc ?? ""),
        isActive: c.isActive !== false && c.is_active !== false,
        isHighlight: Boolean(c.isHighlight ?? c.is_highlight ?? false),
      })).filter((c: ProductCategory) => c.id && c.name);
      if (norm.length) patch.productCategories = norm;
    }
    if (apiSales && Array.isArray(apiSales) && apiSales.length) {
      const norm = normalizeSalesContacts(apiSales);
      if (norm.length) patch.salesContacts = norm;
    }
    if (apiSocialMedia && Array.isArray(apiSocialMedia) && apiSocialMedia.length) {
      const norm = normalizeSocialMedia(apiSocialMedia);
      if (norm.length) patch.socialMedia = norm;
    }
    if (apiMasterBrands && Array.isArray(apiMasterBrands) && apiMasterBrands.length) {
      const norm = apiMasterBrands.map((b: Record<string, unknown>) => ({
        id: String(b.id ?? ""),
        slug: String(b.slug ?? b.id ?? ""),
        name: String(b.name ?? ""),
        description: String(b.description ?? b.desc ?? ""),
        logo: String(b.logo ?? b.image ?? ""),
        isActive: b.isActive !== false && b.is_active !== false,
      })).filter((b: MasterBrand) => b.id && b.name);
      if (norm.length) patch.masterBrands = norm;
    }

    // inquiries is admin-only — try but ignore if unauthorized
    try {
      const q = buildQuery({ page: 1, limit: 50, sort: "createdAt:desc" });
      const json = await apiFetch<Inquiry[]>(`/admin/inquiries${q}`);
      if (json.success && Array.isArray(json.data) && json.data.length) {
        const mapped: Inquiry[] = (json.data as unknown as Record<string, unknown>[]).map((x) => ({
          id: String(x.id ?? ""),
          name: String(x.name ?? ""),
          city: String(x.city ?? ""),
          whatsapp: String(x.whatsapp ?? ""),
          interest: String(x.interest ?? ""),
          date: String((x.date as string) ?? (x.createdAt as string) ?? new Date().toISOString()),
        }));
        if (mapped.length) patch.inquiries = mapped;
      }
    } catch {}

    patchStore(patch);
    try { localStorage.setItem("nf_last_fetch_ts", String(Date.now())); } catch {}

    // Fallback: if API never responds, still mark ready after timeout
    setTimeout(() => {
      if (!storeState.ready) patchStore({ ready: true });
    }, 2500);
  })();
  return initPromise;
}

export function useStore() {
  // Start init on first render (safe: idempotent)
  useEffect(() => { initStore(); }, []);

  const state = useSyncExternalStore(subscribeStore, getStoreSnapshot, getStoreSnapshot);

  const reset = () => {
    patchStore({
      products: SEED_PRODUCTS, articles: SEED_ARTICLES, edu: SEED_EDU,
      innovation: SEED_INNOVATION, jobs: SEED_JOBS, officialPartners: SEED_OFFICIAL_PARTNERS,
      salesContacts: [], homeBrands: SEED_HOMEBRANDS, productCategories: SEED_PRODUCT_CATEGORIES,
      socialMedia: SEED_SOCIAL_MEDIA, masterBrands: SEED_MASTER_BRANDS,
    });
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    try { localStorage.removeItem("nf_last_fetch_ts"); } catch {}
  };

  return {
    ...state,
    setProducts: (v: FieldUpdater<Product[]>) => patchStore((s) => ({ products: typeof v === "function" ? v(s.products) : v })),
    setArticles: (v: FieldUpdater<Article[]>) => patchStore((s) => ({ articles: typeof v === "function" ? v(s.articles) : v })),
    setEdu: (v: FieldUpdater<Edu[]>) => patchStore((s) => ({ edu: typeof v === "function" ? v(s.edu) : v })),
    setInnovation: (v: FieldUpdater<Innovation[]>) => patchStore((s) => ({ innovation: typeof v === "function" ? v(s.innovation) : v })),
    setJobs: (v: FieldUpdater<Job[]>) => patchStore((s) => ({ jobs: typeof v === "function" ? v(s.jobs) : v })),
    setOfficialPartners: (v: FieldUpdater<OfficialPartner[]>) => patchStore((s) => ({ officialPartners: typeof v === "function" ? v(s.officialPartners) : v })),
    setSalesContacts: (v: FieldUpdater<SalesContact[]>) => patchStore((s) => ({ salesContacts: typeof v === "function" ? v(s.salesContacts) : v })),
    setHomeBrands: (v: FieldUpdater<HomeBrand[]>) => patchStore((s) => ({ homeBrands: typeof v === "function" ? v(s.homeBrands) : v })),
    setProductCategories: (v: FieldUpdater<ProductCategory[]>) => patchStore((s) => ({ productCategories: typeof v === "function" ? v(s.productCategories) : v })),
    setInquiries: (v: FieldUpdater<Inquiry[]>) => patchStore((s) => ({ inquiries: typeof v === "function" ? v(s.inquiries) : v })),
    setSocialMedia: (v: FieldUpdater<SocialMedia[]>) => patchStore((s) => ({ socialMedia: typeof v === "function" ? v(s.socialMedia) : v })),
    setMasterBrands: (v: FieldUpdater<MasterBrand[]>) => patchStore((s) => ({ masterBrands: typeof v === "function" ? v(s.masterBrands) : v })),
    reset,
  };
}

// for non-hook access (articles list / detail fallback to seed)
export function getSeedArticles(): Article[] {
  try {
    const v = localStorage.getItem(KEYS.articles);
    if (v) {
      const parsed = JSON.parse(v) as Article[];
      // migrate old single-content articles → fill locale variants
      return parsed.map((a) => ({
        ...a,
        contentId: a.contentId ?? a.content ?? "",
        contentEn: a.contentEn ?? a.content ?? "",
        contentZh: a.contentZh ?? a.content ?? "",
      }));
    }
  } catch {}
  return SEED_ARTICLES;
}
function isPublishedArticle(raw: Record<string, unknown>): boolean {
  if (raw.isPublished === false || raw.is_published === false) return false;
  const status = typeof raw.status === "string" ? raw.status.toLowerCase() : "";
  return status !== "draft" && status !== "unpublished" && status !== "archived" && status !== "private";
}

function sortArticlesByDateDesc(list: Article[]): Article[] {
  return [...list].sort((a, b) => {
    const ta = Date.parse(a.date ?? "");
    const tb = Date.parse(b.date ?? "");
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });
}

// Public articles list (GET /articles) — returns null so callers fall back to local cache / seed
export async function fetchPublicArticles(limit = 50): Promise<Article[] | null> {
  try {
    const json = await apiFetch<unknown>(`/articles${buildQuery({ page: 1, limit, sort: "date:desc" })}`);
    if (!json.success || !Array.isArray(json.data)) return null;
    const list = normalizeArticles((json.data as Record<string, unknown>[]).filter(isPublishedArticle));
    return list.length ? sortArticlesByDateDesc(list) : null;
  } catch {
    return null;
  }
}

export function getArticleContent(a: Article, locale: string): string {
  if (locale === "id") return a.contentId ?? a.contentEn ?? a.content ?? "";
  if (locale === "zh") return a.contentZh ?? a.contentEn ?? a.content ?? "";
  return a.contentEn ?? a.content ?? "";
}
function migrateProducts(list: Product[]): Product[] {
  return list.map((p) => ({
    ...p,
    type: (p.type as Product["type"]) ?? "general",
    isHighlight: p.isHighlight ?? false,
  }));
}
export function getSeedProducts(): Product[] {
  try {
    const v = localStorage.getItem(KEYS.products);
    if (v) return migrateProducts(JSON.parse(v) as Product[]);
  } catch {}
  return SEED_PRODUCTS;
}
export function getHighlightedProducts(): Product[] {
  return getSeedProducts().filter((p) => p.isHighlight);
}
export function getProductsByType(type: Product["type"]): Product[] {
  return getSeedProducts().filter((p) => (p.type ?? "general") === type);
}
export function getSeedOfficialPartners(): OfficialPartner[] {
  try { const v = localStorage.getItem(KEYS.officialPartners); if (v) return migrateOfficialPartners(JSON.parse(v) as OfficialPartner[]); } catch {}
  return SEED_OFFICIAL_PARTNERS;
}export function getPublishedOfficialPartners(): OfficialPartner[] {
  return getSeedOfficialPartners().filter((p) => p.isPublished);
}

export function sortSalesContacts<T extends { name?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
}
export function getSeedSalesContacts(): SalesContact[] {
  try {
    const v = localStorage.getItem(KEYS.salesContacts);
    if (v) {
      const parsed = JSON.parse(v) as SalesContact[];
      if (Array.isArray(parsed) && parsed.length) return migrateSalesContacts(parsed);
    }
  } catch {}
  return [] as SalesContact[];
}
export function getActiveSalesContacts(): SalesContact[] {
  return sortSalesContacts(getSeedSalesContacts().filter((c) => c.published !== false && c.name));
}
export function salesInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "NF";
}

// Public social media list (GET /social-media) — null so callers fall back to local cache / seed
export async function fetchPublicSocialMedia(limit = 50): Promise<SocialMedia[] | null> {
  try {
    const json = await apiFetch<unknown>(`/social-media${buildQuery({ page: 1, limit })}`);
    if (!json.success || !Array.isArray(json.data)) return null;
    const list = normalizeSocialMedia(json.data);
    return list.length ? list : null;
  } catch {
    return null;
  }
}
export function getSeedSocialMedia(): SocialMedia[] {
  try {
    const v = localStorage.getItem(KEYS.socialMedia);
    if (v) {
      const list = migrateSocialMedia(JSON.parse(v));
      if (list.length) return list;
    }
  } catch {}
  return SEED_SOCIAL_MEDIA;
}

// ---------------------------------------------------------------------------
// API CRUD helpers for admin pages (used when API available, else caller falls back to setProducts local)
// ---------------------------------------------------------------------------
export async function apiCreateProduct(payload: Product): Promise<Product> {
  const json = await apiFetch<Product>("/admin/products", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateProduct(slug: string, payload: Partial<Product>): Promise<Product> {
  const json = await apiFetch<Product>(`/admin/products/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiDeleteProduct(slug: string): Promise<void> {
  const json = await apiFetch(`/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}
export async function apiToggleHighlight(slug: string, isHighlight: boolean): Promise<void> {
  const json = await apiFetch(`/admin/products/${encodeURIComponent(slug)}/highlight`, { method: "PATCH", body: JSON.stringify({ isHighlight }) });
  if (!json.success) throw new Error(json.error?.message || "Highlight failed");
}

// ---------------------------------------------------------------------------
// HomeBrand CRUD helpers
// ---------------------------------------------------------------------------
export async function apiCreateHomeBrand(payload: HomeBrand): Promise<HomeBrand> {
  const json = await apiFetch<HomeBrand>("/admin/home-brands", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateHomeBrand(id: string, payload: Partial<HomeBrand>): Promise<HomeBrand> {
  const json = await apiFetch<HomeBrand>(`/admin/home-brands/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiDeleteHomeBrand(id: string): Promise<void> {
  const json = await apiFetch(`/admin/home-brands/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}

// ---------------------------------------------------------------------------
// ProductCategory CRUD helpers
// ---------------------------------------------------------------------------
export async function apiCreateProductCategory(payload: Partial<ProductCategory>): Promise<ProductCategory> {
  const json = await apiFetch<ProductCategory>("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateProductCategory(slug: string, payload: Partial<ProductCategory>): Promise<ProductCategory> {
  const json = await apiFetch<ProductCategory>(`/admin/categories/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiToggleCategoryActive(slug: string, isActive: boolean): Promise<void> {
  const json = await apiFetch(`/admin/categories/${encodeURIComponent(slug)}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  if (!json.success) throw new Error(json.error?.message || "Toggle failed");
}
export async function apiDeleteProductCategory(slug: string): Promise<void> {
  const json = await apiFetch(`/admin/categories/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}

export async function apiCreateMasterBrand(payload: Partial<MasterBrand>): Promise<MasterBrand> {
  const json = await apiFetch<MasterBrand>("/admin/brands", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateMasterBrand(slug: string, payload: Partial<MasterBrand>): Promise<MasterBrand> {
  const json = await apiFetch<MasterBrand>(`/admin/brands/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiToggleMasterBrandActive(slug: string, isActive: boolean): Promise<void> {
  const json = await apiFetch(`/admin/brands/${encodeURIComponent(slug)}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  if (!json.success) throw new Error(json.error?.message || "Toggle failed");
}
export async function apiDeleteMasterBrand(slug: string): Promise<void> {
  const json = await apiFetch(`/admin/brands/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}

"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../i18n";

function Reveal({ children, delay = 0, y = 18, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>;
}

const COPY = {
  en: {
    kicker: "ABOUT US — EST. 2019 · JAKARTA",
    titleA: "We keep the chain",
    titleB: "short so flavour stays honest.",
    lead: "NaturaFoods is a Jakarta-based distributor bridging makers and kitchens. We import directly from Belgium, Ecuador & Uji — holding stock in Jakarta so 400+ cafés, hotels and bakeries get fresh couverture and stone-milled matcha without import hassle.",
    toc: ["Story", "Journey", "Supply chain", "Values", "Origins", "Warehouse"],
    storyEyebrow: "01 — STORY",
    storyTitle: "Distributor,",
    storyTitleIt: "not just a supplier.",
    storyP1: "We started in 2019 supplying Belgian couverture to a handful of specialty cafés in Jakarta who were tired of inconsistent temper and grey-market stock. No local holder meant months of waiting, broken cold-chain, and flavour that arrived tired.",
    storyP2: "So we did the unsexy part: licenses, BPOM, HACCP warehouse, temp-logged containers. Direct relationships with makers in Belgium and stone mills in Uji & Yame. Nitrogen-sealed matcha, callets shipped at 18 °C, landed and held at stable temperature in Jakarta.",
    storyP3: "Today the chain is two steps: maker → us → your kitchen. Same temper, same whisk, every service.",
    quote: "If we wouldn't serve it at our own bar, we don't ship it.",
    quoteBy: "— Founder, NaturaFoods",
    stats: [{ k: "400+", v: "HORECA partners" }, { k: "3", v: "origins direct" }, { k: "48h", v: "Jabodetabek delivery" }, { k: "6kg", v: "MOQ wholesale" }],
    journeyEyebrow: "02 — JOURNEY",
    journeyTitle: "Built slowly,",
    journeyTitleIt: "built to last.",
    timeline: [
      { y: "2019", t: "Founded in Jakarta", d: "One container of Belgian couverture for 12 specialty cafés. Licensed import, BPOM registration — the boring foundation that matters." },
      { y: "2020", t: "Cold-chain first", d: "Temp-logged warehouse in Jakarta, HACCP certification. Replacements guaranteed for melt or damage." },
      { y: "2021", t: "Matcha from Uji & Yame", d: "Direct sourcing, nitrogen-sealed bags, stone-milled in Uji. Ceremonial to culinary, held at -1 °C to 5 °C." },
      { y: "2022", t: "100 partners", d: "Monthly barista & pastry training, costed recipes, seasonal menu development — free for partners." },
      { y: "2024", t: "400+ partners nationwide", d: "Jakarta · Surabaya · Bali. Net-14 terms, consignment for high-volume partners, 48h restock." },
      { y: "Today", t: "Same ritual, every cup", d: "We hold stock so you don't chase imports. COA on request, batch traceability on every bag." },
    ],
    chainEyebrow: "03 — HOW IT WORKS",
    chainTitle: "From origin to cup,",
    chainTitleIt: "two steps.",
    steps: [
      { n: "01", t: "Direct sourcing", d: "We buy from makers, not traders — Belgian couverture (Ecuador single-origin) and Uji/Yame stone mills. COA and harvest lot on every shipment." },
      { n: "02", t: "Cold-chain logistics", d: "Reefer containers, 18 °C couverture, nitrogen-sealed matcha. Temp-logged Jakarta warehouse, FIFO rotation." },
      { n: "03", t: "QC & compliance", d: "BPOM, HALAL, HACCP. Batch traceability, retained samples, COA on request. Melt/damage replacements." },
      { n: "04", t: "Training & menu", d: "Free barista & pastry workshops, costed recipes, seasonal LTOs developed with your team. Samples & kit available." },
    ],
    valuesEyebrow: "04 — VALUES",
    values: [
      { t: "Quality without theatre", d: "Stable temper, no bloom. Ceremonial matcha that whisk-creams, culinary that foams in milk. We test every lot — if it fails, it doesn't ship." },
      { t: "Partnership over transaction", d: "Net-14, consignment for volume, flexible reorder from 6kg. Recipe costing, yield calc, and menu R&D — on us." },
      { t: "Integrity in the boring parts", d: "Licensed import, proper declaration, halal & HACCP. Paperwork perfect so your kitchen never stops." },
    ],
    originsEyebrow: "05 — ORIGINS",
    origins: [
      { place: "BELGIUM · ECUADOR", name: "Couverture", desc: "Callets for drinks, ganache & moulding. Belgian craft, Ecuadorian cacao 72%.", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" },
      { place: "UJI · YAME · NISHIO", name: "Matcha", desc: "Stone-milled, nitrogen-sealed. Ceremonial Yame, culinary Nishio, roasted Hojicha.", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" },
    ],
    whEyebrow: "06 — WAREHOUSE",
    whTitle: "Cold-chain,",
    whTitleIt: "not cold words.",
    whBullets: ["Temp-logged 24/7, 18–20 °C chocolate room · -1 to 5 °C matcha vault", "Batch traceability, FIFO, retained samples · COA per lot", "48h Jabodetabek delivery in insulated boxes · nationwide 2–4 days", "Replacements for melt/damage — no questions on first report"],
    ctaTitle: "Supply that keeps the ritual consistent.",
    ctaDesc: "Tell us your outlet, volume and city — we send a price list and samples within 24h. No commitment.",
    ctaBtn: "BECOME A PARTNER",
  },
  id: {
    kicker: "TENTANG KAMI — EST. 2019 · JAKARTA",
    titleA: "Rantai kami pendek",
    titleB: "agar rasa tetap jujur.",
    lead: "NaturaFoods menjembatani produsen dan dapur. Impor langsung dari Belgia, Ekuador & Uji — stok di Jakarta agar 400+ kafe, hotel dan bakery dapat couverture segar & matcha giling batu tanpa repot impor.",
    toc: ["Cerita", "Perjalanan", "Rantai Pasok", "Nilai", "Asal", "Gudang"],
    storyEyebrow: "01 — CERITA",
    storyTitle: "Distributor,",
    storyTitleIt: "bukan sekadar pemasok.",
    storyP1: "2019 kami mulai memasok couverture Belgia untuk segelintir kafe specialty di Jakarta yang lelah dengan temper tidak stabil & stok grey-market. Tanpa pemegang lokal, tunggu berbulan-bulan, rantai dingin putus, rasa tiba sudah lelah.",
    storyP2: "Maka kami kerjakan bagian tak glamor: lisensi, BPOM, gudang HACCP, kontainer tercatat suhu. Relasi langsung dengan maker Belgia & stone mill Uji & Yame. Matcha segel nitrogen, callets dikirim 18 °C, tiba dan disimpan suhu stabil.",
    storyP3: "Kini rantai hanya dua langkah: produsen → kami → dapur Anda. Temper sama, whisk sama, setiap service.",
    quote: "Jika tak layak kami sajikan di bar sendiri, tak kami kirim.",
    quoteBy: "— Founder, NaturaFoods",
    stats: [{ k: "400+", v: "mitra HORECA" }, { k: "3", v: "asal langsung" }, { k: "48j", v: "pengiriman Jabodetabek" }, { k: "6kg", v: "MOQ grosir" }],
    journeyEyebrow: "02 — PERJALANAN",
    journeyTitle: "Dibangun pelan,",
    journeyTitleIt: "dibangun awet.",
    timeline: [
      { y: "2019", t: "Didirikan di Jakarta", d: "Satu kontainer couverture Belgia untuk 12 kafe. Impor berizin, registrasi BPOM — fondasi membosankan yang penting." },
      { y: "2020", t: "Rantai dingin dulu", d: "Gudang tercatat suhu, sertifikasi HACCP. Garansi ganti jika meleleh/rusak." },
      { y: "2021", t: "Matcha dari Uji & Yame", d: "Sumber langsung, nitrogen-sealed, giling batu di Uji. Seremonial hingga kuliner, simpan -1 °C s/d 5 °C." },
      { y: "2022", t: "100 mitra", d: "Pelatihan barista & pastry bulanan, resep dengan costing, pengembangan menu musiman — gratis untuk mitra." },
      { y: "2024", t: "400+ mitra nasional", d: "Jakarta · Surabaya · Bali. Termin Net-14, konsinyasi volume tinggi, restock 48 jam." },
      { y: "Hari ini", t: "Ritual sama, tiap cangkir", d: "Kami pegang stok agar Anda tak kejar impor. COA on request, traceability batch di tiap kemasan." },
    ],
    chainEyebrow: "03 — CARA KERJA",
    chainTitle: "Dari asal ke cangkir,",
    chainTitleIt: "dua langkah.",
    steps: [
      { n: "01", t: "Sumber langsung", d: "Beli dari produsen, bukan trader — couverture Belgia (single-origin Ekuador) & stone mill Uji/Yame. COA & lot panen di tiap pengiriman." },
      { n: "02", t: "Logistik rantai dingin", d: "Kontainer reefer, couverture 18 °C, matcha nitrogen-sealed. Gudang Jakarta tercatat suhu, rotasi FIFO." },
      { n: "03", t: "QC & kepatuhan", d: "BPOM, HALAL, HACCP. Traceability batch, sampel retensi, COA on request. Ganti jika rusak/meleleh." },
      { n: "04", t: "Pelatihan & menu", d: "Workshop barista & pastry gratis, resep dengan costing, LTO musiman bersama tim Anda. Sampel & kit tersedia." },
    ],
    valuesEyebrow: "04 — NILAI",
    values: [
      { t: "Kualitas tanpa gimmick", d: "Temper stabil, tanpa bloom. Matcha seremonial creamy, kuliner tetap foam di susu. Tiap lot kami uji — gagal, tak kirim." },
      { t: "Kemitraan, bukan transaksi", d: "Net-14, konsinyasi volume, reorder fleksibel dari 6kg. Hitung costing, yield, R&D menu — kami bantu." },
      { t: "Integritas di hal membosankan", d: "Impor berizin, deklarasi benar, halal & HACCP. Administrasi beres agar dapur tak pernah berhenti." },
    ],
    originsEyebrow: "05 — ASAL",
    origins: [
      { place: "BELGIA · EKUADOR", name: "Couverture", desc: "Callets untuk minuman, ganache & cetakan. Craft Belgia, kakao Ekuador 72%.", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" },
      { place: "UJI · YAME · NISHIO", name: "Matcha", desc: "Giling batu, nitrogen-sealed. Ceremonial Yame, kuliner Nishio, Hojicha panggang.", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" },
    ],
    whEyebrow: "06 — GUDANG",
    whTitle: "Rantai dingin,",
    whTitleIt: "bukan janji dingin.",
    whBullets: ["Tercatat suhu 24/7, ruang cokelat 18–20 °C · vault matcha -1 s/d 5 °C", "Traceability batch, FIFO, sampel retensi · COA per lot", "Pengiriman Jabodetabek 48 jam box insulated · nasional 2–4 hari", "Ganti jika meleleh/rusak — tanpa pertanyaan di laporan pertama"],
    ctaTitle: "Pasokan yang menjaga ritual tetap konsisten.",
    ctaDesc: "Beri tahu outlet, volume & kota — kami kirim daftar harga & sampel dalam 24 jam. Tanpa komitmen.",
    ctaBtn: "JADI MITRA",
  },
  zh: {
    kicker: "关于我们 — 始于 2019 · 雅加达",
    titleA: "让供应链更短，",
    titleB: "让风味更真实。",
    lead: "NaturaFoods 连接原产地与厨房。直采比利时、厄瓜多尔与宇治 — 在雅加达备货，400+咖啡馆、酒店与烘焙店无需繁琐进口即可获得新鲜调温巧克力与石磨抹茶。",
    toc: ["故事", "历程", "供应链", "价值观", "产地", "仓库"],
    storyEyebrow: "01 — 故事",
    storyTitle: "分销商，",
    storyTitleIt: "不只是供应商。",
    storyP1: "2019年，我们为雅加达几家厌倦回温不稳与灰色库存的精品咖啡馆供应比利时调温巧克力。没有本地备货，等待数月、冷链断裂、风味抵达时已疲惫。",
    storyP2: "于是我们做了枯燥但关键的事：持证进口、BPOM、HACCP仓库、全程温控集装箱。直连比利时 makers 与宇治·八女石磨。氮气密封抹茶，18°C 运输纽扣巧克力，在雅加达恒温仓储。",
    storyP3: "如今链条只有两步：产地 → 我们 → 你的厨房。每次出品，回温与点茶都一致。",
    quote: "我们自己吧台不用的，就不会发货。",
    quoteBy: "— NaturaFoods 创始人",
    stats: [{ k: "400+", v: "酒店餐饮伙伴" }, { k: "3", v: "直采产地" }, { k: "48小时", v: "雅加达都市圈" }, { k: "6kg", v: "批发起订量" }],
    journeyEyebrow: "02 — 历程",
    journeyTitle: "慢慢做，",
    journeyTitleIt: "做长久。",
    timeline: [
      { y: "2019", t: "雅加达创立", d: "首柜比利时调温巧克力，供12家精品咖啡馆。持证进口、BPOM备案 — 枯燥却重要的地基。" },
      { y: "2020", t: "先做冷链", d: "温控仓库、HACCP认证。融化/破损包换。" },
      { y: "2021", t: "宇治·八女抹茶", d: "直采、氮气密封、宇治石磨。仪式级至料理级，-1°C至5°C恒温保存。" },
      { y: "2022", t: "100 家伙伴", d: "每月咖啡师与甜点培训、成本化配方、季节菜单共创 — 对伙伴免费。" },
      { y: "2024", t: "400+ 全国伙伴", d: "雅加达·泗水·巴厘岛。Net-14账期、高销量寄售、48小时补货。" },
      { y: "今天", t: "每一杯，同样仪式", d: "我们备货，你无需追逐进口。按需提供COA，批次全程可追溯。" },
    ],
    chainEyebrow: "03 — 如何运作",
    chainTitle: "从产地到杯中，",
    chainTitleIt: "两步直达。",
    steps: [
      { n: "01", t: "直采", d: "直接向 makers 采购 — 比利时调温（厄瓜多尔单一产地）与宇治·八女石磨。每批附 COA 与采收批次。" },
      { n: "02", t: "冷链物流", d: "冷藏集装箱、18°C巧克力、氮气密封抹茶。雅加达温控仓库、FIFO轮转。" },
      { n: "03", t: "品控与合规", d: "BPOM、清真、HACCP。批次追溯、留样、按需COA。融化/破损包换。" },
      { n: "04", t: "培训与菜单", d: "免费咖啡师与甜点工作坊、成本化配方、与团队共研季节限定。提供样品与套件。" },
    ],
    valuesEyebrow: "04 — 价值观",
    values: [
      { t: "品质不靠噱头", d: "回温稳定、无白霜。仪式级能打出绵密泡沫，料理级在牛奶中依然绵密。每批必检 — 不合格不发货。" },
      { t: "伙伴而非交易", d: "Net-14、高销量寄售、6kg起灵活补货。配方成本、产出计算、菜单研发 — 我们负责。" },
      { t: "在枯燥处讲诚信", d: "持证进口、合规申报、清真与HACCP。把繁琐做对，你的厨房不停摆。" },
    ],
    originsEyebrow: "05 — 产地",
    origins: [
      { place: "比利时 · 厄瓜多尔", name: "调温巧克力", desc: "纽扣状，适用于饮品、甘纳许与模具。比利时工艺、厄瓜多尔可可72%。", img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" },
      { place: "宇治 · 八女 · 西尾", name: "抹茶", desc: "石磨、氮气密封。仪式级八女、料理级西尾、焙茶。", img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=800&q=80" },
    ],
    whEyebrow: "06 — 仓库",
    whTitle: "冷链，",
    whTitleIt: "不是空话。",
    whBullets: ["24/7温控记录，巧克力间18–20°C · 抹茶库-1至5°C", "批次追溯、FIFO、留样 · 每批COA", "雅加达都市圈48小时保温箱配送 · 全国2–4天", "融化/破损包换 — 首次报告无条件处理"],
    ctaTitle: "让仪式感始终如一的供应。",
    ctaDesc: "告诉我们门店、用量与城市 — 24小时内发送报价与样品。无任何承诺。",
    ctaBtn: "成为伙伴",
  },
} as const;

export default function AboutPage() {
  const { locale, t } = useLang();
  const L = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#FFFCF2] overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <div className="grid gap-8 py-8 sm:py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-14 lg:py-16">
            <div>
              <Reveal><p className="text-[10px] tracking-[0.22em] sm:text-[11px] text-[#8B6F47]">{L.kicker}</p></Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-3 font-[var(--font-display)] text-[34px] sm:text-[42px] font-light leading-[0.92] tracking-[-0.02em] text-[#2D4A22] md:text-[52px] lg:text-[60px]">
                  {L.titleA}<br /><span className="font-normal italic">{L.titleB}</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}><p className="mt-5 max-w-[58ch] text-[14px] leading-7 text-[#1a1a16]/60 sm:text-[15px]">{L.lead}</p></Reveal>
              <Reveal delay={0.18} className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => scrollTo("story")} className="inline-flex items-center gap-1.5 rounded-full bg-[#2D4A22] px-6 py-3 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">EXPLORE STORY <ArrowRight className="h-3.5 w-3.5" /></button>
                <Link href="/contact" className="rounded-full border border-[#2D4A22]/15 bg-white px-6 py-3 text-[11px] tracking-[0.14em] text-[#2D4A22] hover:bg-[#FFF7E8]">{L.ctaBtn}</Link>
              </Reveal>
              <Reveal delay={0.22} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {L.stats.map((s) => (
                  <div key={s.k} className="rounded-2xl border border-[#2D4A22]/10 bg-white px-4 py-4">
                    <div className="font-[var(--font-display)] text-[20px] font-medium leading-none text-[#2D4A22]">{s.k}</div>
                    <div className="mt-1 text-[11px] tracking-[0.08em] text-[#8B6F47]">{s.v}</div>
                  </div>
                ))}
              </Reveal>
            </div>
            <motion.div style={{ y: heroY }} className="relative">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[28px] bg-[#F5EFE0] shadow-[0_24px_60px_rgba(45,74,34,0.12)]">
                <motion.img style={{ scale: heroScale }} src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80" alt="NaturaFoods" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
                  <div><div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">JAKARTA WAREHOUSE</div><div className="text-[12px] font-medium text-[#2D4A22]">Temp-logged · HACCP</div></div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D4A22] text-white"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-[#2D4A22]/10 md:block" />
            </motion.div>
          </div>
        </div>

        {/* sticky TOC */}
        <div className="sticky top-[64px] z-20 border-y border-[#2D4A22]/10 bg-[#FFFCF2]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1280px] items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 text-[10px] tracking-[0.18em] text-[#8B6F47] sm:block">JUMP TO</span>
            {L.toc.map((label, i) => {
              const ids = ["story", "journey", "chain", "values", "origins", "warehouse"];
              return (
                <button key={label} onClick={() => scrollTo(ids[i])} className="shrink-0 rounded-full border border-[#2D4A22]/10 bg-white px-4 py-2 text-[11px] tracking-[0.1em] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white hover:border-[#2D4A22] transition">
                  {label}
                </button>
              );
            })}
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              {t.aboutBadges.map((b) => (
                <span key={b} className="rounded-full bg-[#2D4A22] px-3 py-1 text-[10px] tracking-[0.12em] text-white">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[#2D4A22]/10 bg-white py-3">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="flex w-max gap-8 whitespace-nowrap text-[11px] tracking-[0.2em] text-[#2D4A22]/60">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8">{t.marquee.map((s) => <span key={s} className="flex items-center gap-8">{s} <span className="h-1 w-1 rounded-full bg-[#C4B5A0]" /></span>)} </span>
          ))}
        </motion.div>
      </div>

      {/* STORY */}
      <section id="story" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:items-start">
          <div>
            <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.storyEyebrow}</p></Reveal>
            <Reveal delay={0.06}><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none tracking-tight text-[#2D4A22] md:text-[44px]">{L.storyTitle}<br /><span className="italic font-normal">{L.storyTitleIt}</span></h2></Reveal>
            <Reveal delay={0.12} className="mt-6 grid gap-4 text-[14px] leading-7 text-[#1a1a16]/70">
              <p>{L.storyP1}</p>
              <p>{L.storyP2}</p>
              <p className="font-medium text-[#2D4A22]">{L.storyP3}</p>
            </Reveal>
            <Reveal delay={0.18} className="mt-8 flex gap-5 border-l-2 border-[#2D4A22]/15 pl-5">
              <blockquote className="font-[var(--font-display)] text-[18px] italic leading-7 text-[#2D4A22]">“{L.quote}”<span className="mt-2 block font-sans text-[11px] not-italic tracking-[0.12em] text-[#8B6F47]">{L.quoteBy}</span></blockquote>
            </Reveal>
          </div>
          <div className="grid gap-4">
            <Reveal y={24} className="overflow-hidden rounded-[24px] bg-[#FFF7E8]">
              <img src="https://images.unsplash.com/photo-1511381939415-e44015466834?w=900&q=80" alt="Couverture" className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">WHAT WE HOLD</div>
                <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/70">Belgian callets, Ecuador 72%, Uji ceremonial — in stock, not indent. Your par goes from months to days.</div>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-[#2D4A22] p-5 text-white">
                <div className="text-[11px] tracking-[0.14em] text-white/60">PROMISE</div>
                <div className="mt-2 font-[var(--font-display)] text-[15px] leading-6">No grey-market. No mystery repack. Lot-tracked, COA-backed.</div>
              </div>
              <div className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">FOR HORECA</div>
                <div className="mt-2 text-[13px] leading-6 text-[#1a1a16]/70">Cafés · Hotels · Bakeries · Restaurants — MOQ 6kg, reorder anytime.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section id="journey" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.journeyEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.journeyTitle} <span className="italic font-normal">{L.journeyTitleIt}</span></h2></Reveal>
          <div className="relative mt-10 grid gap-0 md:grid-cols-[1fr_1fr] md:gap-8">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#2D4A22]/10" />
            {L.timeline.map((s, i) => (
              <Reveal key={s.y} delay={i * 0.06} className={`relative flex gap-4 py-6 md:py-8 ${i % 2 === 0 ? "md:pr-10 md:text-right md:flex-row-reverse" : "md:col-start-2 md:pl-10"}`}>
                <div className="hidden md:block absolute top-8 h-3 w-3 rounded-full border-2 border-[#2D4A22] bg-white shadow-sm" style={{ [i % 2 === 0 ? "right" : "left"]: "-6px" } as never} />
                <div className="shrink-0">
                  <span className="inline-flex rounded-full bg-[#2D4A22] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white">{s.y}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#2D4A22]">{s.t}</div>
                  <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/60">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPLY CHAIN */}
      <section id="chain" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.chainEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.chainTitle}<br /><span className="italic font-normal">{L.chainTitleIt}</span></h2></Reveal>
          <Reveal delay={0.08} className="max-w-[38ch] text-[13px] leading-6 text-[#1a1a16]/60">Maker → NaturaFoods → your kitchen. Two steps, cold-chain intact, paperwork clean.</Reveal>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {L.steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07} className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-6">
              <div className="text-[11px] tracking-[0.2em] text-[#C4B5A0]">{s.n}</div>
              <h3 className="mt-3 font-[var(--font-display)] text-[17px] font-medium text-[#2D4A22]">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{s.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-6 overflow-hidden rounded-[24px] border border-[#2D4A22]/10 bg-[#FFF7E8] md:flex">
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80" alt="Cafe" className="h-56 w-full object-cover md:h-auto md:w-[46%]" />
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">WHY TWO STEPS MATTERS</div>
            <div className="mt-2 font-[var(--font-display)] text-[20px] leading-tight text-[#2D4A22]">Short chain = stable flavour, stable cost.</div>
            <p className="mt-3 text-[13px] leading-6 text-[#1a1a16]/60">No consolidator margin, no repack expiry risk, no months of ocean + customs. You order this week, you serve this week.</p>
            <Link href="/products" className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.14em] text-white">VIEW PRODUCTS <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </Reveal>
      </section>

      {/* VALUES */}
      <section id="values" className="bg-[#F5EFE0]/60">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.valuesEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light text-[#2D4A22] md:text-[42px]">Values you can taste.</h2></Reveal>
          <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
            {L.values.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08} className="rounded-[24px] bg-white p-6 sm:p-7 border border-[#2D4A22]/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFCF2] border border-[#2D4A22]/10 text-[#2D4A22]"><Check className="h-4 w-4" /></div>
                <h3 className="mt-4 font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">{v.t}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ORIGINS */}
      <section id="origins" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.originsEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light text-[#2D4A22] md:text-[42px]">Origins, directly held.</h2></Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {L.origins.map((o, i) => (
            <Reveal key={o.name} delay={i * 0.08} className="group overflow-hidden rounded-[24px] border border-[#2D4A22]/10 bg-white">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5EFE0]"><img src={o.img} alt={o.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /></div>
              <div className="p-6">
                <div className="text-[11px] tracking-[0.16em] text-[#8B6F47]">{o.place}</div>
                <div className="mt-1 font-[var(--font-display)] text-[20px] font-medium text-[#2D4A22]">{o.name}</div>
                <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/60">{o.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WAREHOUSE */}
      <section id="warehouse" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <Reveal className="overflow-hidden rounded-[24px] bg-[#FFF7E8] border border-[#2D4A22]/10">
              <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80" alt="Warehouse" className="aspect-[4/3] w-full object-cover" />
              <div className="grid grid-cols-3 divide-x divide-[#2D4A22]/10 border-t border-[#2D4A22]/10 bg-white text-center">
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">18–20°C</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">CHOCOLATE</div></div>
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">-1 to 5°C</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">MATCHA</div></div>
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">24/7</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">LOGGED</div></div>
              </div>
            </Reveal>
            <div>
              <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.whEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.whTitle}<br /><span className="italic font-normal">{L.whTitleIt}</span></h2></Reveal>
              <Reveal delay={0.08} className="mt-6 grid gap-3">
                {L.whBullets.map((b) => (
                  <div key={b} className="flex gap-3 rounded-2xl border border-[#2D4A22]/10 bg-[#FFFCF2] px-4 py-3 text-[13px] leading-6 text-[#1a1a16]/70"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D4A22]" />{b}</div>
                ))}
              </Reveal>
              <Reveal delay={0.14} className="mt-6 flex flex-wrap gap-2">
                {t.aboutBadges.map((b) => <span key={b} className="rounded-full border border-[#2D4A22]/10 bg-[#FFFCF2] px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22]">{b}</span>)}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D4A22] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1280px] grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <Reveal><p className="text-[11px] tracking-[0.2em] text-white/60">LET&apos;S WORK TOGETHER</p><h2 className="mt-3 font-[var(--font-display)] text-[28px] sm:text-[34px] font-light leading-none text-white md:text-[42px]">{L.ctaTitle}</h2><p className="mt-4 max-w-[52ch] text-[13px] leading-6 text-white/65">{L.ctaDesc}</p></Reveal>
          </div>
          <Reveal delay={0.1} className="rounded-[24px] bg-white p-6 sm:p-8">
            <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">PARTNER INQUIRY</div>
            <div className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">Response within 24h · samples & barista kit available. Net-14 & consignment for volume.</div>
            <Link href="/contact" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2D4A22] py-3.5 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">{L.ctaBtn} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-[12px]"><a href="mailto:hello@naturafoods.id" className="underline decoration-[#2D4A22]/20 underline-offset-4 text-[#2D4A22]">hello@naturafoods.id</a><a href="https://wa.me/6281234567890" className="underline decoration-[#2D4A22]/20 underline-offset-4 text-[#2D4A22]">WhatsApp</a></div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

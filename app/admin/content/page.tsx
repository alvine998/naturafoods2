"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang, locales, type Locale, dict } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card } from "../_components";
import { loadRaw, saveRaw, clearOverrides, deepSet } from "../../lib/siteContent";

type GroupKey = "home" | "nav" | "about" | "aboutDetail" | "products" | "articles" | "education" | "innovation" | "contact" | "careers";

const GROUP_PATHS: Record<GroupKey, string[][]> = {
  home: [["heroBadge"], ["heroTitle1"], ["heroTitleItalic"], ["heroTitleAfterItalic"], ["heroTitleLine3"], ["heroTitleLine4"], ["heroDesc"], ["viewCatalog"], ["companyProfile"], ["stat1k"], ["stat1v"], ["stat2k"], ["stat2v"], ["stat3k"], ["stat3v"], ["cardChocoLabel"], ["cardMatchaLabel"], ["cardPriceEyebrow"], ["cardPriceTitle"], ["cardPriceSub"], ["cardRequestPrice"], ["marquee"], ["aboutEyebrow"], ["aboutTitle1"], ["aboutTitle2"], ["aboutDesc"], ["aboutBullets"], ["aboutQuote"], ["aboutQuoteAttr"], ["aboutBadges"], ["chocoEyebrow"], ["chocoTitle1"], ["chocoTitle2"], ["chocoDesc"], ["matchaEyebrow"], ["matchaTitle1"], ["matchaTitle2"], ["matchaDesc"], ["requestQuote"], ["bannerEyebrow"], ["bannerTitle1"], ["bannerTitleItalic"], ["bannerTitle3"], ["bannerDesc"], ["partnersEyebrow"], ["partnersTitle1"], ["partnersTitle2"], ["trustedBy"], ["morePartners"], ["contactTitle"], ["contactDesc"], ["contactAddr"], ["formOutlet"], ["formCity"], ["formInterest"], ["formInterests"], ["formWhatsapp"], ["formEmail"], ["formSubmit"], ["formFoot"], ["formThanks"], ["formThanksSuffix"], ["footerCopy"], ["footerLinks"], ["splashSub"], ["splashFoot"]],
  nav: [["nav", "about"], ["nav", "choco"], ["nav", "matcha"], ["nav", "partners"], ["nav", "contact"], ["nav", "becomePartner"]],
  about: [["aboutPage", "eyebrow"], ["aboutPage", "title"], ["aboutPage", "desc"], ["aboutPage", "mission"], ["aboutPage", "missionDesc"]],
  aboutDetail: [["aboutDetail", "kicker"], ["aboutDetail", "titleA"], ["aboutDetail", "titleB"], ["aboutDetail", "lead"], ["aboutDetail", "toc"], ["aboutDetail", "storyEyebrow"], ["aboutDetail", "storyTitle"], ["aboutDetail", "storyTitleIt"], ["aboutDetail", "storyP1"], ["aboutDetail", "storyP2"], ["aboutDetail", "storyP3"], ["aboutDetail", "quote"], ["aboutDetail", "quoteBy"], ["aboutDetail", "journeyEyebrow"], ["aboutDetail", "journeyTitle"], ["aboutDetail", "journeyTitleIt"], ["aboutDetail", "chainEyebrow"], ["aboutDetail", "chainTitle"], ["aboutDetail", "chainTitleIt"], ["aboutDetail", "valuesEyebrow"], ["aboutDetail", "originsEyebrow"], ["aboutDetail", "whEyebrow"], ["aboutDetail", "whTitle"], ["aboutDetail", "whTitleIt"], ["aboutDetail", "whBullets"], ["aboutDetail", "ctaTitle"], ["aboutDetail", "ctaDesc"], ["aboutDetail", "ctaBtn"]],
  products: [["productsPage", "eyebrow"], ["productsPage", "title"], ["productsPage", "desc"], ["productsPage", "all"], ["productsPage", "choco"], ["productsPage", "matcha"]],
  articles: [["articlesPage", "eyebrow"], ["articlesPage", "title"], ["articlesPage", "desc"], ["articlesPage", "readMore"], ["articlesPage", "empty"], ["articleDetail", "back"], ["articleDetail", "notFound"]],
  education: [["eduPage", "eyebrow"], ["eduPage", "title"], ["eduPage", "desc"], ["eduPage", "level"], ["eduPage", "duration"], ["eduPage", "join"]],
  innovation: [["innovPage", "eyebrow"], ["innovPage", "title"], ["innovPage", "desc"]],
  contact: [["contactPage", "eyebrow"], ["contactPage", "title"], ["contactPage", "desc"], ["contactPage", "infoTitle"], ["contactPage", "formTitle"], ["contactPage", "addr"], ["contactPage", "email"], ["contactPage", "phone"], ["contactPage", "hours"], ["contactPage", "hoursVal"]],
  careers: [["careersPage", "eyebrow"], ["careersPage", "title"], ["careersPage", "desc"], ["careersPage", "dept"], ["careersPage", "loc"], ["careersPage", "type"], ["careersPage", "apply"], ["careersPage", "empty"]],
};

const GROUP_ORDER: GroupKey[] = ["home", "nav", "about", "aboutDetail", "products", "articles", "education", "innovation", "contact", "careers"];

const FIELD_LABELS: Record<Locale, Record<string, string>> = {
  "en": {
    "heroBadge": "Hero Badge",
    "heroTitle1": "Hero Title1",
    "heroTitleItalic": "Hero Title Italicalic",
    "heroTitleAfterItalic": "Hero Title After Italicalic",
    "heroTitleLine3": "Hero Title Line3",
    "heroTitleLine4": "Hero Title Line4",
    "heroDesc": "Hero Desc",
    "viewCatalog": "View Catalog",
    "companyProfile": "Company Profile",
    "stat1k": "Stat1k",
    "stat1v": "Stat1v",
    "stat2k": "Stat2k",
    "stat2v": "Stat2v",
    "stat3k": "Stat3k",
    "stat3v": "Stat3v",
    "cardChocoLabel": "Card Choco Label",
    "cardMatchaLabel": "Card Matcha Label",
    "cardPriceEyebrow": "Card Price Eyebrow",
    "cardPriceTitle": "Card Price Title",
    "cardPriceSub": "Card Price Sub",
    "cardRequestPrice": "Card Request Price",
    "marquee": "Marquee",
    "aboutEyebrow": "About Eyebrow",
    "aboutTitle1": "About Title1",
    "aboutTitle2": "About Title2",
    "aboutDesc": "About Desc",
    "aboutBullets": "About Bullets",
    "aboutQuote": "About Quote",
    "aboutQuoteAttr": "About Quote Attr",
    "aboutBadges": "About Badges",
    "chocoEyebrow": "Choco Eyebrow",
    "chocoTitle1": "Choco Title1",
    "chocoTitle2": "Choco Title2",
    "chocoDesc": "Choco Desc",
    "matchaEyebrow": "Matcha Eyebrow",
    "matchaTitle1": "Matcha Title1",
    "matchaTitle2": "Matcha Title2",
    "matchaDesc": "Matcha Desc",
    "requestQuote": "Request Quote",
    "bannerEyebrow": "Banner Eyebrow",
    "bannerTitle1": "Banner Title1",
    "bannerTitleItalic": "Banner Title Italicalic",
    "bannerTitle3": "Banner Title3",
    "bannerDesc": "Banner Desc",
    "partnersEyebrow": "Partners Eyebrow",
    "partnersTitle1": "Partners Title1",
    "partnersTitle2": "Partners Title2",
    "trustedBy": "Trusted By",
    "morePartners": "More Partners",
    "contactTitle": "Contact Title",
    "contactDesc": "Contact Desc",
    "contactAddr": "Contact Addr",
    "formOutlet": "Form Outlet",
    "formCity": "Form City",
    "formInterest": "Form Interest",
    "formInterests": "Form Interests",
    "formWhatsapp": "Form Whatsapp",
    "formEmail": "Form Email",
    "formSubmit": "Form Submit",
    "formFoot": "Form Foot",
    "formThanks": "Form Thanks",
    "formThanksSuffix": "Form Thanks Suffix",
    "footerCopy": "Footer Copy",
    "footerLinks": "Footer Links",
    "splashSub": "Splash Sub",
    "splashFoot": "Splash Foot",
    "nav.about": "Navigation · About",
    "nav.choco": "Navigation · Choco",
    "nav.matcha": "Navigation · Matcha",
    "nav.partners": "Navigation · Partners",
    "nav.contact": "Navigation · Contact",
    "nav.becomePartner": "Navigation · Become Partner",
    "aboutPage.eyebrow": "About Page · Eyebrow",
    "aboutPage.title": "About Page · Title",
    "aboutPage.desc": "About Page · Desc",
    "aboutPage.mission": "About Page · Mission",
    "aboutPage.missionDesc": "About Page · Mission Desc",
    "aboutDetail.kicker": "About Detail · Kicker",
    "aboutDetail.titleA": "About Detail · Title A",
    "aboutDetail.titleB": "About Detail · Title B",
    "aboutDetail.lead": "About Detail · Lead",
    "aboutDetail.toc": "About Detail · Toc",
    "aboutDetail.storyEyebrow": "About Detail · Story Eyebrow",
    "aboutDetail.storyTitle": "About Detail · Story Title",
    "aboutDetail.storyTitleIt": "About Detail · Story Title Italic",
    "aboutDetail.storyP1": "About Detail · Story P1",
    "aboutDetail.storyP2": "About Detail · Story P2",
    "aboutDetail.storyP3": "About Detail · Story P3",
    "aboutDetail.quote": "About Detail · Quote",
    "aboutDetail.quoteBy": "About Detail · Quote By",
    "aboutDetail.journeyEyebrow": "About Detail · Journey Eyebrow",
    "aboutDetail.journeyTitle": "About Detail · Journey Title",
    "aboutDetail.journeyTitleIt": "About Detail · Journey Title Italic",
    "aboutDetail.chainEyebrow": "About Detail · Chain Eyebrow",
    "aboutDetail.chainTitle": "About Detail · Chain Title",
    "aboutDetail.chainTitleIt": "About Detail · Chain Title Italic",
    "aboutDetail.valuesEyebrow": "About Detail · Values Eyebrow",
    "aboutDetail.originsEyebrow": "About Detail · Origins Eyebrow",
    "aboutDetail.whEyebrow": "About Detail · Warehouse Eyebrow",
    "aboutDetail.whTitle": "About Detail · Warehouse Title",
    "aboutDetail.whTitleIt": "About Detail · Warehouse Title Italic",
    "aboutDetail.whBullets": "About Detail · Warehouse Bullets",
    "aboutDetail.ctaTitle": "About Detail · CTA Title",
    "aboutDetail.ctaDesc": "About Detail · CTA Description",
    "aboutDetail.ctaBtn": "About Detail · CTA Button",
    "productsPage.eyebrow": "Products Page · Eyebrow",
    "productsPage.title": "Products Page · Title",
    "productsPage.desc": "Products Page · Desc",
    "productsPage.all": "Products Page · All",
    "productsPage.choco": "Products Page · Choco",
    "productsPage.matcha": "Products Page · Matcha",
    "articlesPage.eyebrow": "Articles Page · Eyebrow",
    "articlesPage.title": "Articles Page · Title",
    "articlesPage.desc": "Articles Page · Desc",
    "articlesPage.readMore": "Articles Page · Read More",
    "articlesPage.empty": "Articles Page · Empty",
    "articleDetail.back": "Article Detail · Back",
    "articleDetail.notFound": "Article Detail · Not Found",
    "eduPage.eyebrow": "Education Page · Eyebrow",
    "eduPage.title": "Education Page · Title",
    "eduPage.desc": "Education Page · Desc",
    "eduPage.level": "Education Page · Level",
    "eduPage.duration": "Education Page · Duration",
    "eduPage.join": "Education Page · Join",
    "innovPage.eyebrow": "Innovation Page · Eyebrow",
    "innovPage.title": "Innovation Page · Title",
    "innovPage.desc": "Innovation Page · Desc",
    "contactPage.eyebrow": "Contact Page · Eyebrow",
    "contactPage.title": "Contact Page · Title",
    "contactPage.desc": "Contact Page · Desc",
    "contactPage.infoTitle": "Contact Page · Info Title",
    "contactPage.formTitle": "Contact Page · Form Title",
    "contactPage.addr": "Contact Page · Addr",
    "contactPage.email": "Contact Page · Email",
    "contactPage.phone": "Contact Page · Phone",
    "contactPage.hours": "Contact Page · Hours",
    "contactPage.hoursVal": "Contact Page · Hours Val",
    "careersPage.eyebrow": "Careers Page · Eyebrow",
    "careersPage.title": "Careers Page · Title",
    "careersPage.desc": "Careers Page · Desc",
    "careersPage.dept": "Careers Page · Dept",
    "careersPage.loc": "Careers Page · Loc",
    "careersPage.type": "Careers Page · Type",
    "careersPage.apply": "Careers Page · Apply",
    "careersPage.empty": "Careers Page · Empty"
  },
  "id": {
    "heroBadge": "Lencana Hero",
    "heroTitle1": "Judul Hero 1",
    "heroTitleItalic": "Judul Hero Miring",
    "heroTitleAfterItalic": "Judul Hero Setelah Miring",
    "heroTitleLine3": "Judul Hero Baris 3",
    "heroTitleLine4": "Judul Hero Baris 4",
    "heroDesc": "Deskripsi Hero",
    "viewCatalog": "Lihat Katalog",
    "companyProfile": "Profil Perusahaan",
    "stat1k": "Statistik 1 Kunci",
    "stat1v": "Statistik 1 Nilai",
    "stat2k": "Statistik 2 Kunci",
    "stat2v": "Statistik 2 Nilai",
    "stat3k": "Statistik 3 Kunci",
    "stat3v": "Statistik 3 Nilai",
    "cardChocoLabel": "Label Kartu Cokelat",
    "cardMatchaLabel": "Label Kartu Matcha",
    "cardPriceEyebrow": "Eyebrow Kartu Harga",
    "cardPriceTitle": "Judul Kartu Harga",
    "cardPriceSub": "Subjudul Kartu Harga",
    "cardRequestPrice": "Minta Harga (Kartu)",
    "marquee": "Teks Berjalan",
    "aboutEyebrow": "Eyebrow Tentang",
    "aboutTitle1": "Judul Tentang 1",
    "aboutTitle2": "Judul Tentang 2",
    "aboutDesc": "Deskripsi Tentang",
    "aboutBullets": "Poin Tentang",
    "aboutQuote": "Kutipan Tentang",
    "aboutQuoteAttr": "Atribusi Kutipan",
    "aboutBadges": "Lencana Tentang",
    "chocoEyebrow": "Eyebrow Cokelat",
    "chocoTitle1": "Judul Cokelat 1",
    "chocoTitle2": "Judul Cokelat 2",
    "chocoDesc": "Deskripsi Cokelat",
    "matchaEyebrow": "Eyebrow Matcha",
    "matchaTitle1": "Judul Matcha 1",
    "matchaTitle2": "Judul Matcha 2",
    "matchaDesc": "Deskripsi Matcha",
    "requestQuote": "Minta Penawaran",
    "bannerEyebrow": "Eyebrow Banner",
    "bannerTitle1": "Judul Banner 1",
    "bannerTitleItalic": "Judul Banner Miring",
    "bannerTitle3": "Judul Banner 3",
    "bannerDesc": "Deskripsi Banner",
    "partnersEyebrow": "Eyebrow Mitra",
    "partnersTitle1": "Judul Mitra 1",
    "partnersTitle2": "Judul Mitra 2",
    "trustedBy": "Dipercaya Oleh",
    "morePartners": "Mitra Lainnya",
    "contactTitle": "Judul Kontak",
    "contactDesc": "Deskripsi Kontak",
    "contactAddr": "Alamat Kontak",
    "formOutlet": "Outlet Formulir",
    "formCity": "Kota Formulir",
    "formInterest": "Minat Formulir",
    "formInterests": "Pilihan Minat",
    "formWhatsapp": "WhatsApp Formulir",
    "formEmail": "Email Formulir",
    "formSubmit": "Tombol Kirim",
    "formFoot": "Catatan Kaki Formulir",
    "formThanks": "Ucapan Terima Kasih",
    "formThanksSuffix": "Akhiran Terima Kasih",
    "footerCopy": "Teks Footer",
    "footerLinks": "Tautan Footer",
    "splashSub": "Subjudul Splash",
    "splashFoot": "Catatan Kaki Splash",
    "nav.about": "Navigasi · Tentang",
    "nav.choco": "Navigasi · Cokelat",
    "nav.matcha": "Navigasi · Matcha",
    "nav.partners": "Navigasi · Mitra",
    "nav.contact": "Navigasi · Kontak",
    "nav.becomePartner": "Navigasi · Jadi Mitra",
    "aboutPage.eyebrow": "Halaman Tentang · Eyebrow",
    "aboutPage.title": "Halaman Tentang · Judul",
    "aboutPage.desc": "Halaman Tentang · Deskripsi",
    "aboutPage.mission": "Halaman Tentang · Misi",
    "aboutPage.missionDesc": "Halaman Tentang · Deskripsi Misi",
    "aboutDetail.kicker": "Detail Tentang · Kicker",
    "aboutDetail.titleA": "Detail Tentang · Judul A",
    "aboutDetail.titleB": "Detail Tentang · Judul B",
    "aboutDetail.lead": "Detail Tentang · Lead",
    "aboutDetail.toc": "Detail Tentang · Daftar Isi",
    "aboutDetail.storyEyebrow": "Detail Tentang · Eyebrow Cerita",
    "aboutDetail.storyTitle": "Detail Tentang · Judul Cerita",
    "aboutDetail.storyTitleIt": "Detail Tentang · Judul Cerita Miring",
    "aboutDetail.storyP1": "Detail Tentang · Cerita Paragraf 1",
    "aboutDetail.storyP2": "Detail Tentang · Cerita Paragraf 2",
    "aboutDetail.storyP3": "Detail Tentang · Cerita Paragraf 3",
    "aboutDetail.quote": "Detail Tentang · Kutipan",
    "aboutDetail.quoteBy": "Detail Tentang · Sumber Kutipan",
    "aboutDetail.journeyEyebrow": "Detail Tentang · Eyebrow Perjalanan",
    "aboutDetail.journeyTitle": "Detail Tentang · Judul Perjalanan",
    "aboutDetail.journeyTitleIt": "Detail Tentang · Judul Perjalanan Miring",
    "aboutDetail.chainEyebrow": "Detail Tentang · Eyebrow Rantai",
    "aboutDetail.chainTitle": "Detail Tentang · Judul Rantai",
    "aboutDetail.chainTitleIt": "Detail Tentang · Judul Rantai Miring",
    "aboutDetail.valuesEyebrow": "Detail Tentang · Eyebrow Nilai",
    "aboutDetail.originsEyebrow": "Detail Tentang · Eyebrow Asal",
    "aboutDetail.whEyebrow": "Detail Tentang · Eyebrow Gudang",
    "aboutDetail.whTitle": "Detail Tentang · Judul Gudang",
    "aboutDetail.whTitleIt": "Detail Tentang · Judul Gudang Miring",
    "aboutDetail.whBullets": "Detail Tentang · Poin Gudang",
    "aboutDetail.ctaTitle": "Detail Tentang · Judul CTA",
    "aboutDetail.ctaDesc": "Detail Tentang · Deskripsi CTA",
    "aboutDetail.ctaBtn": "Detail Tentang · Tombol CTA",
    "productsPage.eyebrow": "Halaman Produk · Eyebrow",
    "productsPage.title": "Halaman Produk · Judul",
    "productsPage.desc": "Halaman Produk · Deskripsi",
    "productsPage.all": "Halaman Produk · Semua",
    "productsPage.choco": "Halaman Produk · Cokelat",
    "productsPage.matcha": "Halaman Produk · Matcha",
    "articlesPage.eyebrow": "Halaman Artikel · Eyebrow",
    "articlesPage.title": "Halaman Artikel · Judul",
    "articlesPage.desc": "Halaman Artikel · Deskripsi",
    "articlesPage.readMore": "Halaman Artikel · Baca Selengkapnya",
    "articlesPage.empty": "Halaman Artikel · Kosong",
    "articleDetail.back": "Detail Artikel · Kembali",
    "articleDetail.notFound": "Detail Artikel · Tidak Ditemukan",
    "eduPage.eyebrow": "Halaman Edukasi · Eyebrow",
    "eduPage.title": "Halaman Edukasi · Judul",
    "eduPage.desc": "Halaman Edukasi · Deskripsi",
    "eduPage.level": "Halaman Edukasi · Level",
    "eduPage.duration": "Halaman Edukasi · Durasi",
    "eduPage.join": "Halaman Edukasi · Gabung",
    "innovPage.eyebrow": "Halaman Inovasi · Eyebrow",
    "innovPage.title": "Halaman Inovasi · Judul",
    "innovPage.desc": "Halaman Inovasi · Deskripsi",
    "contactPage.eyebrow": "Halaman Kontak · Eyebrow",
    "contactPage.title": "Halaman Kontak · Judul",
    "contactPage.desc": "Halaman Kontak · Deskripsi",
    "contactPage.infoTitle": "Halaman Kontak · Judul Info",
    "contactPage.formTitle": "Halaman Kontak · Judul Formulir",
    "contactPage.addr": "Halaman Kontak · Alamat",
    "contactPage.email": "Halaman Kontak · Email",
    "contactPage.phone": "Halaman Kontak · Telepon",
    "contactPage.hours": "Halaman Kontak · Jam",
    "contactPage.hoursVal": "Halaman Kontak · Nilai Jam",
    "careersPage.eyebrow": "Halaman Karir · Eyebrow",
    "careersPage.title": "Halaman Karir · Judul",
    "careersPage.desc": "Halaman Karir · Deskripsi",
    "careersPage.dept": "Halaman Karir · Departemen",
    "careersPage.loc": "Halaman Karir · Lokasi",
    "careersPage.type": "Halaman Karir · Tipe",
    "careersPage.apply": "Halaman Karir · Lamar",
    "careersPage.empty": "Halaman Karir · Kosong"
  },
  "zh": {
    "heroBadge": "首页徽章",
    "heroTitle1": "首页标题 1",
    "heroTitleItalic": "首页标题斜体",
    "heroTitleAfterItalic": "首页标题后斜体",
    "heroTitleLine3": "首页标题第 3 行",
    "heroTitleLine4": "首页标题第 4 行",
    "heroDesc": "首页描述",
    "viewCatalog": "查看目录",
    "companyProfile": "公司简介",
    "stat1k": "统计 1 标题",
    "stat1v": "统计 1 数值",
    "stat2k": "统计 2 标题",
    "stat2v": "统计 2 数值",
    "stat3k": "统计 3 标题",
    "stat3v": "统计 3 数值",
    "cardChocoLabel": "巧克力卡片标签",
    "cardMatchaLabel": "抹茶卡片标签",
    "cardPriceEyebrow": "价格卡片眉标",
    "cardPriceTitle": "价格卡片标题",
    "cardPriceSub": "价格卡片副标题",
    "cardRequestPrice": "索取报价（卡片）",
    "marquee": "跑马灯",
    "aboutEyebrow": "关于眉标",
    "aboutTitle1": "关于标题 1",
    "aboutTitle2": "关于标题 2",
    "aboutDesc": "关于描述",
    "aboutBullets": "关于要点",
    "aboutQuote": "关于引言",
    "aboutQuoteAttr": "引言出处",
    "aboutBadges": "关于徽章",
    "chocoEyebrow": "巧克力眉标",
    "chocoTitle1": "巧克力标题 1",
    "chocoTitle2": "巧克力标题 2",
    "chocoDesc": "巧克力描述",
    "matchaEyebrow": "抹茶眉标",
    "matchaTitle1": "抹茶标题 1",
    "matchaTitle2": "抹茶标题 2",
    "matchaDesc": "抹茶描述",
    "requestQuote": "索取报价",
    "bannerEyebrow": "横幅眉标",
    "bannerTitle1": "横幅标题 1",
    "bannerTitleItalic": "横幅标题斜体",
    "bannerTitle3": "横幅标题 3",
    "bannerDesc": "横幅描述",
    "partnersEyebrow": "合作伙伴眉标",
    "partnersTitle1": "合作伙伴标题 1",
    "partnersTitle2": "合作伙伴标题 2",
    "trustedBy": "信赖之选",
    "morePartners": "更多合作伙伴",
    "contactTitle": "联系标题",
    "contactDesc": "联系描述",
    "contactAddr": "联系地址",
    "formOutlet": "表单门店",
    "formCity": "表单城市",
    "formInterest": "表单意向",
    "formInterests": "表单意向选项",
    "formWhatsapp": "表单 WhatsApp",
    "formEmail": "表单邮箱",
    "formSubmit": "表单提交按钮",
    "formFoot": "表单脚注",
    "formThanks": "感谢语",
    "formThanksSuffix": "感谢后缀",
    "footerCopy": "页脚版权",
    "footerLinks": "页脚链接",
    "splashSub": "闪屏副标题",
    "splashFoot": "闪屏脚注",
    "nav.about": "导航 · 关于",
    "nav.choco": "导航 · 巧克力",
    "nav.matcha": "导航 · 抹茶",
    "nav.partners": "导航 · 合作伙伴",
    "nav.contact": "导航 · 联系",
    "nav.becomePartner": "导航 · 成为伙伴",
    "aboutPage.eyebrow": "关于页面 · 眉标",
    "aboutPage.title": "关于页面 · 标题",
    "aboutPage.desc": "关于页面 · 描述",
    "aboutPage.mission": "关于页面 · 使命",
    "aboutPage.missionDesc": "关于页面 · 使命描述",
    "aboutDetail.kicker": "关于详情 · 标语",
    "aboutDetail.titleA": "关于详情 · 标题 A",
    "aboutDetail.titleB": "关于详情 · 标题 B",
    "aboutDetail.lead": "关于详情 · 导语",
    "aboutDetail.toc": "关于详情 · 目录",
    "aboutDetail.storyEyebrow": "关于详情 · 故事眉标",
    "aboutDetail.storyTitle": "关于详情 · 故事标题",
    "aboutDetail.storyTitleIt": "关于详情 · 故事标题斜体",
    "aboutDetail.storyP1": "关于详情 · 故事段落 1",
    "aboutDetail.storyP2": "关于详情 · 故事段落 2",
    "aboutDetail.storyP3": "关于详情 · 故事段落 3",
    "aboutDetail.quote": "关于详情 · 引言",
    "aboutDetail.quoteBy": "关于详情 · 引言出处",
    "aboutDetail.journeyEyebrow": "关于详情 · 历程眉标",
    "aboutDetail.journeyTitle": "关于详情 · 历程标题",
    "aboutDetail.journeyTitleIt": "关于详情 · 历程标题斜体",
    "aboutDetail.chainEyebrow": "关于详情 · 链路眉标",
    "aboutDetail.chainTitle": "关于详情 · 链路标题",
    "aboutDetail.chainTitleIt": "关于详情 · 链路标题斜体",
    "aboutDetail.valuesEyebrow": "关于详情 · 价值观眉标",
    "aboutDetail.originsEyebrow": "关于详情 · 产地眉标",
    "aboutDetail.whEyebrow": "关于详情 · 仓库眉标",
    "aboutDetail.whTitle": "关于详情 · 仓库标题",
    "aboutDetail.whTitleIt": "关于详情 · 仓库标题斜体",
    "aboutDetail.whBullets": "关于详情 · 仓库要点",
    "aboutDetail.ctaTitle": "关于详情 · 行动号召标题",
    "aboutDetail.ctaDesc": "关于详情 · 行动号召描述",
    "aboutDetail.ctaBtn": "关于详情 · 行动号召按钮",
    "productsPage.eyebrow": "产品页面 · 眉标",
    "productsPage.title": "产品页面 · 标题",
    "productsPage.desc": "产品页面 · 描述",
    "productsPage.all": "产品页面 · 全部",
    "productsPage.choco": "产品页面 · 巧克力",
    "productsPage.matcha": "产品页面 · 抹茶",
    "articlesPage.eyebrow": "文章页面 · 眉标",
    "articlesPage.title": "文章页面 · 标题",
    "articlesPage.desc": "文章页面 · 描述",
    "articlesPage.readMore": "文章页面 · 阅读更多",
    "articlesPage.empty": "文章页面 · 空状态",
    "articleDetail.back": "文章详情 · 返回",
    "articleDetail.notFound": "文章详情 · 未找到",
    "eduPage.eyebrow": "教育页面 · 眉标",
    "eduPage.title": "教育页面 · 标题",
    "eduPage.desc": "教育页面 · 描述",
    "eduPage.level": "教育页面 · 等级",
    "eduPage.duration": "教育页面 · 时长",
    "eduPage.join": "教育页面 · 加入",
    "innovPage.eyebrow": "创新页面 · 眉标",
    "innovPage.title": "创新页面 · 标题",
    "innovPage.desc": "创新页面 · 描述",
    "contactPage.eyebrow": "联系页面 · 眉标",
    "contactPage.title": "联系页面 · 标题",
    "contactPage.desc": "联系页面 · 描述",
    "contactPage.infoTitle": "联系页面 · 信息标题",
    "contactPage.formTitle": "联系页面 · 表单标题",
    "contactPage.addr": "联系页面 · 地址",
    "contactPage.email": "联系页面 · 邮箱",
    "contactPage.phone": "联系页面 · 电话",
    "contactPage.hours": "联系页面 · 营业时间",
    "contactPage.hoursVal": "联系页面 · 营业时间值",
    "careersPage.eyebrow": "招聘页面 · 眉标",
    "careersPage.title": "招聘页面 · 标题",
    "careersPage.desc": "招聘页面 · 描述",
    "careersPage.dept": "招聘页面 · 部门",
    "careersPage.loc": "招聘页面 · 地点",
    "careersPage.type": "招聘页面 · 类型",
    "careersPage.apply": "招聘页面 · 申请",
    "careersPage.empty": "招聘页面 · 空状态"
  }
} as const;

function getByPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export default function ContentPage() {
  const router = useRouter();
  const { t, locale } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [editLocale, setEditLocale] = useState<Locale>(locale);
  const [group, setGroup] = useState<GroupKey>("home");
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  useEffect(() => { setDraft(loadRaw() as Record<string, unknown>); }, []);
  useEffect(() => { setEditLocale(locale); }, [locale]);

  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];

  // show base values for the language being edited, not the UI language
  const baseForEdit = useMemo(() => dict[editLocale] as unknown as Record<string, unknown>, [editLocale]);
  const localeData = (draft[editLocale] ?? {}) as Record<string, unknown>;

  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  const paths = GROUP_PATHS[group];
  const filteredPaths = paths.filter((p) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    const k = p.join(".");
    const label = FIELD_LABELS[locale]?.[k] ?? FIELD_LABELS.en[k] ?? "";
    return k.toLowerCase().includes(needle) || label.toLowerCase().includes(needle) || String(getByPath(baseForEdit, p) ?? "").toLowerCase().includes(needle);
  });

  const setValue = (path: string[], value: unknown) => {
    setDraft((prev) => {
      const curLocaleData = (prev[editLocale] ?? {}) as Record<string, unknown>;
      const nextLocale = deepSet(curLocaleData, path, value);
      return { ...prev, [editLocale]: nextLocale };
    });
  };

  const save = () => { saveRaw(draft); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (!confirm(a.contentResetConfirm)) return; clearOverrides(); setDraft({}); };

  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[8] ?? "Content"}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[22px] font-light leading-none text-[#2D4A22] sm:text-[26px]">{a.contentTitle}</h1>
          <p className="mt-2 max-w-[60ch] text-[12px] leading-5 text-[#1a1a16]/60">{a.contentDesc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[#2D4A22]/10 bg-white p-1">
            {(locales as readonly Locale[]).map((l) => (
              <button key={l} onClick={() => setEditLocale(l)} className={`rounded-full px-3 py-1.5 text-[11px] tracking-[0.12em] ${editLocale === l ? "bg-[#2D4A22] text-white" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={reset} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-white">{a.contentReset}</button>
          <button onClick={save} className="rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">{a.save}</button>
        </div>
      </div>

      {saved && <div className="mt-3 rounded-xl bg-[#2D4A22] px-4 py-2 text-[12px] text-white">{a.contentSaved}</div>}

      <Card className="mt-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {GROUP_ORDER.map((k) => (
              <button key={k} onClick={() => setGroup(k)} className={`rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.08em] border ${group === k ? "bg-[#2D4A22] text-white border-[#2D4A22]" : "bg-white text-[#2D4A22] border-[#2D4A22]/15 hover:bg-white"}`}>{a.contentGroups[k]}</button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={a.contentSearchPlaceholder} className="w-full sm:w-64 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[12px] outline-none placeholder:text-[#8B6F47]/60 focus:border-[#2D4A22]/30" />
        </div>

        <div className="mt-4 grid gap-3">
          {filteredPaths.length === 0 && <p className="py-8 text-center text-[12px] text-[#8B6F47]">{a.contentNoMatch}</p>}
          {filteredPaths.map((path) => {
            const key = path.join(".");
            const baseVal = getByPath(baseForEdit, path);
            const overrideVal = getByPath(localeData, path);
            const isOverridden = overrideVal !== undefined;
            const val = isOverridden ? overrideVal : baseVal;
            const isArray = Array.isArray(val) || Array.isArray(baseVal);
            const isLong = typeof val === "string" && val.length > 80;

            return (
              <div key={key} className={`rounded-2xl border p-3 sm:p-4 ${isOverridden ? "border-[#2D4A22]/20 bg-[#F5F0E8]" : "border-[#2D4A22]/10 bg-white"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[12px] font-medium text-[#2D4A22]">{FIELD_LABELS[locale]?.[key] ?? FIELD_LABELS.en[key] ?? key}</span>
                    <span className="ml-2 font-mono text-[10px] tracking-[0.04em] text-[#8B6F47]/60 break-all">({key})</span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] tracking-[0.08em] ${isOverridden ? "bg-[#2D4A22] text-white" : "bg-[#2D4A22]/10 text-[#8B6F47]"}`}>{isOverridden ? a.contentOverridden : a.contentDefault}</span>
                </div>
                {isArray ? (
                  <textarea value={JSON.stringify(val ?? [], null, 0)} onChange={(e) => { try { const parsed = JSON.parse(e.target.value); setValue(path, parsed); } catch { setValue(path, e.target.value); } }} rows={2} className="mt-2 w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3 py-2 font-mono text-[11px] outline-none focus:border-[#2D4A22]/30" placeholder={a.contentJsonPlaceholder} />
                ) : isLong ? (
                  <textarea value={String(val ?? "")} onChange={(e) => setValue(path, e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3 py-2 text-[12px] leading-5 outline-none focus:border-[#2D4A22]/30" />
                ) : (
                  <input value={String(val ?? "")} onChange={(e) => setValue(path, e.target.value)} className="mt-2 w-full rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[12px] outline-none focus:border-[#2D4A22]/30" />
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-[#8B6F47] line-clamp-1">{a.contentDefaultLabel}: {typeof baseVal === "string" ? baseVal.slice(0, 90) : Array.isArray(baseVal) ? `[${baseVal.length} items]` : String(baseVal ?? "")}</span>
                  {isOverridden && <button onClick={() => { setDraft((prev) => { const cur = { ...(prev[editLocale] as Record<string, unknown> ?? {}) }; const del = (obj: Record<string, unknown>, p: string[]): Record<string, unknown> => { if (p.length === 0) return obj; const c = { ...obj }; let cur2: Record<string, unknown> = c; for (let i = 0; i < p.length - 1; i++) { const k = p[i]; const nxt = cur2[k] as Record<string, unknown>; if (!nxt || typeof nxt !== "object") return c; const copy = { ...nxt }; cur2[k] = copy; cur2 = copy; } delete cur2[p[p.length - 1]]; return c; }; return { ...prev, [editLocale]: del(cur as Record<string, unknown>, path) }; }); }} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1 text-[#2D4A22] hover:bg-white">{a.contentClearOverride}</button>}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[#8B6F47]">{a.contentHint}</p>
      </Card>
    </AdminShell>
  );
}

"use client";
import { useLang } from "../i18n";

type Contact = { name: string; role: string; phone: string; email: string; avatar: string };

const CONTACTS: Contact[] = [
  { name: "Andi Wijaya", role: "Sales — HORECA", phone: "+62 812-3456-7890", email: "sales@naturafoods.id", avatar: "AW" },
  { name: "Sinta Putri", role: "Marketing & Samples", phone: "+62 812-3456-7891", email: "marketing@naturafoods.id", avatar: "SP" },
];

const copy: Record<string, { title: string; desc: string; chat: string; email: string; foot: string }> = {
  en: { title: "Need help choosing?", desc: "Talk to our Sales & Marketing team — price list, samples and menu advice. Response within 24h.", chat: "Chat on WhatsApp", email: "Email", foot: "Mon–Sat 09:00–18:00 WIB · Jakarta" },
  id: { title: "Butuh bantuan memilih?", desc: "Hubungi tim Sales & Marketing kami — daftar harga, sampel dan saran menu. Respon dalam 24 jam.", chat: "Chat WhatsApp", email: "Email", foot: "Senin–Sabtu 09:00–18:00 WIB · Jakarta" },
  zh: { title: "需要选品帮助？", desc: "联系我们的销售与市场团队 — 报价单、样品与菜单建议，24小时内回复。", chat: "WhatsApp 咨询", email: "邮件", foot: "周一至周六 09:00–18:00 WIB · 雅加达" },
};

export default function SalesContactCard({ productTitle }: { productTitle?: string }) {
  const { locale } = useLang();
  const t = copy[locale] ?? copy.en;
  return (
    <div className="mt-10 sm:mt-12 rounded-[20px] sm:rounded-[24px] border border-[#2D4A22]/10 bg-white p-5 sm:p-6 md:p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">SALES & MARKETING</p>
          <h3 className="mt-1 font-[var(--font-display)] text-[20px] sm:text-[22px] font-light leading-none text-[#2D4A22]">{t.title}</h3>
          <p className="mt-2 max-w-[55ch] text-[12px] sm:text-[13px] leading-5 text-[#1a1a16]/60">{t.desc}</p>
        </div>
        <p className="text-[11px] tracking-[0.08em] text-[#8B6F47] sm:text-right">{t.foot}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {CONTACTS.map((c) => {
          const digits = c.phone.replace(/[^0-9]/g, "");
          const msg = productTitle
            ? `Hi NaturaFoods, I'm interested in ${productTitle}. Could you share price & samples?`
            : `Hi NaturaFoods, I'd like a price list & samples for choco/matcha.`;
          const wa = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
          return (
            <div key={c.name} className="flex gap-4 rounded-2xl border border-[#2D4A22]/10 bg-[#FFFCF2] p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2D4A22] text-[12px] font-medium tracking-[0.08em] text-white">{c.avatar}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#2D4A22]">{c.name}</p>
                <p className="text-[11px] tracking-[0.06em] text-[#8B6F47]">{c.role}</p>
                <a href={`tel:${digits}`} className="mt-2 block text-[12px] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">{c.phone}</a>
                <a href={`mailto:${c.email}`} className="block truncate text-[12px] text-[#2D4A22]/70 underline decoration-[#2D4A22]/15 underline-offset-4">{c.email}</a>
                <div className="mt-3 flex gap-2">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center rounded-full bg-[#2D4A22] px-4 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">{t.chat}</a>
                  <a href={`mailto:${c.email}?subject=${encodeURIComponent(productTitle ? `Inquiry: ${productTitle}` : `Price list request`)}`} className="inline-flex items-center justify-center rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#FFFCF2]">{t.email}</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

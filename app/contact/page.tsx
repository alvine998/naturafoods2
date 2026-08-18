"use client";
import { useState } from "react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";

export default function ContactPage() {
  const { t } = useLang();
  const p = t.contactPage;
  const [ok, setOk] = useState(false);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <div className="rounded-[20px] sm:rounded-[24px] bg-[#2D4A22] p-5 sm:p-6 md:p-8 text-white">
          <h3 className="text-[11px] tracking-[0.2em] text-white/60">{p.infoTitle.toUpperCase()}</h3>
          <div className="mt-4 grid gap-3 text-[13px] leading-6 text-white/80">
            <div className="break-words">{p.addr}</div>
            <a href={`mailto:${p.email}`} className="underline decoration-white/30 underline-offset-4 break-all">{p.email}</a>
            <a href={`https://wa.me/${p.phone.replace(/[^0-9]/g, "")}`} className="underline decoration-white/30 underline-offset-4">WhatsApp {p.phone}</a>
            <div className="pt-4 border-t border-white/15"><div className="text-white/60 text-[11px] tracking-[0.14em]">{p.hours}</div><div className="text-white">{p.hoursVal}</div></div>
          </div>
          <div className="mt-6 sm:mt-8 rounded-2xl bg-white/10 p-4 text-[12px] leading-6 text-white/70">Maps placeholder — replace with embedded Google Maps iframe when ready.</div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const entry = { id: Date.now().toString(), name: String(fd.get("name") ?? ""), city: String(fd.get("city") ?? ""), whatsapp: String(fd.get("whatsapp") ?? ""), interest: String(fd.get("interest") ?? ""), date: new Date().toISOString() }; try { const cur = JSON.parse(localStorage.getItem("nf_inquiries") ?? "[]"); cur.push(entry); localStorage.setItem("nf_inquiries", JSON.stringify(cur)); } catch {} setOk(true); (e.target as HTMLFormElement).reset(); setTimeout(() => setOk(false), 3000); }} className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10 p-5 sm:p-6 md:p-7">
          <h3 className="font-medium text-[#2D4A22]">{p.formTitle}</h3>
          <div className="mt-4 grid gap-4">
            <input name="name" required placeholder={t.formOutlet} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none focus:border-[#2D4A22]/40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="city" placeholder={t.formCity} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none focus:border-[#2D4A22]/40" />
              <select name="interest" defaultValue="" className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] text-[#1a1a16]/70 focus:outline-none focus:border-[#2D4A22]/40"><option value="" disabled>{t.formInterest}</option>{t.formInterests.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <input name="whatsapp" required placeholder={t.formWhatsapp} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none focus:border-[#2D4A22]/40" />
            <input name="email" type="email" placeholder={t.formEmail} className="rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none focus:border-[#2D4A22]/40" />
            <textarea name="message" rows={3} placeholder="Message" className="rounded-2xl border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-3 text-[13px] placeholder:text-[#1a1a16]/40 focus:outline-none focus:border-[#2D4A22]/40" />
            <button className="rounded-full bg-[#2D4A22] py-3.5 text-[11px] tracking-[0.16em] text-white hover:bg-[#1e3317]">{t.formSubmit}</button>
            {ok && <p className="text-center text-[12px] text-[#2D4A22]">{t.formThanks} — {t.formThanksSuffix}</p>}
            <p className="text-center text-[11px] text-[#8B6F47]">{t.formFoot}</p>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

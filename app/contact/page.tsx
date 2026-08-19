"use client";
import { useState } from "react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <div className="mt-6 sm:mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <iframe
              title="PT Natura Inti Sukses — Location"
              src="https://maps.google.com/maps?q=Jakarta%20Indonesia&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-[260px] w-full border-0 sm:h-[300px]"
            />
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=Jakarta+Indonesia" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[11px] tracking-[0.12em] text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white">Open in Google Maps →</a>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const entry = { id: Date.now().toString(), name: String(fd.get("name") ?? ""), city: String(fd.get("city") ?? ""), whatsapp: String(fd.get("whatsapp") ?? ""), interest: String(fd.get("interest") ?? ""), date: new Date().toISOString() }; try { const cur = JSON.parse(localStorage.getItem("nf_inquiries") ?? "[]"); cur.push(entry); localStorage.setItem("nf_inquiries", JSON.stringify(cur)); } catch {} setOk(true); (e.target as HTMLFormElement).reset(); setTimeout(() => setOk(false), 3000); }} className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10 p-5 sm:p-6 md:p-7">
          <h3 className="font-medium text-[#2D4A22]">{p.formTitle}</h3>
          <div className="mt-4 grid gap-4">
            <Input name="name" required placeholder={t.formOutlet} className="rounded-full bg-[#FFFCF2] h-auto py-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="city" placeholder={t.formCity} className="rounded-full bg-[#FFFCF2] h-auto py-3" />
              <Select name="interest" defaultValue="">
                <SelectTrigger><SelectValue placeholder={t.formInterest} /></SelectTrigger>
                <SelectContent>{t.formInterests.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input name="whatsapp" required placeholder={t.formWhatsapp} className="rounded-full bg-[#FFFCF2] h-auto py-3" />
            <Input name="email" type="email" placeholder={t.formEmail} className="rounded-full bg-[#FFFCF2] h-auto py-3" />
            <Textarea name="message" rows={3} placeholder="Message" className="rounded-2xl bg-[#FFFCF2]" />
            <button className="rounded-full bg-[#2D4A22] py-3.5 text-[11px] tracking-[0.16em] text-white hover:bg-[#1e3317]">{t.formSubmit}</button>
            {ok && <p className="text-center text-[12px] text-[#2D4A22]">{t.formThanks} — {t.formThanksSuffix}</p>}
            <p className="text-center text-[11px] text-[#8B6F47]">{t.formFoot}</p>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

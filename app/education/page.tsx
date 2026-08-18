"use client";
import { useEffect, useState } from "react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { SEED_EDU } from "../lib/data";
import type { Edu } from "../lib/data";

export default function EducationPage() {
  const { t } = useLang();
  const p = t.eduPage;
  const [items, setItems] = useState<Edu[]>(SEED_EDU);
  useEffect(() => { try { const v = localStorage.getItem("nf_edu"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Education" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-[20px] border border-[#2D4A22]/10 bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-[#F5EFE0]"><img src={e.img} alt={e.title} loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="p-4 sm:p-5">
              <h3 className="font-medium text-[#2D4A22] text-[14px] sm:text-[15px] break-words">{e.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{e.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] tracking-[0.12em]"><span className="rounded-full bg-[#FFFCF2] border border-[#2D4A22]/10 px-3 py-1 text-[#2D4A22]">{p.level}: {e.level}</span><span className="rounded-full bg-[#2D4A22] px-3 py-1 text-white">{e.duration}</span></div>
              <a href="/contact" className="mt-4 inline-flex rounded-full border border-[#2D4A22]/15 px-5 py-2 text-[11px] tracking-[0.14em] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white transition">{p.join}</a>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="py-12 text-center text-[#8B6F47]">{t.admin.noData}</p>}
    </PageShell>
  );
}

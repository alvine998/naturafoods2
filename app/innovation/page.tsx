"use client";
import { useEffect, useState } from "react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { SEED_INNOVATION } from "../lib/data";
import type { Innovation } from "../lib/data";

export default function InnovationPage() {
  const { t } = useLang();
  const p = t.innovPage;
  const [items, setItems] = useState<Innovation[]>(SEED_INNOVATION);
  useEffect(() => { try { const v = localStorage.getItem("nf_innovation"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Innovation" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.id} className="overflow-hidden rounded-[20px] border border-[#2D4A22]/10 bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-[#E8F0E2]"><img src={it.img} alt={it.title} loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="p-4 sm:p-5">
              <span className="rounded-full bg-[#FFFCF2] border border-[#2D4A22]/10 px-3 py-1 text-[10px] tracking-[0.14em] text-[#8B6F47]">{it.tag}</span>
              <h3 className="mt-3 font-medium text-[#2D4A22] text-[14px] sm:text-[15px] break-words">{it.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="py-12 text-center text-[#8B6F47]">{t.admin.noData}</p>}
    </PageShell>
  );
}

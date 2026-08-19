"use client";
import { Label } from "@/components/ui/label";
import { Input as UiInput } from "@/components/ui/input";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { Card as UiCard } from "@/components/ui/card";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label>{label}</Label><span className="normal-case tracking-normal">{children}</span></div>;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <UiInput {...props} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <UiTextarea {...props} />;
}
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <UiCard className={className}>{children}</UiCard>;
}
export function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl border border-dashed border-[#2D4A22]/15 bg-white/60 p-8 text-center text-[13px] text-[#8B6F47]">{msg}</div>;
}
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <Card className="overflow-hidden"><div className="overflow-x-auto">{children}</div></Card>;
}
export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (n: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <span className="text-[11px] text-[#8B6F47]">Page {page} / {totalPages}</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1 text-[11px] disabled:opacity-40">Prev</button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} onClick={() => onPage(i + 1)} className={`h-7 w-7 rounded-full text-[11px] ${page === i + 1 ? "bg-[#2D4A22] text-white" : "border border-[#2D4A22]/15 bg-white text-[#2D4A22]"}`}>{i + 1}</button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1 text-[11px] disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
export function Toolbar({ q, setQ, total, filtered, onAdd, addLabel }: { q: string; setQ: (v: string) => void; total: number; filtered: number; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <UiInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full" />
        <span className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-[#2D4A22]/10 bg-white px-3 py-1.5 text-[11px] text-[#8B6F47]">{filtered}/{total}</span>
      </div>
      <button onClick={onAdd} className="shrink-0 rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">+ {addLabel}</button>
    </div>
  );
}
export const PAGE_SIZE = 8;
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-[#1a1a16]/30 backdrop-blur-sm" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2D4A22]/10 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-[#2D4A22]/15 px-3 py-1 text-[11px] text-[#2D4A22] hover:bg-[#FFFCF2]">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
export function FileUpload({ value, onChange, accept = "image/*" }: { value?: string; onChange: (v: string) => void; accept?: string }) {
  const isVideo = !!value && (value.startsWith("data:video") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value));
  const isImage = !!value && !isVideo;
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };
  return (
    <div className="grid gap-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-[#2D4A22]/15 bg-[#F5EFE0]">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={value} controls className="h-28 w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="h-28 w-full object-cover" />
          )}
        </div>
      ) : (
        <div className="grid place-items-center rounded-xl border border-dashed border-[#2D4A22]/15 bg-[#FFFCF2] px-4 py-6 text-center text-[11px] text-[#8B6F47]">No file selected</div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-full bg-[#2D4A22] px-4 py-1.5 text-[11px] tracking-[0.08em] text-white hover:bg-[#1e3317]">
          {value ? "Replace file" : "Upload file"}
          <input type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        {value && <button type="button" onClick={() => onChange("")} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] text-[#2D4A22] hover:bg-[#FFFCF2]">Remove</button>}
      </div>
    </div>
  );
}

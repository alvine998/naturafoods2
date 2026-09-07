"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input as UiInput } from "@/components/ui/input";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { Card as UiCard } from "@/components/ui/card";
import { uploadFile as apiUploadFile } from "../lib/api";

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
          <button onClick={onClose} className="rounded-full border border-[#2D4A22]/15 px-3 py-1 text-[11px] text-[#2D4A22] hover:bg-white">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileUpload — now API-aware per FRONTEND_API_GUIDE.md:10
// Uses POST /admin/uploads (R2 / local fallback) and falls back to dataURL for offline dev
// ---------------------------------------------------------------------------
export function FileUpload({ value, onChange, accept = "image/*", folder = "products" }: { value?: string; onChange: (v: string) => void; accept?: string; folder?: string }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isVideo = !!value && (value.startsWith("data:video") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value));
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    // Image 5MB, video 20MB limits per guide
    const isVid = file.type.startsWith("video/");
    const max = isVid ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > max) {
      setErr(isVid ? "Video too large (max 20MB)" : "Image too large (max 5MB)");
      return;
    }
    setUploading(true);
    try {
      const url = await apiUploadFile(file, folder);
      onChange(url);
    } catch (e) {
      // Fallback to base64 dataURL for offline dev / when API not reachable
      const msg = e instanceof Error ? e.message : "Upload failed";
      const isNetwork = msg.toLowerCase().includes("network") || (e as { status?: number })?.status === 0;
      if (isNetwork) {
        // fallback to dataURL so UX not blocked
        const reader = new FileReader();
        reader.onload = () => onChange(String(reader.result ?? ""));
        reader.readAsDataURL(file);
        setErr(null);
      } else {
        setErr(msg);
      }
    } finally {
      setUploading(false);
    }
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
        <div className="grid place-items-center rounded-xl border border-dashed border-[#2D4A22]/15 bg-white px-4 py-6 text-center text-[11px] text-[#8B6F47]">No file selected</div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <label className={`cursor-pointer rounded-full px-4 py-1.5 text-[11px] tracking-[0.08em] text-white ${uploading ? "bg-[#8B6F47] cursor-wait opacity-70" : "bg-[#2D4A22] hover:bg-[#1e3317]"}`}>
          {uploading ? "Uploading…" : value ? "Replace file" : "Upload file"}
          <input type="file" accept={accept} className="hidden" disabled={uploading} onChange={(e) => { handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        {value && <button type="button" onClick={() => onChange("")} disabled={uploading} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] text-[#2D4A22] hover:bg-white disabled:opacity-50">Remove</button>}
      </div>
      {err && <p className="text-[11px] text-red-600">{err}</p>}
    </div>
  );
}

// Keep legacy export name for compatibility
export { FileUpload as FileUploadLegacy };

export function MultiFileUpload({ value = [], onChange, accept = "image/*", folder = "partners", max = 10 }: { value?: string[]; onChange: (v: string[]) => void; accept?: string; folder?: string; max?: number }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const list = Array.isArray(value) ? value.filter(Boolean) : [];
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErr(null);
    const remaining = Math.max(0, max - list.length);
    const picked = Array.from(files).slice(0, remaining || files.length);
    if (picked.length === 0) { setErr(`Max ${max} images`); return; }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of picked) {
        const isVid = file.type.startsWith("video/");
        const limit = isVid ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > limit) { setErr(`"${file.name}" too large (max ${isVid ? "20MB" : "5MB"})`); continue; }
        try {
          const url = await apiUploadFile(file, folder);
          uploaded.push(url);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          const isNetwork = msg.toLowerCase().includes("network") || (e as { status?: number })?.status === 0;
          if (isNetwork) {
            const dataUrl: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(new Error("read failed"));
              reader.readAsDataURL(file);
            });
            if (dataUrl) uploaded.push(dataUrl);
          } else {
            setErr(msg);
          }
        }
      }
      if (uploaded.length) onChange([...list, ...uploaded].slice(0, max));
    } finally {
      setUploading(false);
    }
  };
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...list];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const removeAt = (idx: number) => onChange(list.filter((_, i) => i !== idx));
  return (
    <div className="grid gap-2">
      {list.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-[#2D4A22]/15 bg-white px-4 py-6 text-center text-[11px] text-[#8B6F47]">No images yet — upload up to {max}</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {list.map((src, i) => (
            <div key={src + i} className="group relative overflow-hidden rounded-xl border border-[#2D4A22]/15 bg-[#F5EFE0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`image ${i + 1}`} className="h-20 w-full object-cover" />
              <span className={`absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${i === 0 ? "bg-[#2D4A22] text-white" : "bg-white/90 text-[#2D4A22]"}`}>{i === 0 ? "★ Main" : `#${i + 1}`}</span>
              <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex-1 rounded-md bg-white/95 px-1 py-0.5 text-[10px] disabled:opacity-40">◀</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="flex-1 rounded-md bg-white/95 px-1 py-0.5 text-[10px] disabled:opacity-40">▶</button>
                <button type="button" onClick={() => removeAt(i)} className="flex-1 rounded-md bg-red-600/90 px-1 py-0.5 text-[10px] text-white">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <label className={`cursor-pointer rounded-full px-4 py-1.5 text-[11px] tracking-[0.08em] text-white ${uploading ? "bg-[#8B6F47] cursor-wait opacity-70" : "bg-[#2D4A22] hover:bg-[#1e3317]"}`}>
          {uploading ? "Uploading…" : list.length ? `Add more (${list.length}/${max})` : "Upload images"}
          <input type="file" accept={accept} multiple className="hidden" disabled={uploading || list.length >= max} onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ""; }} />
        </label>
        {list.length > 0 && <button type="button" onClick={() => onChange([])} disabled={uploading} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] text-[#2D4A22] hover:bg-white disabled:opacity-50">Clear all</button>}
        <span className="text-[10px] text-[#8B6F47]">first image = main · hover to reorder / remove</span>
      </div>
      {err && <p className="text-[11px] text-red-600">{err}</p>}
    </div>
  );
}

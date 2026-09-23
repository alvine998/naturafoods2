"use client";
import { useEffect, useState } from "react";
import Image from "../components/SafeImage";
import { Label } from "@/components/ui/label";
import { Input as UiInput } from "@/components/ui/input";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { Card as UiCard } from "@/components/ui/card";
import { apiFetch, uploadFile as apiUploadFile } from "../lib/api";

export function confirmAdminDelete(label = "this item"): boolean {
  return typeof window === "undefined" || window.confirm(`Are you sure you want to delete ${label}? This action cannot be undone.`);
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label>{label}</Label><span className="normal-case tracking-normal">{children}</span></div>;
}

/** Parse form/API sortIndex into a finite integer (default 0). */
export function toSortIndex(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Math.trunc(Number(v));
  return 0;
}

/** Shared "sort index" number field — lower shows first on public lists. */
export function SortIndexField({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <Field label="sort index (lower shows first)">
      <Input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(toSortIndex(e.target.value))}
        min={0}
        step={1}
        placeholder="0"
      />
    </Field>
  );
}

/** Display order: lower sortIndex first (stable for equal values). */
export function sortBySortIndex<T extends { sortIndex?: number }>(list: T[]): T[] {
  return list
    .map((item, i) => ({ item, i }))
    .sort((a, b) => {
      const sa = a.item.sortIndex ?? 0;
      const sb = b.item.sortIndex ?? 0;
      if (sa !== sb) return sa - sb;
      return a.i - b.i;
    })
    .map((x) => x.item);
}

/** Move row from → to and renumber sortIndex 0..n-1. */
export function renumberByMove<T extends { sortIndex?: number }>(list: T[], from: number, to: number): T[] {
  if (from < 0 || from >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  const target = Math.max(0, Math.min(to, next.length));
  next.splice(target, 0, item);
  return next.map((x, i) => ({ ...x, sortIndex: i }));
}

/** Persist a single row's sortIndex. Offline failures keep the local optimistic value. */
export async function patchSortIndex(path: string, sortIndex: number): Promise<void> {
  try {
    await apiFetch(path, { method: "PUT", body: JSON.stringify({ sortIndex, index: sortIndex }) });
  } catch {
    // network/offline — local store already updated
  }
}

/** Persist every row whose sortIndex differs from the previous list. */
export async function persistSortIndexDiff<T extends { sortIndex?: number }>(
  prev: T[],
  next: T[],
  pathFor: (item: T) => string,
): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const item of next) {
    const before = prev.find((x) => pathFor(x) === pathFor(item));
    const after = item.sortIndex ?? 0;
    if (before && (before.sortIndex ?? 0) === after) continue;
    jobs.push(patchSortIndex(pathFor(item), after));
  }
  if (jobs.length) await Promise.all(jobs);
}

/** Inline table cell: editable number + optional ▲/▼. Drag is on the row. */
export function SortIndexCell({
  value,
  onCommit,
  onMove,
  disabled = false,
  title,
}: {
  value?: number;
  onCommit: (v: number) => void;
  onMove?: (dir: -1 | 1) => void;
  disabled?: boolean;
  title?: string;
}) {
  const [draft, setDraft] = useState(String(value ?? 0));
  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);
  const commit = () => {
    const v = toSortIndex(draft);
    setDraft(String(v));
    if (v !== (value ?? 0)) onCommit(v);
  };
  return (
    <div
      className="flex items-center gap-1"
      title={title ?? "Edit sort index, or drag the row · lower shows first"}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="number"
        value={draft}
        min={0}
        step={1}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="h-7 w-12 rounded-lg border border-[#2D4A22]/15 bg-white px-1.5 text-center text-[11px] font-medium text-[#2D4A22] outline-none focus:border-[#2D4A22]/40 disabled:opacity-50"
        aria-label="Sort index"
      />
      {onMove && (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onMove(-1)}
            className="rounded border bg-white px-1.5 text-[10px] leading-tight disabled:opacity-30"
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onMove(1)}
            className="rounded border bg-white px-1.5 text-[10px] leading-tight disabled:opacity-30"
            title="Move down"
          >
            ▼
          </button>
        </div>
      )}
      <span className="cursor-grab select-none text-[11px] text-[#8B6F47]/70" title="Drag row to reorder" aria-hidden>
        ⠿
      </span>
    </div>
  );
}

/** HTML5 row drag for admin tables (indices into the full sorted list). */
export function useDragSort({
  disabled,
  onReorder,
}: {
  disabled?: boolean;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const rowProps = (absIdx: number): React.HTMLAttributes<HTMLTableRowElement> => ({
    draggable: !disabled,
    onDragStart: (e: React.DragEvent) => {
      if (disabled) return;
      setDragFrom(absIdx);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(absIdx));
    },
    onDragOver: (e: React.DragEvent) => {
      if (disabled || dragFrom === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overIdx !== absIdx) setOverIdx(absIdx);
    },
    onDrop: (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      const raw = e.dataTransfer.getData("text/plain");
      const from = dragFrom ?? (raw ? Number(raw) : NaN);
      setDragFrom(null);
      setOverIdx(null);
      if (Number.isFinite(from) && from !== absIdx) onReorder(from, absIdx);
    },
    onDragEnd: () => {
      setDragFrom(null);
      setOverIdx(null);
    },
  });

  const rowClass = (absIdx: number): string => {
    if (dragFrom === absIdx) return "opacity-40 bg-white/60";
    if (overIdx === absIdx && dragFrom !== null && dragFrom !== absIdx) return "bg-[#2D4A22]/10";
    return "hover:bg-white/60";
  };

  return { rowProps, rowClass, dragFrom, overIdx };
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
export function FileUpload({ value, onChange, accept = "image/*", folder = "products", maxImageMB = 5, maxVideoMB = 20 }: { value?: string; onChange: (v: string) => void; accept?: string; folder?: string; maxImageMB?: number; maxVideoMB?: number }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const src = value?.trim() ? value.trim() : "";
  const isVideo = !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src));
  const isPdf = accept === ".pdf" || (src && /\.pdf(\?|$)/i.test(src));
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    // Size limits (MB) — configurable per caller, defaults per guide
    const isVid = file.type.startsWith("video/");
    const max = isVid ? maxVideoMB * 1024 * 1024 : maxImageMB * 1024 * 1024;
    if (file.size > max) {
      setErr(isVid ? `Video too large (max ${maxVideoMB}MB)` : `Image too large (max ${maxImageMB}MB)`);
      return;
    }
    setUploading(true);
    try {
      const url = await apiUploadFile(file, folder);
      onChange(url);
    } catch (e) {
      // Fallback to base64 dataURL when the API can't be used:
      // - network unreachable (backend down / offline dev)
      // - no session (legacy offline login has no access token)
      // Real server rejections (413 too large, 400, 403…) are shown as errors instead.
      const msg = e instanceof Error ? e.message : "Upload failed";
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const offline = !status || status === 0 || code === "NETWORK_ERROR" || code === "UNAUTHORIZED";
      if (offline) {
        const reader = new FileReader();
        reader.onload = () => onChange(String(reader.result ?? ""));
        reader.readAsDataURL(file);
        setErr(null);
        setNotice(
          file.size > 2 * 1024 * 1024
            ? "API offline — kept as local preview. File is large and may not persist after reload."
            : "API offline — kept as local preview only, not synced to server."
        );
      } else {
        setNotice(null);
        setErr(`Upload failed (${status}${code ? ` ${code}` : ""}): ${msg}`);
      }
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="grid gap-2">
      {src ? (
        <div className="relative overflow-hidden rounded-xl border border-[#2D4A22]/15 bg-[#F5EFE0]">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={src} controls className="h-28 w-full object-cover" />
          ) : isPdf ? (
            <div className="flex h-28 w-full items-center justify-center gap-2 text-[12px] text-[#2D4A22]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
              <span className="font-medium">PDF uploaded</span>
            </div>
           ) : (
             <Image src={src} alt="preview" className="h-28 w-full object-cover" width={300} height={112} />
           )}
        </div>
      ) : (
        <div className="grid place-items-center rounded-xl border border-dashed border-[#2D4A22]/15 bg-white px-4 py-6 text-center text-[11px] text-[#8B6F47]">No file selected</div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <label className={`cursor-pointer rounded-full px-4 py-1.5 text-[11px] tracking-[0.08em] text-white ${uploading ? "bg-[#8B6F47] cursor-wait opacity-70" : "bg-[#2D4A22] hover:bg-[#1e3317]"}`}>
          {uploading ? "Uploading…" : src ? "Replace file" : "Upload file"}
          <input type="file" accept={accept} className="hidden" disabled={uploading} onChange={(e) => { handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        {src && <button type="button" onClick={() => { if (confirmAdminDelete("this uploaded file")) onChange(""); }} disabled={uploading} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] text-[#2D4A22] hover:bg-white disabled:opacity-50">Remove</button>}
      </div>
      {err && <p className="text-[11px] text-red-600">{err}</p>}
      {notice && <p className="text-[11px] text-[#8B6F47]">{notice}</p>}
    </div>
  );
}

// Keep legacy export name for compatibility
export { FileUpload as FileUploadLegacy };

export function MultiFileUpload({ value = [], onChange, accept = "image/*", folder = "partners", max = 10 }: { value?: string[]; onChange: (v: string[]) => void; accept?: string; folder?: string; max?: number }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const list = Array.isArray(value) ? value.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean) : [];
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
          const status = (e as { status?: number })?.status;
          const code = (e as { code?: string })?.code;
          const offline = !status || status === 0 || code === "NETWORK_ERROR" || code === "UNAUTHORIZED";
          if (offline) {
            const dataUrl: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(new Error("read failed"));
              reader.readAsDataURL(file);
            });
            if (dataUrl) uploaded.push(dataUrl);
          } else {
            setErr(`"${file.name}" failed (${status}${code ? ` ${code}` : ""}): ${msg}`);
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
  const removeAt = (idx: number) => {
    if (!confirmAdminDelete("this image")) return;
    onChange(list.filter((_, i) => i !== idx));
  };
  return (
    <div className="grid gap-2">
      {list.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-[#2D4A22]/15 bg-white px-4 py-6 text-center text-[11px] text-[#8B6F47]">No images yet — upload up to {max}</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
           {list.map((src, i) => (
             <div key={src + i} className="group relative overflow-hidden rounded-xl border border-[#2D4A22]/15 bg-[#F5EFE0]">
               <Image src={src} alt={`image ${i + 1}`} className="h-20 w-full object-cover" width={100} height={80} />
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

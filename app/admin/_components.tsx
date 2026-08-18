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

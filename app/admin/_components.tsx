"use client";
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[10px] tracking-[0.14em] text-[#8B6F47] uppercase">{label}<span className="normal-case tracking-normal">{children}</span></label>;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3.5 py-2.5 text-[13px] text-[#1a1a16] placeholder:text-[#1a1a16]/35 focus:outline-none focus:border-[#2D4A22]/35 focus:ring-2 focus:ring-[#2D4A22]/10" />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3.5 py-2.5 text-[13px] text-[#1a1a16] placeholder:text-[#1a1a16]/35 focus:outline-none focus:border-[#2D4A22]/35 focus:ring-2 focus:ring-[#2D4A22]/10" />;
}
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-[#2D4A22]/10 shadow-[0_2px_12px_rgba(26,26,22,0.04)] ${className}`}>{children}</div>;
}

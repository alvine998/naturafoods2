import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3.5 py-2.5 text-[13px] text-[#1a1a16] placeholder:text-[#1a1a16]/35 focus-visible:outline-none focus-visible:border-[#2D4A22]/35 focus-visible:ring-2 focus-visible:ring-[#2D4A22]/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

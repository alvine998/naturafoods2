import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3.5 py-2.5 text-[13px] text-[#1a1a16] placeholder:text-[#1a1a16]/35 focus-visible:outline-none focus-visible:border-[#2D4A22]/35 focus-visible:ring-2 focus-visible:ring-[#2D4A22]/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLang } from "../../i18n";
import { DEMO_CRED_HINT, login } from "../../lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const { t } = useLang();
  const a = t.admin;
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white flex">
      {/* left — brand */}
      <div className="hidden lg:flex w-[46%] shrink-0 flex-col justify-between bg-[#2D4A22] p-10 text-white">
        <Link href="/" className="flex items-center gap-3 text-white/80 hover:text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NaturaFoods" className="h-8 w-auto brightness-0 invert" />
          <span className="text-[10px] tracking-[0.2em]">CHOCO & MATCHA</span>
        </Link>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-white/60">ADMIN · CMS</p>
          <h2 className="mt-3 font-[var(--font-display)] text-[40px] font-light leading-[0.95]">Manage<br />your catalog.</h2>
          <p className="mt-4 max-w-[36ch] text-[13px] leading-6 text-white/70">Products, articles, education, innovation, careers & inquiries — all in one place. Secure API session.</p>
        </div>
        <p className="text-[11px] tracking-[0.12em] text-white/40">EST. 2019 — JAKARTA · SURABAYA · BALI</p>
      </div>

      {/* right — form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10 bg-white">
        <form onSubmit={async (e) => { e.preventDefault(); setErr(""); setLoading(true); const fd = new FormData(e.target as HTMLFormElement); const u = String(fd.get("user") ?? ""); const p = String(fd.get("pass") ?? ""); try { const ok = await login(u, p); if (ok) router.push("/admin/dashboard"); else setErr(a.invalid); } catch (err: unknown) { setErr(err instanceof Error ? err.message : a.invalid); } finally { setLoading(false); } }} className="w-full max-w-[420px] rounded-[24px] bg-white border border-[#2D4A22]/10 p-6 sm:p-8 shadow-[0_16px_48px_rgba(26,26,22,0.08)]">
           <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-[#8B6F47] hover:text-[#2D4A22]"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
          <div className="mt-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-7 w-auto lg:hidden" />
            <span className="lg:hidden text-[10px] tracking-[0.2em] text-[#8B6F47]">ADMIN</span>
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-[26px] sm:text-[28px] font-light text-[#2D4A22]">{a.loginTitle}</h1>
          <p className="mt-2 rounded-xl bg-white border border-[#2D4A22]/10 px-3 py-2 text-[11px] leading-5 text-[#8B6F47]">{a.hint} · <span className="font-medium text-[#2D4A22]">{DEMO_CRED_HINT}</span></p>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-1.5"><Label htmlFor="login-user">USERNAME</Label><Input id="login-user" name="user" required placeholder={a.user} autoComplete="username" className="bg-white focus:bg-white" /></div>
            <div className="grid gap-1.5"><Label htmlFor="login-pass">PASSWORD</Label><Input id="login-pass" name="pass" required type="password" placeholder={a.pass} autoComplete="current-password" className="bg-white focus:bg-white" /></div>
            {err && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">{err}</p>}
            <button disabled={loading} className="rounded-full bg-[#2D4A22] py-3.5 text-[11px] tracking-[0.16em] text-white hover:bg-[#1e3317] shadow-[0_4px_16px_rgba(45,74,34,0.25)] disabled:opacity-60">{loading ? "Signing in…" : a.signIn}</button>
            <p className="text-center text-[11px] text-[#8B6F47]">API auth via <code className="rounded bg-[#F5EFE0] px-1 py-0.5">POST /auth/login</code> · fallback to local demo.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

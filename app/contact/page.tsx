"use client";
import { useState } from "react";
import { MessageCircle, Mail, MapPin, User, Send } from "lucide-react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../i18n";
import { API_BASE } from "../lib/api";

export default function ContactPage() {
  const { t } = useLang();
  const p = t.contactPage;
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col justify-center px-4 sm:px-6 md:px-8">
          <p className="text-[11px] sm:text-[12px] tracking-[0.25em] text-orange-400 font-medium">
            {p.eyebrow.toUpperCase()}
          </p>
          <h1 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-bold leading-[1.05] text-white">
            {p.title.toUpperCase()}
          </h1>
          <p className="mt-4 sm:mt-5 max-w-[500px] text-[14px] sm:text-[15px] leading-relaxed text-white/90">
            {p.heroDesc}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto max-w-[1480px] px-2 py-12 sm:px-2 sm:py-16 md:px-2 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* Left Column - Contact Info Cards + Map */}
          <div>
            {/* Contact Info Cards */}
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {/* WhatsApp Card */}
              <a
                href={`https://wa.me/${p.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#25D366]/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-[#2D4A22]">WhatsApp</h3>
                <p className="mt-1 text-[15px] font-medium text-gray-800">{p.phone}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                  {p.whatsappDesc}
                </p>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${p.email}`}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#EA4335]/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EA4335]/10 text-[#EA4335] group-hover:bg-[#EA4335] group-hover:text-white transition-colors">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-[#2D4A22]">Email</h3>
                <p className="mt-1 text-[14px] font-medium text-gray-800 break-all">{p.email}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                  {p.emailDesc}
                </p>
              </a>

              {/* Location Card */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#34A853]/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34A853]/10 text-[#34A853] group-hover:bg-[#34A853] group-hover:text-white transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-[#2D4A22]">{p.locationTitle}</h3>
                <p className="mt-1 text-[12px] font-medium text-gray-800">{p.locationName}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  {p.addr}
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <iframe
                title="PT Natura Inti Sukses — Location"
                src="https://maps.google.com/maps?q=-6.1751,106.8650&z=15&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-[300px] w-full border-0 sm:h-[350px]"
              />
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=-6.1751,106.8650"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[12px] text-[#2D4A22] underline decoration-[#2D4A22]/30 underline-offset-4 hover:text-[#1e3317] transition-colors"
            >
              {p.viewLargerMap} →
            </a>
          </div>

          {/* Right Column - Contact Form */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-lg">
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#2D4A22]">{p.formTitle}</h2>
            <div className="mt-1 h-[3px] w-[50px] rounded-full bg-[#E67E22]" />

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);
                setLoading(true);
                const fd = new FormData(e.target as HTMLFormElement);
                const payload = {
                  name: String(fd.get("name") ?? ""),
                  city: "-", // contact page has no city field — send placeholder; backend city optional
                  whatsapp: "-",
                  interest: String(fd.get("subject") ?? "General"),
                  email: String(fd.get("email") ?? ""),
                  message: String(fd.get("message") ?? ""),
                  source: "contact_page",
                };
                try {
                  const res = await fetch(`${API_BASE}/inquiries`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const json = await res.json().catch(() => null);
                  if (!res.ok) {
                    const msg = json?.error?.message || `Failed (${res.status})`;
                    throw new Error(msg);
                  }
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Failed";
                  const isNetwork = msg.toLowerCase().includes("network") || msg.includes("Failed to fetch");
                  if (isNetwork) {
                    // fallback to localStorage for offline dev
                    try {
                      const entry = { id: Date.now().toString(), name: payload.name, city: "-", whatsapp: "-", interest: payload.interest, email: payload.email, message: payload.message, date: new Date().toISOString() };
                      const cur = JSON.parse(localStorage.getItem("nf_inquiries") ?? "[]");
                      cur.push(entry);
                      localStorage.setItem("nf_inquiries", JSON.stringify(cur));
                    } catch {}
                  } else {
                    setErr(msg);
                    setLoading(false);
                    return;
                  }
                }
                setOk(true);
                (e.target as HTMLFormElement).reset();
                setTimeout(() => setOk(false), 4000);
                setLoading(false);
              }}
              className="mt-6 grid gap-5"
            >
              {/* Name & Email Row */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-gray-700">{p.nameLabel}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      name="name"
                      required
                      placeholder={p.namePlaceholder}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-[14px] text-gray-800 placeholder-gray-400 transition-colors focus:border-[#E67E22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-gray-700">{p.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder={p.emailPlaceholder}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-[14px] text-gray-800 placeholder-gray-400 transition-colors focus:border-[#E67E22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-gray-700">{p.subjectLabel}</label>
                <input
                  name="subject"
                  required
                  placeholder={p.subjectPlaceholder}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 transition-colors focus:border-[#E67E22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-gray-700">{p.messageLabel}</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder={p.messagePlaceholder}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 transition-colors focus:border-[#E67E22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#E67E22] py-3.5 text-[13px] font-semibold tracking-[0.05em] text-white transition-all hover:bg-[#D35400] hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {loading ? "SENDING…" : p.formSubmit.toUpperCase()}
              </button>

              {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center"><p className="text-[12px] text-red-700">{err}</p></div>}

              {/* Success Message */}
              {ok && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                  <p className="text-[13px] text-green-700">
                    {p.formThanks} — {p.formThanksSuffix}
                  </p>
                  <p className="mt-1 text-[10px] text-green-600">POST /inquiries · fallback to localStorage if offline</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type BrandSocial = {
  name: string;
  logo: string;
  description: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

const brands: BrandSocial[] = [
  {
    name: "Barry Callebaut",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png",
    description: "Solusi cokelat berkualitas tinggi untuk kreasi tak terbatas.",
    instagram: "https://instagram.com/barrycallebaut",
  },
  {
    name: "Bensdorp",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    description: "Cokelat premium legendaris sejak 1840.",
    instagram: "https://instagram.com/bensdorp",
    facebook: "https://facebook.com/bensdorp",
  },
  {
    name: "Avante",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Avante_logo.svg/1200px-Avante_logo.svg.png",
    description: "Inovasi bahan baku untuk hasil terbaik setiap hari.",
    instagram: "https://instagram.com/avante",
    tiktok: "https://tiktok.com/@avante",
    facebook: "https://facebook.com/avante",
  },
];

export default function SocialMediaPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative py-4 md:py-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 text-center">
          <Reveal>
            <div className="flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="NaturaFoods"
                className="h-24 object-contain"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              <span className="text-white">Our </span>
              <span className="text-[#4A6741] italic">Social Media</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="max-w-2xl mx-auto text-white/90 text-sm sm:text-base leading-relaxed mb-2">
              Follow dan ikuti terus update dari sosial kami,
            </p>
            <p className="max-w-2xl mx-auto text-white/90 text-sm sm:text-base leading-relaxed">
              agar kamu bisa terus terhubung dan juga update seputar produk dan
              resep terbaru
            </p>
          </Reveal>
        </div>
      </section>

      {/* Brands Social Media Section */}
      <section className="py-2 bg-[#1a0f0a]">
        <div className="mx-auto max-w-250 px-4 sm:px-6 md:px-8">
          <Reveal>
            <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                {brands.map((brand, index) => (
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="text-center"
                  >
                    <div className="h-20 flex items-center justify-center mb-4">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-16 w-auto object-contain"
                      />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[48px]">
                      {brand.description}
                    </p>
                    <div className="flex justify-center gap-4">
                      {brand.instagram && (
                        <a
                          href={brand.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {brand.facebook && (
                        <a
                          href={brand.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      )}
                      {brand.tiktok && (
                        <a
                          href={brand.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-[#1a0f0a]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <Reveal>
            <div className="bg-[#2D4A22] rounded-3xl p-8 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex w-20 h-20 rounded-full bg-[#1e3317] items-center justify-center">
                  <svg className="w-12 h-12 text-[#4A6741]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-white mb-2">
                    Mari Terhubung Bersama Kami!
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[#2D4A22] font-medium hover:bg-white transition-colors shrink-0"
              >
                Hubungi Kami
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

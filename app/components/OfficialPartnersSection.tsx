"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { SEED_OFFICIAL_PARTNERS } from "../lib/data";
import { apiFetch } from "../lib/api";
import type { OfficialPartner } from "../lib/data";

type PartnerCard = {
  title: string;
  description: string;
  image: string;
  brandLogo: string;
  brandName: string;
  link: string;
  color: string;
  background?: string;
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

const partnerCards: PartnerCard[] = [
  {
    title: "Cocoa Powder",
    description:
      "Cocoa powder berkualitas tinggi untuk cita rasa cokelat yang kaya dan autentik.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    brandName: "Bens Dorp",
    link: "/products?cat=cocoa",
    color: "#5D4037",
  },
  {
    title: "Japanese Tea Series",
    description:
      "Bubuk teh hijau premium dengan warna cerah dan rasa khas jepang.",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Afiya_logo.svg/1200px-Afiya_logo.svg.png",
    brandName: "Afya",
    link: "/products?cat=tea",
    color: "#2E7D32",
  },
  {
    title: "Specialty Filling",
    description:
      "Filling premium untuk berbagai kreasi roti, kue, dan pastry dengan tekstur lembut dan rasa istimewa.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Trang_Nghi_logo.svg/1200px-Trang_Nghi_logo.svg.png",
    brandName: "Trang Nghi",
    link: "/products?cat=filling",
    color: "#1565C0",
  },
  {
    title: "Nuts",
    description:
      "Kacang pilihan dengan kualitas terbaik untuk kreasi yang lebih beragam.",
    image:
      "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/OFI_logo.svg/1200px-OFI_logo.svg.png",
    brandName: "OFI",
    link: "/products?cat=nuts",
    color: "#795548",
  },
  {
    title: "Chocolate",
    description:
      "Cokelat berkualitas tinggi dengan rasa lezat dan tekstur sempurna untuk berbagai kebutuhan.",
    image:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Le_Bourne_logo.svg/1200px-Le_Bourne_logo.svg.png",
    brandName: "Le Bourne",
    link: "/products?cat=chocolate",
    color: "#3E2723",
  },
  {
    title: "Raisin",
    description:
      "Kismis berkualitas dari pilihan terbaik untuk rasa manis alami dan tekstur yang sempurna.",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kingland_logo.svg/1200px-Kingland_logo.svg.png",
    brandName: "KingLand",
    link: "/products?cat=raisin",
    color: "#827717",
  },
];

function PartnerCard({ card, index }: { card: PartnerCard; index: number }) {
  const mainImage = card.background && card.background.trim() !== "" ? card.background : card.image;
  const logo = card.brandLogo && card.brandLogo.trim() !== "" ? card.brandLogo : card.image;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group relative overflow-hidden rounded-2xl shadow-lg"
    >
      <Link href={card.link} className="block aspect-[4/3] relative">
        <img
          src={mainImage}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${card.color}cc 0%, ${card.color}99 50%, ${card.color}66 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 right-12">
          <h3 className="text-white text-xl font-semibold mb-2 drop-shadow-lg">
            {card.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
            {card.description}
          </p>
        </div>

        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={card.brandName}
                className="h-8 w-auto max-w-[72px] object-contain rounded bg-white"
              />
            ) : null}
            <span className="text-xs font-medium text-gray-700">
              {card.brandName}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RetailBrandSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl text-[#2D4A22] mb-6">
              Our Retail Home Brand
            </h2>
            <div className="flex justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Avante_logo.svg/1200px-Avante_logo.svg.png"
                alt="Avante Ingredients Series"
                className="h-32 sm:h-40 object-contain"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              {
                img: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=300&q=80",
                alt: "Cocoa products",
              },
              {
                img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=300&q=80",
                alt: "Tea products",
              },
              {
                img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
                alt: "Filling products",
              },
              {
                img: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=300&q=80",
                alt: "Nuts products",
              },
              {
                img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&q=80",
                alt: "Chocolate products",
              },
              {
                img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80",
                alt: "Raisin products",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SmallPackSection() {
  return (
    <section className="py-16 bg-[#F5EFE0]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#2D4A22] mb-4">
              Small Pack for Ingredients Store :
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80",
                name: "Queen Anna Cocoa",
              },
              {
                img: "https://images.unsplash.com/photo-1564890369478-c89ca64c94ea?w=400&q=80",
                name: "Matcha Premium",
              },
              {
                img: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
                name: "Cocoa Powder",
              },
              {
                img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
                name: "Filling Mix",
              },
              {
                img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80",
                name: "Raisin Selection",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-center text-[#2D4A22] font-medium">
                  {item.name}
                </p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type CocoaProduct = {
  code: string;
  brand: string;
  brandLogo: string;
  description: string;
  image: string;
};

type ContactPerson = {
  region: string;
  name: string;
  title: string;
  whatsapp: string;
  email: string;
  avatar: string;
};

const barryCallebautProducts: CocoaProduct[] = [
  {
    code: "20/22 DP",
    brand: "Barry Callebaut",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png",
    description:
      "Lightly dutched medium brown cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "22/24 MR",
    brand: "Barry Callebaut",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png",
    description:
      "Medium Dutched high fat cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "20/22 DP",
    brand: "Barry Callebaut",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png",
    description:
      "Lightly dutched medium brown cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "22/24 MR",
    brand: "Barry Callebaut",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png",
    description:
      "Medium Dutched high fat cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
];

const bensdorpProducts: CocoaProduct[] = [
  {
    code: "20/22 DP",
    brand: "Bensdorp",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    description:
      "Lightly dutched medium brown cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "22/24 MR",
    brand: "Bensdorp",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    description:
      "Medium Dutched high fat cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "20/22 DP",
    brand: "Bensdorp",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    description:
      "Lightly dutched medium brown cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
  {
    code: "22/24 MR",
    brand: "Bensdorp",
    brandLogo:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png",
    description:
      "Medium Dutched high fat cocoa powder made from high quality West African cocoa beans.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
  },
];

const contactPersons: ContactPerson[] = [
  {
    region: "West Indonesia",
    name: "Mr. M. Iswarno",
    title: "Regional Manager Area",
    whatsapp: "+6281234567890",
    email: "iswarno@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    region: "Center Indonesia",
    name: "Mr. Dili Wijaya",
    title: "Regional Manager Area",
    whatsapp: "+6281234567891",
    email: "dili@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
  },
  {
    region: "East Indonesia",
    name: "Mr. Robert Franz",
    title: "Regional Manager Area",
    whatsapp: "+6281234567892",
    email: "robert@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
];

function CocoaProductCard({
  product,
  index,
}: {
  product: CocoaProduct;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.code}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-[#2D4A22]">{product.code}</span>
          <img
            src={product.brandLogo}
            alt={product.brand}
            className="h-6 object-contain"
          />
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          {product.description}
        </p>
        <div className="flex gap-2">
          <a
            href="#"
            className="text-xs text-[#2D4A22] underline hover:no-underline"
          >
            Download Product
          </a>
          <span className="text-xs text-gray-400">|</span>
          <a
            href="#"
            className="text-xs text-[#2D4A22] underline hover:no-underline"
          >
            Spec & Halal
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function ContactCard({
  contact,
  index,
}: {
  contact: ContactPerson;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md"
    >
      <img
        src={contact.avatar}
        alt={contact.name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <p className="font-medium text-[#2D4A22]">{contact.region}</p>
        <p className="text-sm font-semibold text-gray-800">{contact.name}</p>
        <p className="text-xs text-gray-500 mb-2">{contact.title}</p>
        <div className="flex gap-3">
          <a
            href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}
            className="flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Whatsapp
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            E-mail
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function CocoaPowderSeriesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="flex items-center justify-between mb-12">
            <img
              src="/logo.png"
              alt="NaturaFoods"
              className="h-12 object-contain"
            />
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#2D4A22]">
              Cocoa Powder Series
            </h2>
          </div>
        </Reveal>

        {/* Barry Callebaut Section */}
        <Reveal delay={0.1}>
          <div className="mb-12">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Barry_Callebaut_logo.svg/1200px-Barry_Callebaut_logo.svg.png"
                  alt="Barry Callebaut"
                  className="h-12 sm:h-16 object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#2D4A22]">
                  Premium Cocoa Powder
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {barryCallebautProducts.map((product, index) => (
                <CocoaProductCard
                  key={`${product.code}-${index}`}
                  product={product}
                  index={index}
                />
              ))}
            </div>
            <div className="mt-6">
              <ContactInfoSection />
            </div>
          </div>
        </Reveal>

        {/* Bensdorp Section */}
        <Reveal delay={0.2}>
          <div className="border-t border-gray-200 pt-12">
            <div className="mb-8">
              <div className="flex items-center justify-between gap-6 sm:gap-8 mb-6">
                <img
                  src="/logo.png"
                  alt="NaturaFoods"
                  className="h-10 sm:h-12 object-contain"
                />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-[#2D4A22]">
                    Super Premium Cocoa Powder
                  </h3>
                  <p className="text-sm text-gray-600">(African Beans 100%)</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Bens_Dorp_logo.svg/1200px-Bens_Dorp_logo.svg.png"
                  alt="Bensdorp"
                  className="h-12 sm:h-16 object-contain"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bensdorpProducts.map((product, index) => (
                <CocoaProductCard
                  key={`${product.code}-${index}`}
                  product={product}
                  index={index}
                />
              ))}
            </div>
            <div className="mt-6">
              <ContactInfoSection />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactInfoSection() {
  return (
    <div className="mt-8">
      <h4 className="text-center text-xl font-semibold text-[#2D4A22] mb-6">
        Requirement / Contact Info
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactPersons.map((contact, index) => (
          <ContactCard key={contact.name} contact={contact} index={index} />
        ))}
      </div>
    </div>
  );
}

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

export default function OfficialPartnersSection() {
  const { officialPartners } = useStore();
  const [apiPartners, setApiPartners] = useState<OfficialPartner[] | null>(null);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const json = await apiFetch<OfficialPartner[]>("/official-partners?isPublished=true&q=&page=1&limit=50");
        if (!cancel && json.success && Array.isArray(json.data) && json.data.length) {
          const norm = (json.data as unknown as Record<string, unknown>[]).map((p) => ({
            id: String(p.id ?? ""),
            name: String(p.name ?? ""),
            description: String(p.description ?? ""),
            image: String(p.image ?? ""),
            background: String(p.background ?? ""),
            isPublished: p.isPublished ?? true ? true : false,
          })) as OfficialPartner[];
          setApiPartners(norm.filter((p) => p.isPublished !== false));
        }
      } catch {}
    })();
    return () => { cancel = true; };
  }, []);
  const sourcePartners = apiPartners ?? (officialPartners ?? SEED_OFFICIAL_PARTNERS);
  const publishedPartners = sourcePartners.filter((p) => p.isPublished !== false);
  // Map OfficialPartner (id, name, description, image, background, isPublished) -> PartnerCard
  const cards: PartnerCard[] = publishedPartners.length
    ? publishedPartners.map((p) => ({
        title: p.name,
        description: p.description,
        image: p.image || p.background || `https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80`,
        brandLogo: p.image || p.background,
        brandName: p.name,
        link: "/products",
        color: stringToColor(p.id),
        background: p.background,
      }))
    : partnerCards.map((c) => ({
        ...c,
        background: undefined,
      }));

  // Fallback to static cards if no dynamic partners published
  const displayCards = cards.length ? cards : partnerCards;

  return (
    <>
      {/* Official Partner For Indonesia Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[white] to-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <Reveal>
            <div className="text-center mb-10 sm:mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <img
                  src="/logo.png"
                  alt="NaturaFoods"
                  className="h-12 sm:h-16 object-contain"
                />
              </div>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#2D4A22] mb-4">
                Official Partner For Indonesia :
              </h2>
              <p className="max-w-2xl mx-auto text-[#1a1a16]/60 text-sm sm:text-base leading-relaxed">
                Temukan berbagai pilihan bahan berkualitas dari naturafoods
                untuk mendukung setiap ide dan inovasi bisnis Anda.
              </p>
            </div>
          </Reveal>

          {displayCards.length === 0 ? (
            <p className="text-center text-sm text-[#8B6F47]">No official partners published.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayCards.map((card, index) => (
                <PartnerCard key={card.title + index} card={card} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <RetailBrandSection />
      <SmallPackSection />
      <CocoaPowderSeriesSection />
    </>
  );
}

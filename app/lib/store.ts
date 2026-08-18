"use client";
import { useEffect, useState } from "react";
import { SEED_ARTICLES, SEED_EDU, SEED_INNOVATION, SEED_JOBS, SEED_PRODUCTS } from "./data";
import type { Article, Edu, Innovation, Job, Product, Inquiry } from "./data";

const KEYS = { products: "nf_products", articles: "nf_articles", edu: "nf_edu", innovation: "nf_innovation", jobs: "nf_jobs", inquiries: "nf_inquiries" } as const;

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

export function useStore() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [edu, setEdu] = useState<Edu[]>(SEED_EDU);
  const [innovation, setInnovation] = useState<Innovation[]>(SEED_INNOVATION);
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(load(KEYS.products, SEED_PRODUCTS));
    setArticles(load(KEYS.articles, SEED_ARTICLES));
    setEdu(load(KEYS.edu, SEED_EDU));
    setInnovation(load(KEYS.innovation, SEED_INNOVATION));
    setJobs(load(KEYS.jobs, SEED_JOBS));
    setInquiries(load(KEYS.inquiries, []));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save(KEYS.products, products); }, [products, ready]);
  useEffect(() => { if (ready) save(KEYS.articles, articles); }, [articles, ready]);
  useEffect(() => { if (ready) save(KEYS.edu, edu); }, [edu, ready]);
  useEffect(() => { if (ready) save(KEYS.innovation, innovation); }, [innovation, ready]);
  useEffect(() => { if (ready) save(KEYS.jobs, jobs); }, [jobs, ready]);
  useEffect(() => { if (ready) save(KEYS.inquiries, inquiries); }, [inquiries, ready]);

  const reset = () => {
    setProducts(SEED_PRODUCTS); setArticles(SEED_ARTICLES); setEdu(SEED_EDU); setInnovation(SEED_INNOVATION); setJobs(SEED_JOBS);
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  };
  return { ready, products, setProducts, articles, setArticles, edu, setEdu, innovation, setInnovation, jobs, setJobs, inquiries, setInquiries, reset };
}

// for non-hook access (articles list / detail fallback to seed)
export function getSeedArticles(): Article[] {
  try { const v = localStorage.getItem(KEYS.articles); if (v) return JSON.parse(v); } catch {}
  return SEED_ARTICLES;
}
export function getSeedProducts(): Product[] {
  try { const v = localStorage.getItem(KEYS.products); if (v) return JSON.parse(v); } catch {}
  return SEED_PRODUCTS;
}

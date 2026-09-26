"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEMO_PRODUCTS, Product, CATEGORIES } from "@/lib/products";
import { loadCustomProducts } from "@/lib/localstore";
import { searchProducts } from "@/lib/search";
import { useLang } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";

function ShopInner() {
  const params = useSearchParams();
  const { lang } = useLang();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState(params.get("cat") ?? "Tous");
  const [sort, setSort] = useState("new");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [serverResults, setServerResults] = useState<Product[] | null>(null);
  const [custom, setCustom] = useState<Product[]>([]);

  useEffect(() => { setCustom(loadCustomProducts().filter((p) => p.active !== false)); }, []);

  useEffect(() => { setQ(params.get("q") ?? ""); setCat(params.get("cat") ?? "Tous"); }, [params]);

  // live server search (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}`);
        const j = await r.json();
        if (j.results) {
          setServerResults(
            (j.results as Record<string, unknown>[]).map((d) => ({
              id: String(d.id ?? d.slug),
              slug: String(d.slug ?? ""),
              name_fr: String(d.name_fr ?? d.name ?? ""),
              name_ar: String(d.name_ar ?? ""),
              desc_fr: String(d.desc_fr ?? ""),
              desc_ar: String(d.desc_ar ?? ""),
              price_dzd: Number(d.price_dzd ?? d.price ?? 0),
              old_price_dzd: (d.old_price_dzd as number | null) ?? null,
              category: String(d.category ?? "Vestes"),
              sizes: (d.sizes as string[]) ?? ["M", "L", "XL"],
              colors: (d.colors as string[]) ?? ["Noir"],
              stock: Number(d.stock ?? 99),
              images: (d.images as string[]) ?? ["https://picsum.photos/seed/x/800/1000"],
              tiktok_url: String(d.tiktok_url ?? "https://www.tiktok.com/@musslocker"),
              active: true,
            }))
          );
          return;
        }
      } catch { /* offline -> local */ }
      setServerResults(null);
    }, 250);
    return () => clearTimeout(t);
  }, [q, cat]);

  const base = serverResults ?? searchProducts([...custom, ...DEMO_PRODUCTS], q, cat);
  const results = useMemo(() => {
    let list = base.filter((p) => p.price_dzd <= maxPrice);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price_dzd - b.price_dzd);
    if (sort === "promo") list = [...list].sort((a, b) => Number(!!b.old_price_dzd) - Number(!!a.old_price_dzd));
    return list;
  }, [base, sort, maxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">{lang === "fr" ? "Boutique" : "المتجر"}</h1>
      <div className="mt-4 flex flex-col md:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "fr" ? "Recherche: jean, robe, veste, noir..." : "بحث: جينز، فستان، أحمر..."}
          className="flex-1 rounded-full bg-neutral-900 border border-neutral-700 px-5 py-3 outline-none focus:border-red-600"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full bg-neutral-900 border border-neutral-700 px-4 py-3">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-neutral-900 border border-neutral-700 px-4 py-3">
          <option value="new">Nouveautés</option>
          <option value="cheap">Prix croissant</option>
          <option value="promo">Promos</option>
        </select>
      </div>
      <label className="mt-3 block text-sm text-neutral-400">
        Max prix: <b className="text-red-500">{maxPrice} DA</b>
        <input type="range" min={1500} max={10000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
      </label>
      <p className="mt-4 text-sm text-neutral-400">{results.length} modèle(s) — recherche FR/AR tolérante aux fautes</p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {results.length === 0 && <p className="mt-10 text-center text-neutral-500">Aucun résultat. Essaie “jean”, “robe”, “veste”, “noir”.</p>}
    </div>
  );
}

export default function ShopPage() {
  return <Suspense><ShopInner /></Suspense>;
}

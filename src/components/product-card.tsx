"use client";
import Link from "next/link";
import { Product } from "@/lib/products";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/store/cart";
import { TikTokIcon } from "./chrome";
import { useState } from "react";

export function price(n: number) {
  return n.toLocaleString("fr-DZ") + " DA";
}

export function ProductCard({ p }: { p: Product }) {
  const { lang, t } = useLang();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState(p.sizes[0]);
  const [color, setColor] = useState(p.colors[0]);
  const name = lang === "fr" ? p.name_fr : p.name_ar;
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-white">
      <Link href={`/product/${p.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[0]} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        {p.old_price_dzd ? (
          <span className="absolute top-3 left-3 rounded-full bg-red-600 text-white text-xs font-black px-3 py-1">{t.promo}</span>
        ) : (
          <span className="absolute top-3 left-3 rounded-full bg-white text-black text-xs font-black px-3 py-1">{t.new}</span>
        )}
        <a href={p.tiktok_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 rounded-full bg-black/70 p-2 hover:bg-red-600 hover:text-white" title="Vu sur TikTok">
          <TikTokIcon className="h-4 w-4" />
        </a>
      </Link>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-widest text-neutral-400">{p.category}</p>
        <Link href={`/product/${p.slug}`} className="font-bold leading-tight hover:text-red-500">{name}</Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-black text-red-500">{price(p.price_dzd)}</span>
          {p.old_price_dzd && <span className="text-sm line-through text-neutral-500">{price(p.old_price_dzd)}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <select value={size} onChange={(e) => setSize(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg text-xs px-2 py-2">
            {p.sizes.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg text-xs px-2 py-2">
            {p.colors.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => add({ productId: p.id, slug: p.slug, name: p.name_fr, price: p.price_dzd, image: p.images[0], size, color, qty: 1 })}
            className="flex-1 rounded-full bg-white text-black text-sm font-bold py-2 hover:bg-red-600 hover:text-white"
          >
            {t.add_cart}
          </button>
          <Link href="/checkout" className="flex-1 text-center rounded-full bg-red-600 text-white text-sm font-bold py-2 hover:bg-red-700">
            {t.order_now}
          </Link>
        </div>
      </div>
    </div>
  );
}

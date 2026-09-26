"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_PRODUCTS, Product } from "@/lib/products";
import { loadCustomProducts } from "@/lib/localstore";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/store/cart";
import { price } from "@/components/product-card";
import { TikTokIcon } from "@/components/chrome";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [custom, setCustom] = useState<Product[]>([]);
  useEffect(() => { setCustom(loadCustomProducts().filter((p) => p.active !== false)); }, []);
  const p = [...custom, ...DEMO_PRODUCTS].find((x) => x.slug === slug) ?? DEMO_PRODUCTS[0];
  const { lang, t } = useLang();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState(p.sizes[0]);
  const [color, setColor] = useState(p.colors[0]);
  const [qty, setQty] = useState(1);
  const name = lang === "fr" ? p.name_fr : p.name_ar;
  const desc = lang === "fr" ? p.desc_fr : p.desc_ar;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[0]} alt={name} className="w-full aspect-[4/5] object-cover" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-400">{p.category}</p>
        <h1 className="text-3xl font-black mt-1">{name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-black text-red-500">{price(p.price_dzd)}</span>
          {p.old_price_dzd && <span className="line-through text-neutral-500">{price(p.old_price_dzd)}</span>}
        </div>
        <p className="mt-4 text-neutral-300">{desc}</p>
        <div className="mt-5">
          <p className="text-sm font-bold">{t.size}</p>
          <div className="flex gap-2 mt-2">{p.sizes.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-full border text-sm font-bold ${size === s ? "bg-red-600 text-white border-red-600" : "border-neutral-700"}`}>{s}</button>
          ))}</div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-bold">{t.color}</p>
          <div className="flex gap-2 mt-2">{p.colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 rounded-full border text-sm font-bold ${color === c ? "bg-white text-black" : "border-neutral-700"}`}>{c}</button>
          ))}</div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <p className="text-sm font-bold">{t.qty}</p>
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-full border border-neutral-700 font-black">-</button>
          <b>{qty}</b>
          <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-full border border-neutral-700 font-black">+</button>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => add({ productId: p.id, slug: p.slug, name: p.name_fr, price: p.price_dzd, image: p.images[0], size, color, qty })} className="flex-1 rounded-full bg-white text-black font-black py-3 hover:bg-red-600">{t.add_cart}</button>
          <Link href="/checkout" onClick={() => add({ productId: p.id, slug: p.slug, name: p.name_fr, price: p.price_dzd, image: p.images[0], size, color, qty })} className="flex-1 text-center rounded-full bg-red-600 text-white font-black py-3">{t.order_now}</Link>
        </div>
        <a href={p.tiktok_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-red-400">
          <TikTokIcon className="h-4 w-4" /> Voir sur TikTok @musslocker
        </a>
        <p className="mt-3 text-xs text-neutral-500">✓ {t.cod} • ✓ QR + code 8 caractères après commande</p>
      </div>
    </div>
  );
}

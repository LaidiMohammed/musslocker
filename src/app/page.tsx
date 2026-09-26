"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DEMO_PRODUCTS, Product, TIKTOK_URL, CATEGORIES, HERO_IMAGE } from "@/lib/products";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { TikTokIcon } from "@/components/chrome";

export default function Home() {
  const { t, lang } = useLang();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.from("products").select("*").eq("active", true).limit(24).then(({ data }) => {
      if (data && data.length > 0) {
        setProducts(
          data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            slug: String(d.slug),
            name_fr: String(d.name_fr ?? ""),
            name_ar: String(d.name_ar ?? ""),
            desc_fr: String(d.desc_fr ?? ""),
            desc_ar: String(d.desc_ar ?? ""),
            price_dzd: Number(d.price_dzd ?? 0),
            old_price_dzd: (d.old_price_dzd as number | null) ?? null,
            category: String(d.category ?? "Vestes"),
            sizes: (d.sizes as string[]) ?? ["M", "L", "XL"],
            colors: (d.colors as string[]) ?? ["Noir"],
            stock: Number(d.stock ?? 0),
            images: (d.images as string[]) ?? [],
            tiktok_url: String(d.tiktok_url ?? TIKTOK_URL),
            active: true,
          }))
        );
      }
    });
  }, []);

  return (
    <div>
      {/* HERO — style Wix template fashion 2114, rouge & noir */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt="hero" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-red-950/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <p className="inline-block rounded-full bg-red-600 text-white text-xs font-black px-4 py-1">{t.hero_kicker}</p>
          <h1 className="mt-4 max-w-2xl text-5xl md:text-7xl font-black leading-[0.95]">{t.hero_title}</h1>
          <p className="mt-4 max-w-xl text-neutral-300">{t.hero_sub}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full bg-red-600 text-white font-black px-7 py-3 hover:bg-red-700">{t.hero_cta}</Link>
            <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-bold hover:bg-white hover:text-black">
              <TikTokIcon className="h-4 w-4" /> {t.hero_tiktok}
            </a>
          </div>
        </div>
      </section>

      {/* marquee */}
      <div className="overflow-hidden bg-red-600 text-white font-black py-2 border-y-4 border-black">
        <div className="marquee flex whitespace-nowrap gap-8 w-max">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i}>MUSSLOCKER • PAIEMENT À LA LIVRAISON • 58 WILAYAS • @musslocker •&nbsp;</span>
          ))}
        </div>
      </div>

      {/* categories */}
      <section className="mx-auto max-w-7xl px-4 mt-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/shop?cat=${encodeURIComponent(c)}`} className="shrink-0 rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600">
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* best sellers */}
      <section className="mx-auto max-w-7xl px-4 mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-black">{t.best}</h2>
          <Link href="/shop" className="text-sm font-bold text-red-500">{t.all} →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* TikTok banner */}
      <section className="mx-auto max-w-7xl px-4 mt-12">
        <div className="rounded-3xl bg-gradient-to-r from-black to-red-950 border border-red-900 p-8 md:p-12 flex flex-col md:flex-row items-center gap-6">
          <div className="rounded-3xl bg-black p-5 border border-red-900"><TikTokIcon className="h-12 w-12 text-red-500" /></div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black">{lang === "fr" ? "Vu sur TikTok ? Commande ici" : "شفتها على تيك توك؟ اطلب من هنا"}</h3>
            <p className="text-neutral-400 text-sm mt-1">{lang === "fr" ? "Tous les modèles de @musslocker sont disponibles avec tailles + couleurs + QR de suivi." : "كل موديلات @musslocker متوفرة بالمقاسات والألوان + QR للتتبع."}</p>
          </div>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="rounded-full bg-white text-black font-black px-6 py-3">TikTok</a>
          <Link href="/shop" className="rounded-full bg-red-600 text-white font-black px-6 py-3 hover:bg-red-700">{t.hero_cta}</Link>
        </div>
      </section>

      {/* perks */}
      <section className="mx-auto max-w-7xl px-4 mt-10 grid md:grid-cols-3 gap-4 text-sm">
        {[
          { fr: "ID 8 caractères + QR par commande", ar: "كود من 8 حروف + QR لكل طلب" },
          { fr: "Recherche rapide FR/AR + filtres taille/prix", ar: "بحث سريع عربي/فرنسي + فلترة" },
          { fr: "Paiement à la livraison 58 wilayas", ar: "الدفع عند الاستلام 58 ولاية" },
        ].map((x, i) => (
          <div key={i} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 font-bold">
            ✓ {lang === "fr" ? x.fr : x.ar}
          </div>
        ))}
      </section>
    </div>
  );
}

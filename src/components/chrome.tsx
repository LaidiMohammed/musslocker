"use client";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { TIKTOK_URL } from "@/lib/products";
import { useCart } from "@/store/cart";

export function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2.2 1.8 3.6 4.1 3.8v3.1c-1.5 0-2.9-.5-4.1-1.3v6.1c0 3.9-2.7 6.3-6.1 6.3-3.3 0-5.9-2.5-5.9-5.9 0-3.5 2.8-6 6.4-5.8v3.2c-1.7-.3-3.2.9-3.2 2.6 0 1.5 1.2 2.7 2.7 2.7 1.6 0 2.8-1.2 2.8-3.1V3h3.3z" />
    </svg>
  );
}

export function Header() {
  const { t, lang, setLang } = useLang();
  const [q, setQ] = useState("");
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  return (
    <header className="sticky top-0 z-40 border-b border-red-950 bg-black text-white">
      <div className="bg-red-600 text-white text-center text-xs font-bold py-1 px-2">
        {lang === "fr" ? "LIVRAISON 58 WILAYAS • PAIEMENT À LA LIVRAISON • VU SUR TIKTOK" : "توصيل لـ 58 ولاية • الدفع عند الاستلام • شفتونا على تيك توك"}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/muss.jpg" alt="MussLocker logo" className="h-11 w-11 rounded-full object-cover border-2 border-red-600" />
          <span className="font-black text-xl tracking-tight hidden sm:inline">
            MUSS<span className="text-red-600">LOCKER</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
          <Link href="/" className="hover:text-red-500">{t.home}</Link>
          <Link href="/shop" className="hover:text-red-500">{t.shop}</Link>
        </nav>
        <form action="/shop" className="order-4 basis-full flex md:order-none md:basis-auto md:flex-1 max-w-xl md:mx-auto">
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full rounded-l-full bg-neutral-900 border border-neutral-700 px-4 py-2 text-sm outline-none focus:border-red-600"
          />
          <button className="rounded-r-full bg-red-600 text-white font-bold px-4 text-sm hover:bg-red-700">{t.search}</button>
        </form>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-bold"
          >
            {lang === "fr" ? "عربية" : "FR"}
          </button>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="rounded-full bg-white text-black p-2 hover:bg-red-600 hover:text-white" title="TikTok @musslocker">
            <TikTokIcon />
          </a>
          <Link href="/checkout" className="relative rounded-full bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700">
            {t.cart} • {count}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { lang } = useLang();
  return (
    <footer className="bg-black text-neutral-300 mt-16 border-t border-red-950">
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/muss.jpg" alt="MussLocker logo" className="h-14 w-14 rounded-2xl object-cover border-2 border-red-600" />
            <p className="font-black text-white text-lg">MUSS<span className="text-red-600">LOCKER</span></p>
          </div>
          <p className="text-sm mt-2">{lang === "fr" ? "Boutique vêtements — style Wix Fashion. Commande simple + QR + suivi." : "متجر ملابس — طلب سهل + QR + تتبع."}</p>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 rounded-full bg-red-600 text-white font-bold px-4 py-2 text-sm hover:bg-red-700">
            <TikTokIcon className="h-4 w-4" /> @musslocker
          </a>
        </div>
        <div className="text-sm">
          <p className="font-bold text-white mb-2">{lang === "fr" ? "Liens" : "روابط"}</p>
          <div className="flex flex-col gap-1">
            <Link href="/shop">Boutique / المتجر</Link>
            <Link href="/suivi">Suivi / تتبع</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-bold text-white mb-2">Contact</p>
          <p>TikTok: @musslocker</p>
          <p>{lang === "fr" ? "Paiement à la livraison — 58 wilayas" : "الدفع عند الاستلام — 58 ولاية"}</p>
        </div>
      </div>
    </footer>
  );
}

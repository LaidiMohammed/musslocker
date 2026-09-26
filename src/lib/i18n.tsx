"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "fr" | "ar";

const dict = {
  fr: {
    home: "Accueil",
    shop: "Boutique",
    track: "Suivi commande",
    contact: "Contact",
    search_placeholder: "Rechercher jean, robe, veste, taille...",
    search: "Rechercher",
    hero_kicker: "Nouvelle collection",
    hero_title: "TON STYLE COMMENCE ICI",
    hero_sub: "Vestes, jeans, robes & essentiels — boutique MussLocker. Vu sur TikTok @musslocker.",
    hero_cta: "Voir la boutique",
    hero_tiktok: "Voir TikTok",
    best: "Meilleures ventes",
    all: "Tout voir",
    promo: "PROMO",
    new: "NEW",
    order_now: "Commander",
    add_cart: "Ajouter",
    cart: "Panier",
    checkout: "Commander",
    total: "Total",
    name: "Nom",
    first_name: "Prénom",
    phone: "Téléphone",
    wilaya: "Wilaya",
    commune: "Commune",
    address: "Adresse complète",
    size: "Taille",
    color: "Couleur",
    qty: "Quantité",
    notes: "Notes (optionnel)",
    confirm_order: "Confirmer la commande",
    order_success: "Commande envoyée !",
    order_code: "Ton code commande (8 caractères)",
    save_qr: "Garde ce code + QR pour le suivi",
    download_qr: "Télécharger QR",
    track_title: "Suivre ma commande",
    track_btn: "Suivre",
    admin: "Admin",
    cod: "Paiement à la livraison",
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    track: "تتبع الطلب",
    contact: "اتصل بنا",
    search_placeholder: "ابحث عن جينز، فستان، سترة...",
    search: "بحث",
    hero_kicker: "تشكيلة جديدة",
    hero_title: "ستايلك يبدأ من هنا",
    hero_sub: "سترات، جينز، فساتين وأساسيات — متجر موس لوكر. شفتوها على تيك توك @musslocker.",
    hero_cta: "شوف المتجر",
    hero_tiktok: "شوف تيك توك",
    best: "الأكثر مبيعاً",
    all: "شوف الكل",
    promo: "تخفيض",
    new: "جديد",
    order_now: "اطلب",
    add_cart: "أضف",
    cart: "السلة",
    checkout: "اطلب الآن",
    total: "المجموع",
    name: "اللقب",
    first_name: "الاسم",
    phone: "الهاتف",
    wilaya: "الولاية",
    commune: "البلدية",
    address: "العنوان الكامل",
    size: "المقاس",
    color: "اللون",
    qty: "الكمية",
    notes: "ملاحظات (اختياري)",
    confirm_order: "تأكيد الطلب",
    order_success: "تم إرسال الطلب!",
    order_code: "كود الطلب (8 حروف)",
    save_qr: "احتفظ بالكود + QR للتتبع",
    download_qr: "تحميل QR",
    track_title: "تتبع طلبي",
    track_btn: "تتبع",
    admin: "إدارة",
    cod: "الدفع عند الاستلام",
  },
} as const;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof dict)["fr"]; dir: "ltr" | "rtl" };
const LanguageContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: dict.fr, dir: "ltr" });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const saved = localStorage.getItem("muss-lang") as Lang | null;
    if (saved === "fr" || saved === "ar") setLangState(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("muss-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dict[lang] as unknown as (typeof dict)["fr"], dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLang = () => useContext(LanguageContext);

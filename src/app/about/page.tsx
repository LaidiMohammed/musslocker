"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { TIKTOK_URL } from "@/lib/products";
import { TikTokIcon } from "@/components/chrome";

export default function AboutPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/muss.jpg" alt="MussLocker" className="h-64 w-full object-cover md:h-96" />
      </div>
      <h1 className="mt-6 text-4xl font-black">
        {fr ? <>À propos de <span className="text-red-600">MUSSLOCKER</span></> : <>من نحن <span className="text-red-600">موس لوكر</span></>}
      </h1>
      <div className="mt-4 space-y-4 text-neutral-300 leading-relaxed">
        {fr ? (
          <>
            <p>
              <b className="text-white">MussLocker</b> est une boutique de vêtements née sur TikTok
              (<a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="text-red-500 font-bold">@musslocker</a>).
              Vestes, jeans, robes, chemises et essentiels — des modèles choisis pour le style street du quotidien,
              à des prix accessibles.
            </p>
            <p>
              Commande simple, <b className="text-white">paiement à la livraison</b> dans les{" "}
              <b className="text-white">58 wilayas</b>. Chaque commande reçoit un{" "}
              <b className="text-white">code de 8 caractères + QR code</b> pour suivre ton colis facilement.
            </p>
            <p>
              Tu as vu un modèle dans nos vidéos ? Cherche son nom dans la boutique ou commande directement —
              tailles et couleurs affichées sur chaque article.
            </p>
          </>
        ) : (
          <>
            <p>
              <b className="text-white">موس لوكر</b> متجر ملابس وُلد على تيك توك
              (<a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="text-red-500 font-bold">@musslocker</a>).
              سترات، جينز، فساتين، قمصان وأساسيات — موديلات مختارة بستايل ستريت يومي وأسعار في المتناول.
            </p>
            <p>
              طلب سهل، <b className="text-white">الدفع عند الاستلام</b> في <b className="text-white">58 ولاية</b>.
              كل طلب يحصل على <b className="text-white">كود من 8 حروف + QR</b> لتتبع الطرد بسهولة.
            </p>
            <p>
              شفت موديل في فيديوهاتنا؟ ابحث عن اسمه في المتجر أو اطلب مباشرة —
              المقاسات والألوان معروضة على كل منتج.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
        {[
          { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام" },
          { fr: "QR + code suivi 8 caractères", ar: "QR + كود تتبع 8 حروف" },
          { fr: "Livraison 58 wilayas", ar: "توصيل 58 ولاية" },
        ].map((x, i) => (
          <div key={i} className="rounded-2xl border border-red-900 bg-neutral-950 p-5 font-bold text-center">
            ✓ {fr ? x.fr : x.ar}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="rounded-full bg-red-600 text-white font-black px-7 py-3 hover:bg-red-700">
          {fr ? "Voir la boutique" : "شوف المتجر"}
        </Link>
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-bold hover:bg-white hover:text-black">
          <TikTokIcon className="h-4 w-4" /> TikTok @musslocker
        </a>
      </div>
    </div>
  );
}

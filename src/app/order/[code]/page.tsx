"use client";
import { use } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

type OrderRecord = {
  order_code: string; first_name: string; last_name: string; phone: string;
  wilaya: string; commune: string; address: string; total_dzd: number;
  qr_data_url: string; qr_payload: unknown; status: string;
};

function getLocal(code: string): OrderRecord | null {
  try {
    const hist = JSON.parse(localStorage.getItem("muss-orders") || "[]") as OrderRecord[];
    return hist.find((o) => o.order_code === code) ?? null;
  } catch { return null; }
}

export default function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { t } = useLang();
  const order = typeof window !== "undefined" ? getLocal(code.toUpperCase()) : null;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <p className="text-5xl">✅</p>
      <h1 className="mt-2 text-3xl font-black">{t.order_success}</h1>
      <p className="mt-2 text-neutral-400">{t.order_code}</p>
      <p className="mt-1 font-mono text-4xl font-black tracking-widest text-red-500">{code.toUpperCase()}</p>
      <p className="text-sm text-neutral-400 mt-1">{t.save_qr}</p>
      {order ? (
        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.qr_data_url} alt="QR commande" className="mx-auto h-56 w-56 rounded-2xl bg-white p-2" />
          <div className="mt-4 text-left text-sm space-y-1">
            <p><b>Nom:</b> {order.first_name} {order.last_name}</p>
            <p><b>Tél:</b> {order.phone}</p>
            <p><b>Wilaya:</b> {order.wilaya} — {order.commune}</p>
            <p><b>Total:</b> {order.total_dzd.toLocaleString("fr-DZ")} DA (à la livraison)</p>
            <p><b>Statut:</b> {order.status}</p>
          </div>
          <div className="mt-4 flex gap-2 justify-center">
            <a href={order.qr_data_url} download={`MUSS-${order.order_code}.png`} className="rounded-full bg-red-600 text-white font-black px-6 py-2 text-sm">{t.download_qr}</a>
            <button onClick={() => window.print()} className="rounded-full border border-neutral-600 px-6 py-2 text-sm font-bold">Print</button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-400">Commande passée sur un autre appareil ? Retrouve-la via <Link href="/suivi" className="text-red-500 font-bold">Suivi</Link> avec ton code + téléphone.</p>
      )}
      <div className="mt-6 flex gap-2 justify-center">
        <Link href="/shop" className="rounded-full bg-white text-black font-bold px-6 py-2 text-sm">Continuer shopping</Link>
        <Link href="/suivi" className="rounded-full border border-neutral-600 px-6 py-2 text-sm font-bold">{t.track}</Link>
      </div>
    </div>
  );
}

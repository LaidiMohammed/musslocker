"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useLang } from "@/lib/i18n";
import { WILAYAS } from "@/lib/wilayas";

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", wilaya: "16-Alger", commune: "", address: "", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (items.length === 0) { setErr(lang === "fr" ? "Panier vide" : "السلة فارغة"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, product_name: i.name, size: i.size, color: i.color, qty: i.qty, unit_price: i.price })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erreur");
      // local history for suivi/admin fallback
      const hist = JSON.parse(localStorage.getItem("muss-orders") || "[]");
      hist.unshift(j);
      localStorage.setItem("muss-orders", JSON.stringify(hist));
      clear();
      router.push(`/order/${j.order_code}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 grid md:grid-cols-2 gap-8">
      <form onSubmit={submit} className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 space-y-3">
        <h1 className="text-2xl font-black">{t.checkout} — {t.cod}</h1>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">{t.first_name}<input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
          <label className="text-sm">{t.name}<input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
        </div>
        <label className="block text-sm">{t.phone} (05/06/07...)<input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0550123456" className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">{t.wilaya}<select value={form.wilaya} onChange={(e) => set("wilaya", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2">{WILAYAS.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label className="text-sm">{t.commune}<input required value={form.commune} onChange={(e) => set("commune", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
        </div>
        <label className="block text-sm">{t.address}<textarea required value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
        <label className="block text-sm">{t.notes}<input value={form.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2" /></label>
        {err && <p className="text-red-400 text-sm font-bold">{err}</p>}
        <button disabled={loading} className="w-full rounded-full bg-red-600 text-white font-black py-3 disabled:opacity-50">
          {loading ? "..." : `${t.confirm_order} • ${total.toLocaleString("fr-DZ")} DA`}
        </button>
      </form>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 h-fit">
        <h2 className="font-black">{t.cart} ({items.length})</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.map((i, idx) => (
            <div key={idx} className="flex justify-between gap-2 border-b border-neutral-800 pb-2">
              <span>{i.name} <b>{i.size}/{i.color}</b> x{i.qty}</span>
              <b>{(i.price * i.qty).toLocaleString("fr-DZ")} DA</b>
            </div>
          ))}
          {items.length === 0 && <p className="text-neutral-500">Panier vide — <a href="/shop" className="text-red-500 font-bold">aller boutique</a></p>}
        </div>
        <p className="mt-4 font-black text-red-500 text-xl">{t.total}: {total.toLocaleString("fr-DZ")} DA</p>
      </div>
    </div>
  );
}

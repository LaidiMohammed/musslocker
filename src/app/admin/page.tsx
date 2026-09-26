"use client";
import { useEffect, useState } from "react";
import { DEMO_PRODUCTS, Product, TIKTOK_URL } from "@/lib/products";
import { supabaseBrowser } from "@/lib/supabase/client";

const STATUSES = ["nouvelle", "confirmee", "expediee", "livree", "annulee"];

type OrderRow = {
  order_code: string; first_name: string; last_name: string; phone: string;
  wilaya: string; commune: string; address: string; total_dzd: number;
  status: string; created_at: string; qr_data_url?: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [scan, setScan] = useState("");
  const [form, setForm] = useState({ name_fr: "", price_dzd: "", category: "Hoodies", sizes: "M,L,XL", colors: "Noir,Blanc", stock: "50", image: "", tiktok_url: TIKTOK_URL });

  useEffect(() => {
    if (sessionStorage.getItem("muss-admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    // local orders
    try { setOrders(JSON.parse(localStorage.getItem("muss-orders") || "[]")); } catch { /* */ }
    // supabase orders merge
    const sb = supabaseBrowser();
    if (sb) {
      sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
        if (data) setOrders((prev) => {
          const localCodes = new Set(prev.map((o) => o.order_code));
          const merged = [...prev];
          for (const d of data as unknown as OrderRow[]) if (!localCodes.has(d.order_code)) merged.push(d);
          return merged;
        });
      });
      sb.from("products").select("*").limit(100).then(({ data }) => {
        if (data && data.length) {
          setProducts(data.map((d: Record<string, unknown>) => ({
            id: String(d.id), slug: String(d.slug), name_fr: String(d.name_fr),
            name_ar: String(d.name_ar ?? ""), desc_fr: String(d.desc_fr ?? ""), desc_ar: "",
            price_dzd: Number(d.price_dzd), old_price_dzd: null,
            category: String(d.category), sizes: (d.sizes as string[]) ?? ["M"],
            colors: (d.colors as string[]) ?? ["Noir"], stock: Number(d.stock),
            images: (d.images as string[]) ?? [], tiktok_url: String(d.tiktok_url ?? TIKTOK_URL), active: true,
          })));
        }
      });
    }
  }, [authed]);

  function login() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_CODE || "MUSS2024";
    if (code === expected) { sessionStorage.setItem("muss-admin", "1"); setAuthed(true); }
    else alert("Code admin incorrect (défaut: MUSS2024)");
  }

  function setStatus(orderCode: string, status: string) {
    setOrders((prev) => {
      const next = prev.map((o) => o.order_code === orderCode ? { ...o, status } : o);
      localStorage.setItem("muss-orders", JSON.stringify(next));
      return next;
    });
  }

  function addProduct() {
    if (!form.name_fr || !form.price_dzd) { alert("Nom + prix requis"); return; }
    const slug = form.name_fr.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    const p: Product = {
      id: "local-" + Date.now(), slug,
      name_fr: form.name_fr, name_ar: form.name_fr,
      desc_fr: "", desc_ar: "",
      price_dzd: Number(form.price_dzd), old_price_dzd: null,
      category: form.category,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      images: [form.image || `https://picsum.photos/seed/${slug}/800/1000`],
      tiktok_url: form.tiktok_url || TIKTOK_URL, active: true,
    };
    setProducts((prev) => [p, ...prev]);
    setForm({ name_fr: "", price_dzd: "", category: "Hoodies", sizes: "M,L,XL", colors: "Noir,Blanc", stock: "50", image: "", tiktok_url: TIKTOK_URL });
    alert("Modèle ajouté (local). Pour le rendre global, ajoute-le aussi dans Supabase > products.");
  }

  function deleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-black">Admin MussLocker</h1>
        <p className="text-sm text-neutral-400 mt-1">Code par défaut: MUSS2024 (change via NEXT_PUBLIC_ADMIN_CODE)</p>
        <input value={code} onChange={(e) => setCode(e.target.value)} type="password" placeholder="Code admin"
          className="mt-4 w-full rounded-full bg-neutral-900 border border-neutral-700 px-5 py-3 text-center" />
        <button onClick={login} className="mt-3 w-full rounded-full bg-red-600 text-white font-black py-3">Entrer</button>
      </div>
    );
  }

  const filtered = scan ? orders.filter((o) => o.order_code.includes(scan.toUpperCase()) || o.phone.includes(scan) || `${o.first_name} ${o.last_name}`.toLowerCase().includes(scan.toLowerCase())) : orders;
  const ca = orders.filter((o) => o.status !== "annulee").reduce((s, o) => s + o.total_dzd, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Admin</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-full text-sm font-bold ${tab === "orders" ? "bg-red-600 text-white" : "border border-neutral-700"}`}>Commandes ({orders.length})</button>
          <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-full text-sm font-bold ${tab === "products" ? "bg-red-600 text-white" : "border border-neutral-700"}`}>Modèles ({products.length})</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><p className="text-xs text-neutral-400">CA (hors annulées)</p><p className="font-black text-red-500 text-xl">{ca.toLocaleString("fr-DZ")} DA</p></div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><p className="text-xs text-neutral-400">Nouvelles</p><p className="font-black text-xl">{orders.filter((o) => o.status === "nouvelle").length}</p></div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><p className="text-xs text-neutral-400">Total</p><p className="font-black text-xl">{orders.length}</p></div>
      </div>

      {tab === "orders" && (
        <div className="mt-6">
          <input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Scanner / chercher: code 8 chars, téléphone, nom..."
            className="w-full rounded-full bg-neutral-900 border border-neutral-700 px-5 py-3 font-mono outline-none focus:border-red-600" />
          <div className="mt-4 space-y-3">
            {filtered.map((o) => (
              <div key={o.order_code} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <p className="font-mono font-black text-red-500 text-lg">{o.order_code}</p>
                  <span className="text-xs rounded-full bg-white/10 px-3 py-1 font-bold">{o.status}</span>
                </div>
                <p className="text-sm mt-1">{o.first_name} {o.last_name} • {o.phone} • {o.wilaya} {o.commune}</p>
                <p className="text-xs text-neutral-400">{o.address} • {o.total_dzd.toLocaleString("fr-DZ")} DA • {new Date(o.created_at).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatus(o.order_code, s)}
                      className={`text-xs px-3 py-1 rounded-full font-bold ${o.status === s ? "bg-red-600 text-white" : "border border-neutral-700"}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-neutral-500 text-sm">Aucune commande. Les commandes passées sur ce navigateur apparaissent ici + Supabase si configuré.</p>}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
            <h2 className="font-black">+ Nouveau modèle (depuis TikTok)</h2>
            <input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder="Nom ex: Veste cuir noir" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.price_dzd} onChange={(e) => setForm({ ...form, price_dzd: e.target.value })} placeholder="Prix DA" type="number" className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            </div>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Tailles: M,L,XL" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Couleurs: Noir,Blanc" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="URL photo (ou auto)" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} placeholder="Lien TikTok vidéo" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <button onClick={addProduct} className="w-full rounded-full bg-red-600 text-white font-black py-2 text-sm">Ajouter modèle</button>
            <p className="text-xs text-neutral-500">Astuce TikTok: copie le lien de chaque vidéo @musslocker dans “Lien TikTok” du produit.</p>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {products.map((p) => (
              <div key={p.id} className="flex gap-3 items-center rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt="" className="h-14 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-bold">{p.name_fr}</p>
                  <p className="text-xs text-neutral-400">{p.category} • {p.price_dzd} DA • stock {p.stock}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-xs border border-red-500/50 text-red-400 rounded-full px-3 py-1">Suppr</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

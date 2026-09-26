"use client";
import { useEffect, useRef, useState } from "react";
import { DEMO_PRODUCTS, Product, TIKTOK_URL } from "@/lib/products";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  OrderRow, loadCustomProducts, saveCustomProducts,
  loadLocalOrders, saveLocalOrders, seedDemoOrders, fileToDataUrl,
} from "@/lib/localstore";

const STATUSES = ["nouvelle", "confirmee", "expediee", "livree", "annulee"];

const EMPTY_FORM = { name_fr: "", price_dzd: "", old_price_dzd: "", category: "Vestes", sizes: "M,L,XL", colors: "Noir,Blanc", stock: "50", image: "", tiktok_url: TIKTOK_URL };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [custom, setCustom] = useState<Product[]>([]);
  const [remote, setRemote] = useState<Product[] | null>(null); // supabase products when configured
  const [scan, setScan] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ price_dzd: "", old_price_dzd: "", stock: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("muss-admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setCustom(loadCustomProducts());
    setOrders(loadLocalOrders());
    const sb = supabaseBrowser();
    if (sb) {
      sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
        if (data) setOrders((prev) => {
          const codes = new Set(prev.map((o) => o.order_code));
          const merged = [...prev];
          for (const d of data as unknown as OrderRow[]) if (!codes.has(d.order_code)) merged.push(d);
          saveLocalOrders(merged);
          return merged;
        });
      });
      sb.from("products").select("*").limit(100).then(({ data }) => {
        if (data && data.length) {
          setRemote(data.map((d: Record<string, unknown>) => ({
            id: String(d.id), slug: String(d.slug), name_fr: String(d.name_fr),
            name_ar: String(d.name_ar ?? ""), desc_fr: String(d.desc_fr ?? ""), desc_ar: "",
            price_dzd: Number(d.price_dzd), old_price_dzd: (d.old_price_dzd as number | null) ?? null,
            category: String(d.category), sizes: (d.sizes as string[]) ?? ["M"],
            colors: (d.colors as string[]) ?? ["Noir"], stock: Number(d.stock),
            images: (d.images as string[]) ?? [], tiktok_url: String(d.tiktok_url ?? TIKTOK_URL), active: true,
          })));
        }
      });
    }
  }, [authed]);

  const products = [...custom, ...(remote ?? DEMO_PRODUCTS)];

  function login() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_CODE || "MUSS2024";
    if (code === expected) { sessionStorage.setItem("muss-admin", "1"); setAuthed(true); }
    else alert("Code admin incorrect (défaut: MUSS2024)");
  }

  // ---- orders ----
  function persistOrders(next: OrderRow[]) {
    setOrders(next);
    saveLocalOrders(next);
  }
  function setStatus(orderCode: string, status: string) {
    persistOrders(orders.map((o) => o.order_code === orderCode ? { ...o, status } : o));
  }
  function deleteOrder(orderCode: string) {
    if (!confirm(`Supprimer la commande ${orderCode} ?`)) return;
    persistOrders(orders.filter((o) => o.order_code !== orderCode));
  }
  function loadDemo() {
    persistOrders(seedDemoOrders());
  }

  // ---- products ----
  function persistCustom(next: Product[]) {
    setCustom(next);
    saveCustomProducts(next);
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Choisis une image"); return; }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      // Try Supabase Storage first (global URL), fallback to local dataURL
      const sb = supabaseBrowser();
      if (sb) {
        try {
          const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
          const { error } = await sb.storage.from("products").upload(path, file, { upsert: true });
          if (!error) {
            const { data } = sb.storage.from("products").getPublicUrl(path);
            setForm((f) => ({ ...f, image: data.publicUrl }));
            setPreview(data.publicUrl);
            return;
          }
        } catch { /* fallback local */ }
      }
      setForm((f) => ({ ...f, image: dataUrl }));
      setPreview(dataUrl);
    } catch {
      alert("Image illisible");
    } finally {
      setUploading(false);
    }
  }

  function addProduct() {
    if (!form.name_fr || !form.price_dzd) { alert("Nom + prix requis"); return; }
    const slug = form.name_fr.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    const p: Product = {
      id: "local-" + Date.now(), slug,
      name_fr: form.name_fr, name_ar: form.name_fr,
      desc_fr: "", desc_ar: "",
      price_dzd: Number(form.price_dzd),
      old_price_dzd: form.old_price_dzd ? Number(form.old_price_dzd) : null,
      category: form.category,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      images: [form.image || `https://picsum.photos/seed/${slug}/800/1000`],
      tiktok_url: form.tiktok_url || TIKTOK_URL, active: true,
    };
    persistCustom([p, ...custom]);
    setForm(EMPTY_FORM);
    setPreview("");
    alert("Modèle ajouté ✅ Visible dans la boutique sur cet appareil. Pour le global, ajoute-le dans Supabase > products.");
  }

  function deleteProduct(id: string) {
    if (!custom.some((p) => p.id === id)) { alert("Les modèles démo se remplacent via Supabase (ou ajoute tes propres modèles)"); return; }
    if (!confirm("Supprimer ce modèle ?")) return;
    persistCustom(custom.filter((p) => p.id !== id));
  }

  function duplicateProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const copy: Product = { ...p, id: "local-" + Date.now(), slug: p.slug + "-copie-" + Date.now().toString(36), name_fr: p.name_fr + " (copie)" };
    persistCustom([copy, ...custom]);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEdit({ price_dzd: String(p.price_dzd), old_price_dzd: p.old_price_dzd ? String(p.old_price_dzd) : "", stock: String(p.stock) });
  }

  function saveEdit(id: string) {
    const found = custom.find((p) => p.id === id);
    if (!found) { alert("Seuls tes modèles ajoutés sont modifiables ici"); setEditingId(null); return; }
    persistCustom(custom.map((p) => p.id === id ? {
      ...p,
      price_dzd: Number(edit.price_dzd) || p.price_dzd,
      old_price_dzd: edit.old_price_dzd ? Number(edit.old_price_dzd) : null,
      stock: Number(edit.stock),
    } : p));
    setEditingId(null);
  }

  function toggleActive(id: string) {
    persistCustom(custom.map((p) => p.id === id ? { ...p, active: !p.active } : p));
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Scanner / chercher: code 8 chars, téléphone, nom..."
              className="flex-1 rounded-full bg-neutral-900 border border-neutral-700 px-5 py-3 font-mono outline-none focus:border-red-600" />
            <button onClick={loadDemo} className="rounded-full border border-red-600 text-red-400 font-bold px-5 py-2 text-sm whitespace-nowrap">
              + Charger démo
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {filtered.map((o) => (
              <div key={o.order_code} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <p className="font-mono font-black text-red-500 text-lg">{o.order_code}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded-full bg-white/10 px-3 py-1 font-bold">{o.status}</span>
                    <button onClick={() => deleteOrder(o.order_code)} className="text-xs border border-red-500/50 text-red-400 rounded-full px-3 py-1">Suppr</button>
                  </div>
                </div>
                <p className="text-sm mt-1">{o.first_name} {o.last_name} • {o.phone} • {o.wilaya} {o.commune}</p>
                <p className="text-xs text-neutral-400">{o.address} • {o.total_dzd.toLocaleString("fr-DZ")} DA • {new Date(o.created_at).toLocaleString()}</p>
                {o.items && (
                  <p className="text-xs text-neutral-300 mt-1">{o.items.map((i) => `${i.product_name} ${i.size}/${i.color} x${i.qty}`).join(" • ")}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatus(o.order_code, s)}
                      className={`text-xs px-3 py-1 rounded-full font-bold ${o.status === s ? "bg-red-600 text-white" : "border border-neutral-700"}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500 text-sm">Aucune commande. Passe une vraie commande via la boutique, ou :</p>
                <button onClick={loadDemo} className="mt-3 rounded-full bg-red-600 text-white font-black px-6 py-2 text-sm">Voir avec des commandes démo</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 h-fit">
            <h2 className="font-black">+ Nouveau modèle (depuis TikTok)</h2>
            {/* photo from device */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full rounded-2xl border-2 border-dashed border-neutral-700 p-4 text-sm font-bold text-neutral-300 hover:border-red-600">
              {uploading ? "Chargement..." : preview ? "Changer la photo 📷" : "📷 Photo depuis l'appareil"}
            </button>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="aperçu" className="h-40 w-full object-cover rounded-xl" />
            )}
            <input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder="Nom ex: Veste cuir noir" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <input value={form.price_dzd} onChange={(e) => setForm({ ...form, price_dzd: e.target.value })} placeholder="Prix DA" type="number" className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
              <input value={form.old_price_dzd} onChange={(e) => setForm({ ...form, old_price_dzd: e.target.value })} placeholder="Ancien prix (promo)" type="number" className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            </div>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Tailles: M,L,XL" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Couleurs: Noir,Blanc" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.image} onChange={(e) => { setForm({ ...form, image: e.target.value }); setPreview(e.target.value); }} placeholder="...ou colle une URL photo" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <input value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} placeholder="Lien TikTok vidéo" className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm" />
            <button onClick={addProduct} className="w-full rounded-full bg-red-600 text-white font-black py-2 text-sm">Ajouter modèle</button>
            <p className="text-xs text-neutral-500">Astuce TikTok: copie le lien de chaque vidéo @musslocker dans “Lien TikTok” du produit.</p>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {products.map((p) => {
              const isCustom = custom.some((c) => c.id === p.id);
              const isEditing = editingId === p.id;
              return (
                <div key={p.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                  <div className="flex gap-3 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="h-14 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-bold">{p.name_fr} {!isCustom && <span className="text-[10px] text-neutral-500 font-normal">(démo)</span>}</p>
                      <p className="text-xs text-neutral-400">{p.category} • {p.price_dzd} DA • stock {p.stock} {!p.active && "• caché"}</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <input value={edit.price_dzd} onChange={(e) => setEdit({ ...edit, price_dzd: e.target.value })} type="number" placeholder="Prix" className="rounded-lg bg-neutral-900 border border-neutral-700 px-2 py-1 text-xs" />
                      <input value={edit.old_price_dzd} onChange={(e) => setEdit({ ...edit, old_price_dzd: e.target.value })} type="number" placeholder="Promo" className="rounded-lg bg-neutral-900 border border-neutral-700 px-2 py-1 text-xs" />
                      <input value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.value })} type="number" placeholder="Stock" className="rounded-lg bg-neutral-900 border border-neutral-700 px-2 py-1 text-xs" />
                      <button onClick={() => saveEdit(p.id)} className="col-span-2 rounded-full bg-red-600 text-white text-xs font-bold py-1">Sauver</button>
                      <button onClick={() => setEditingId(null)} className="rounded-full border border-neutral-700 text-xs py-1">Annuler</button>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button onClick={() => startEdit(p)} className="text-xs border border-neutral-600 rounded-full px-3 py-1">Modifier</button>
                      {isCustom && (
                        <button onClick={() => toggleActive(p.id)} className="text-xs border border-neutral-600 rounded-full px-3 py-1">
                          {p.active ? "Cacher" : "Afficher"}
                        </button>
                      )}
                      <button onClick={() => duplicateProduct(p.id)} className="text-xs border border-neutral-600 rounded-full px-3 py-1">Dupliquer</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-xs border border-red-500/50 text-red-400 rounded-full px-3 py-1">Suppr</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

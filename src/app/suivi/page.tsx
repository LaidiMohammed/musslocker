"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";

export default function SuiviPage() {
  const { t, lang } = useLang();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState("");

  async function track() {
    setErr(""); setResult(null);
    const c = code.trim().toUpperCase();
    if (c.length !== 8) { setErr(lang === "fr" ? "Code = 8 caractères" : "الكود 8 حروف"); return; }
    // 1) local history
    try {
      const hist = JSON.parse(localStorage.getItem("muss-orders") || "[]") as Record<string, unknown>[];
      const found = hist.find((o) => (o.order_code as string) === c);
      if (found) { setResult(found); return; }
    } catch { /* ignore */ }
    // 2) server/supabase
    try {
      const r = await fetch(`/api/orders?code=${c}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Introuvable");
      setResult(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Introuvable");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-black text-center">{t.track_title}</h1>
      <div className="mt-5 flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="Ex: K7X2M9PQ"
          className="flex-1 rounded-full bg-neutral-900 border border-neutral-700 px-5 py-3 font-mono text-center text-xl tracking-widest uppercase outline-none focus:border-red-600" />
        <button onClick={track} className="rounded-full bg-red-600 text-white font-black px-6">{t.track_btn}</button>
      </div>
      {err && <p className="mt-3 text-center text-red-400 text-sm font-bold">{err}</p>}
      {result && (
        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-6 text-sm space-y-1">
          <p className="font-mono text-2xl font-black text-red-500">{String(result.order_code)}</p>
          <p><b>Nom:</b> {String(result.first_name)} {String(result.last_name)}</p>
          <p><b>Wilaya:</b> {String(result.wilaya)} — {String(result.commune)}</p>
          <p><b>Total:</b> {Number(result.total_dzd).toLocaleString("fr-DZ")} DA</p>
          <p><b>Statut:</b> <span className="rounded-full bg-red-600/15 text-red-400 px-3 py-1 font-bold">{String(result.status ?? "nouvelle")}</span></p>
          {typeof result.qr_data_url === "string" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.qr_data_url} alt="QR" className="mx-auto mt-3 h-48 w-48 rounded-2xl bg-white p-2" />
          )}
        </div>
      )}
    </div>
  );
}

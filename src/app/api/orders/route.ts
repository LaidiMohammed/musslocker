import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase/server";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = customAlphabet(alphabet, 8);

type Item = { productId: string; product_name: string; size: string; color: string; qty: number; unit_price: number };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { first_name, last_name, phone, wilaya, commune, address, notes, items } = body as {
    first_name: string; last_name: string; phone: string; wilaya: string;
    commune: string; address: string; notes?: string; items: Item[];
  };

  if (!first_name || !last_name || !phone || !wilaya || !commune || !address || !items?.length) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (!/^(05|06|07)\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
    return NextResponse.json({ error: "Téléphone DZ invalide (05/06/07 + 10 chiffres)" }, { status: 400 });
  }

  const total_dzd = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const order_code = genCode();
  const qr_payload = {
    code: order_code,
    name: `${first_name} ${last_name}`,
    phone,
    wilaya,
    commune,
    total_dzd,
    items: items.map((i) => `${i.product_name} ${i.size}/${i.color} x${i.qty}`),
    date: new Date().toISOString(),
    shop: "MUSSLOCKER",
  };
  const qr_data_url = await QRCode.toDataURL(JSON.stringify(qr_payload), { width: 400, margin: 1 });

  const sb = supabaseServer();
  if (sb) {
    try {
      const { data: order, error } = await sb
        .from("orders")
        .insert([{ order_code, first_name, last_name, phone, wilaya, commune, address, notes: notes ?? "", total_dzd, qr_payload }])
        .select()
        .single();
      if (error) throw error;
      await sb.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: null,
          product_name: i.product_name,
          size: i.size,
          color: i.color,
          qty: i.qty,
          unit_price: i.unit_price,
        }))
      );
      // save locally too for offline admin fallback
    } catch (e) {
      console.error("supabase order failed, fallback local", e);
    }
  }

  // Always persist a local copy so suivi + admin work even without Supabase
  const record = { order_code, first_name, last_name, phone, wilaya, commune, address, notes, total_dzd, qr_payload, qr_data_url, items, status: "nouvelle", created_at: new Date().toISOString() };

  return NextResponse.json(record);
}

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code")?.toUpperCase() ?? "";
  if (!code) return NextResponse.json({ error: "code requis" }, { status: 400 });
  const sb = supabaseServer();
  if (sb) {
    const { data } = await sb.from("orders").select("*").eq("order_code", code).single();
    if (data) {
      const qr_data_url = await QRCode.toDataURL(JSON.stringify(data.qr_payload), { width: 400, margin: 1 });
      return NextResponse.json({ ...data, qr_data_url });
    }
  }
  return NextResponse.json({ error: "Introuvable en base — vérifie dans l'historique local", code }, { status: 404 });
}

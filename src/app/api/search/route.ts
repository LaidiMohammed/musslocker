import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { DEMO_PRODUCTS } from "@/lib/products";
import { searchProducts } from "@/lib/search";

// Good search: Supabase full-text + trigram when configured, else Fuse over demo.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "Tous";
  const sb = supabaseServer();
  if (sb) {
    try {
      let query = sb.from("products").select("*").eq("active", true).limit(60);
      if (cat && cat !== "Tous") query = query.eq("category", cat);
      const clean = q.trim();
      if (clean) {
        // full-text fallback to ilike across FR/AR for simplicity + reliability
        query = query.or(
          `name_fr.ilike.%${clean}%,name_ar.ilike.%${clean}%,desc_fr.ilike.%${clean}%,category.ilike.%${clean}%,slug.ilike.%${clean}%`
        );
      }
      const { data, error } = await query;
      if (!error && data) return NextResponse.json({ source: "supabase", results: data });
    } catch {
      // fall through to demo
    }
  }
  const results = searchProducts(DEMO_PRODUCTS, q, cat);
  return NextResponse.json({ source: "demo", results });
}

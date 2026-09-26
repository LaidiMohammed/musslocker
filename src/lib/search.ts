import Fuse from "fuse.js";
import { Product } from "./products";

export function searchProducts(products: Product[], query: string, category = "Tous"): Product[] {
  let list = products.filter((p) => p.active);
  if (category && category !== "Tous") list = list.filter((p) => p.category === category);
  const q = query.trim();
  if (!q) return list;
  const fuse = new Fuse(list, {
    keys: [
      { name: "name_fr", weight: 0.4 },
      { name: "name_ar", weight: 0.4 },
      { name: "desc_fr", weight: 0.1 },
      { name: "category", weight: 0.1 },
      { name: "slug", weight: 0.05 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });
  return fuse.search(q).map((r) => r.item);
}

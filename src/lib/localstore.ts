import { Product } from "./products";

export type OrderRow = {
  order_code: string; first_name: string; last_name: string; phone: string;
  wilaya: string; commune: string; address: string; total_dzd: number;
  status: string; created_at: string; qr_data_url?: string;
  items?: { product_name: string; size: string; color: string; qty: number; unit_price: number }[];
};

const P_KEY = "muss-custom-products";
const O_KEY = "muss-orders";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  return safeParse<Product[]>(localStorage.getItem(P_KEY), []);
}

export function saveCustomProducts(list: Product[]) {
  try {
    localStorage.setItem(P_KEY, JSON.stringify(list));
  } catch {
    alert("Stockage local plein — image trop lourde ?");
  }
}

export function loadLocalOrders(): OrderRow[] {
  if (typeof window === "undefined") return [];
  return safeParse<OrderRow[]>(localStorage.getItem(O_KEY), []);
}

export function saveLocalOrders(list: OrderRow[]) {
  localStorage.setItem(O_KEY, JSON.stringify(list));
}

// Demo orders so the admin kanban can be previewed before real sales.
export function seedDemoOrders(): OrderRow[] {
  const now = Date.now();
  const day = 86400000;
  const demo: OrderRow[] = [
    {
      order_code: "K7X2M9PQ", first_name: "Amine", last_name: "Benali", phone: "0550123456",
      wilaya: "16-Alger", commune: "Bab Ezzouar", address: "Rue des frères, Bt 4",
      total_dzd: 13400, status: "nouvelle", created_at: new Date(now - 2 * 3600000).toISOString(),
      items: [
        { product_name: "Veste en Cuir Noir", size: "L", color: "Noir", qty: 1, unit_price: 8900 },
        { product_name: "Jean Slim Bleu", size: "32", color: "Bleu", qty: 1, unit_price: 4500 },
      ],
    },
    {
      order_code: "R4T8WZ2D", first_name: "Yasmine", last_name: "Kaci", phone: "0661234567",
      wilaya: "31-Oran", commune: "Bir El Djir", address: "Av. de l'ALN",
      total_dzd: 5200, status: "confirmee", created_at: new Date(now - day).toISOString(),
      items: [{ product_name: "Robe d'Été Rouge", size: "M", color: "Rouge", qty: 1, unit_price: 5200 }],
    },
    {
      order_code: "M9Q2X7KL", first_name: "Riyad", last_name: "Meziane", phone: "0770987654",
      wilaya: "19-Sétif", commune: "El Eulma", address: "Centre ville",
      total_dzd: 8900, status: "expediee", created_at: new Date(now - 2 * day).toISOString(),
      items: [
        { product_name: "T-Shirt Blanc Essentiel", size: "XL", color: "Blanc", qty: 2, unit_price: 1800 },
        { product_name: "Chemise Homme Blanche", size: "L", color: "Blanc", qty: 1, unit_price: 3500 },
        { product_name: "Jean Slim Bleu", size: "33", color: "Noir", qty: 1, unit_price: 4500 },
      ],
    },
    {
      order_code: "D2KL8PQR", first_name: "Sara", last_name: "Boumediene", phone: "0555777888",
      wilaya: "25-Constantine", commune: "Ali Mendjeli", address: "UV 12, Bt 8",
      total_dzd: 4200, status: "livree", created_at: new Date(now - 4 * day).toISOString(),
      items: [{ product_name: "Hoodie Noir Street", size: "M", color: "Noir", qty: 1, unit_price: 4200 }],
    },
    {
      order_code: "Z8XD4TMN", first_name: "Walid", last_name: "Cherif", phone: "0666444333",
      wilaya: "30-Ouargla", commune: "Rouissat", address: "Route de Ghardaïa",
      total_dzd: 7500, status: "nouvelle", created_at: new Date(now - 5 * 3600000).toISOString(),
      items: [{ product_name: "Veste Homme Casual", size: "XL", color: "Kaki", qty: 1, unit_price: 7500 }],
    },
  ];
  const existing = loadLocalOrders();
  const codes = new Set(existing.map((o) => o.order_code));
  const merged = [...existing];
  for (const d of demo) if (!codes.has(d.order_code)) merged.unshift(d);
  saveLocalOrders(merged);
  return merged;
}

// Resize a device photo to max 900px + JPEG so it fits in localStorage / uploads fast.
export function fileToDataUrl(file: File, maxSize = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture image impossible"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

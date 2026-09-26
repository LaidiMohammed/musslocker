export const TIKTOK_URL =
  process.env.NEXT_PUBLIC_TIKTOK_URL ||
  "https://www.tiktok.com/@musslocker?is_from_webapp=1&sender_device=pc";

export type Product = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  desc_fr: string;
  desc_ar: string;
  price_dzd: number;
  old_price_dzd?: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  tiktok_url: string;
  active: boolean;
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

// Boutique vêtements (style Wix Fashion & Clothing) — rouge & noir.
// Remplace photos/prix par tes modèles TikTok @musslocker via le panel admin.
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-1",
    slug: "veste-cuir-noir",
    name_fr: "Veste en Cuir Noir",
    name_ar: "سترة جلد سوداء",
    desc_fr: "Veste en cuir esprit motard, coupe cintrée. Vue sur TikTok.",
    desc_ar: "سترة جلدية ستايل دراجة بقصّة ضيقة. شفتوها على تيك توك.",
    price_dzd: 8900,
    old_price_dzd: 11000,
    category: "Vestes",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Noir"],
    stock: 25,
    images: [u("photo-1551028719-00167b16eac5")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-2",
    slug: "jean-slim-bleu",
    name_fr: "Jean Slim Bleu",
    name_ar: "جينز سليم أزرق",
    desc_fr: "Jean stretch confort, coupe slim moderne.",
    desc_ar: "جينز مطاطي مريح بقصّة سليم عصرية.",
    price_dzd: 4500,
    old_price_dzd: null,
    category: "Jeans",
    sizes: ["30", "31", "32", "33", "34", "36"],
    colors: ["Bleu", "Noir", "Gris"],
    stock: 60,
    images: [u("photo-1542272604-787c3835535d")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-3",
    slug: "tshirt-blanc-essentiel",
    name_fr: "T-Shirt Blanc Essentiel",
    name_ar: "تيشيرت أبيض أساسي",
    desc_fr: "Coton épais, col rond, l'indispensable du dressing.",
    desc_ar: "قطن سميك بياقة دائرية، أساسي في كل خزانة.",
    price_dzd: 1800,
    old_price_dzd: 2400,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blanc", "Noir", "Rouge"],
    stock: 150,
    images: [u("photo-1521572163474-6864f9cf17ab")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-4",
    slug: "robe-ete-rouge",
    name_fr: "Robe d'Été Rouge",
    name_ar: "فستان صيفي أحمر",
    desc_fr: "Robe légère fluide, parfaite pour l'été.",
    desc_ar: "فستان خفيف انسيابي مثالي للصيف.",
    price_dzd: 5200,
    old_price_dzd: null,
    category: "Robes",
    sizes: ["S", "M", "L"],
    colors: ["Rouge", "Noir", "Fleuri"],
    stock: 30,
    images: [u("photo-1595777457583-95e059d581b8")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-5",
    slug: "veste-homme-casual",
    name_fr: "Veste Homme Casual",
    name_ar: "سترة رجالية كاجوال",
    desc_fr: "Veste casual homme, idéale mi-saison.",
    desc_ar: "سترة رجالية كاجوال مثالية بين الفصول.",
    price_dzd: 7500,
    old_price_dzd: 8900,
    category: "Vestes",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Kaki", "Noir"],
    stock: 20,
    images: [u("photo-1591047139829-d91aecb6caea")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-6",
    slug: "chemise-homme-blanche",
    name_fr: "Chemise Homme Blanche",
    name_ar: "قميص رجالي أبيض",
    desc_fr: "Chemise classique, coton premium, coupe droite.",
    desc_ar: "قميص كلاسيكي بقطن فاخر وقصّة مستقيمة.",
    price_dzd: 3500,
    old_price_dzd: null,
    category: "Chemises",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Blanc", "Bleu", "Noir"],
    stock: 70,
    images: [u("photo-1602810318383-e386cc2a3ccf")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-7",
    slug: "manteau-femme-elegant",
    name_fr: "Manteau Femme Élégant",
    name_ar: "معطف نسائي أنيق",
    desc_fr: "Manteau long élégant pour l'hiver.",
    desc_ar: "معطف طويل أنيق لفصل الشتاء.",
    price_dzd: 9800,
    old_price_dzd: 12000,
    category: "Vestes",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Noir", "Rouge"],
    stock: 15,
    images: [u("photo-1445205170230-053b83016050")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
  {
    id: "demo-8",
    slug: "hoodie-noir-street",
    name_fr: "Hoodie Noir Street",
    name_ar: "هودي أسود ستريت",
    desc_fr: "Hoodie molletonné, capuche doublée, style street.",
    desc_ar: "هودي مبطن بقبعة، ستايل ستريت.",
    price_dzd: 4200,
    old_price_dzd: null,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Rouge", "Gris"],
    stock: 55,
    images: [u("photo-1556821840-3a63f95609a7")],
    tiktok_url: TIKTOK_URL,
    active: true,
  },
];

export const CATEGORIES = [
  "Tous",
  "Vestes",
  "Jeans",
  "T-Shirts",
  "Chemises",
  "Robes",
  "Hoodies",
];

export const LOGO_IMAGE = "/muss.jpg";

export const HERO_IMAGE = "/muss.jpg";

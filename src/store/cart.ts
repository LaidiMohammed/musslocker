import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const found = s.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          );
          if (found >= 0) {
            const items = [...s.items];
            items[found] = { ...items[found], qty: items[found].qty + item.qty };
            return { items };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productId === productId && i.size === size && i.color === color)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "muss-cart" }
  )
);

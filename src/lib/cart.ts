import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number; // cents
  preview_image: string | null;
  standard_price?: number | null;
  launch_price?: number | null;
  payment_link?: string | null;
  discount_payment_link?: string | null;
};

export const formatZARDetailed = (cents: number) =>
  cents === 0 ? "FREE" : `R${(cents / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: () => number;
  has: (id: string) => boolean;
  totalCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => (s.items.some((i) => i.id === item.id) ? s : { items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
      has: (id) => get().items.some((i) => i.id === id),
      totalCount: () => get().items.length,
    }),
    { name: "capacitiq_cart" }
  )
);

export const formatZAR = (cents: number) => `R${Math.round(cents / 100).toLocaleString("en-ZA")}`;

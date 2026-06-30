import { create } from "zustand";

export interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  photo_url: string | null;
  discount: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  paymentMethod: "cash" | "qris" | "transfer" | null;
  cashReceived: number;
  isCheckingOut: boolean;

  addItem: (item: Omit<CartItem, "quantity" | "id">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  setPaymentMethod: (m: CartStore["paymentMethod"]) => void;
  setCashReceived: (n: number) => void;
  setIsCheckingOut: (v: boolean) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  paymentMethod: null,
  cashReceived: 0,
  isCheckingOut: false,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.menu_item_id === item.menu_item_id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menu_item_id === item.menu_item_id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { ...item, id: item.menu_item_id, quantity: 1 }],
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  setQuantity: (id, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.id !== id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: qty } : i,
        ),
      };
    }),

  clearCart: () =>
    set({
      items: [],
      paymentMethod: null,
      cashReceived: 0,
      isCheckingOut: false,
    }),

  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setCashReceived: (n) => set({ cashReceived: n }),
  setIsCheckingOut: (v) => set({ isCheckingOut: v }),
}));

export const TAX_RATE = 0.11;
export const ADMIN_FEE_RATE = 0;

export function getItemPrice(item: CartItem): number {
  return item.discount > 0
    ? item.price * (1 - item.discount / 100)
    : item.price;
}

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + getItemPrice(i) * i.quantity, 0);
}

export function getTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}

export function getAdminFee(subtotal: number): number {
  return Math.round(subtotal * ADMIN_FEE_RATE);
}

export function getTotal(subtotal: number): number {
  return subtotal + getTax(subtotal) + getAdminFee(subtotal);
}

import create from 'zustand';

interface CartItem {
  id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  name: string;
  quantity: number;
  price: number;
  sku: string;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartData: (cartId: string, items: CartItem[]) => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  cartId: null,
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.variant_id === item.variant_id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.variant_id === item.variant_id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    })),
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [], cartId: null }),
  setCartData: (cartId, items) => set({ cartId, items }),
  getTotalPrice: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));

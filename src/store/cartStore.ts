import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Variant } from '../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: Variant, quantity?: number) => void;
  removeItem: (productId: string, variantSku: string) => void;
  updateQuantity: (productId: string, variantSku: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.variant.sku === variant.sku
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.variant.sku === variant.sku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { product, variant, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantSku) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variant.sku === variantSku)
          ),
        }));
      },

      updateQuantity: (productId, variantSku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantSku);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variant.sku === variantSku
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
      closeDrawer: () => set({ isOpen: false }),
      openDrawer: () => set({ isOpen: true }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
    }),
    {
      name: 'luxescent-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

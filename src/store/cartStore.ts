import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, Variant } from "../types";
import { hasSupabaseConfig, supabase } from "../lib/supabase";

let cartSyncChain: Promise<void> = Promise.resolve();

function mergeCartItems(primary: CartItem[], secondary: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of [...primary, ...secondary]) {
    const key = `${item.product.id}:${item.variant.sku}`;
    const existing = merged.get(key);

    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      merged.set(key, item);
    }
  }

  return [...merged.values()];
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: Variant, quantity?: number) => void;
  removeItem: (productId: string, variantSku: string) => void;
  updateQuantity: (
    productId: string,
    variantSku: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  syncToSupabase: (userId: string) => Promise<void>;
  hydrate: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        if (!variant) return;
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.variant.sku === variant.sku,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.variant.sku === variant.sku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { product, variant, quantity }],
          };
        });
      },

      removeItem: (productId, variantSku) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.product.id === productId && i.variant.sku === variantSku),
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
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
      closeDrawer: () => set({ isOpen: false }),
      openDrawer: () => set({ isOpen: true }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.variant?.price ?? 0) * i.quantity,
          0,
        ),

      syncToSupabase: async (userId) => {
        if (!hasSupabaseConfig) return;

        cartSyncChain = cartSyncChain.then(async () => {
          const { items } = get();

          // Delete all old cart items for this user first so the table mirrors local state.
          await supabase.from("cart_items").delete().eq("user_id", userId);

          if (!items.length) return;

          const rows = items.map((item) => ({
            user_id: userId,
            product_id: item.product.id,
            variant_sku: item.variant.sku,
            quantity: item.quantity,
            item_data: item,
            updated_at: new Date().toISOString(),
          }));

          await supabase.from("cart_items").insert(rows);
        });

        await cartSyncChain;
      },

      hydrate: async (userId) => {
        if (!hasSupabaseConfig) return;
        const localItems = get().items;
        const { data } = await supabase
          .from("cart_items")
          .select("item_data, quantity")
          .eq("user_id", userId);
        const serverItems: CartItem[] = (data || []).map((row) => ({
          ...(row.item_data as CartItem),
          quantity: row.quantity as number,
        }));

        if (!serverItems.length) {
          if (localItems.length) {
            set({ items: [...localItems] });
          }
          return;
        }

        const mergedItems = mergeCartItems(serverItems, localItems);
        set({ items: mergedItems });
      },
    }),
    {
      name: "raven-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items.filter((i) => i?.product && i?.variant);
        }
      },
    },
  ),
);

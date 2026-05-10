import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, Variant } from "../types";
import { hasSupabaseConfig, supabase } from "../lib/supabase";

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
        const { items } = get();

        // Delete all old cart items for this user first
        await supabase.from("cart_items").delete().eq("user_id", userId);

        // If no items, we're done (cart is cleared)
        if (!items.length) return;

        // Wait a moment for delete to complete before inserting
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Insert current cart items
        const rows = items.map((item) => ({
          user_id: userId,
          product_id: item.product.id,
          variant_sku: item.variant.sku,
          quantity: item.quantity,
          item_data: item,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from("cart_items").insert(rows);

        // If we still get a conflict, try updating instead
        if (error?.code === "23505") {
          for (const row of rows) {
            await supabase
              .from("cart_items")
              .update(row)
              .eq("user_id", userId)
              .eq("product_id", row.product_id)
              .eq("variant_sku", row.variant_sku);
          }
        }
      },

      hydrate: async (userId) => {
        if (!hasSupabaseConfig) return;
        const { data } = await supabase
          .from("cart_items")
          .select("item_data, quantity")
          .eq("user_id", userId);
        if (!data?.length) return;
        const serverItems: CartItem[] = data.map((row) => ({
          ...(row.item_data as CartItem),
          quantity: row.quantity as number,
        }));
        // Merge: keep any local items whose variant isn't already on the server
        const serverSkus = new Set(serverItems.map((i) => i.variant.sku));
        const extraLocal = get().items.filter(
          (i) => !serverSkus.has(i.variant.sku),
        );
        set({ items: [...serverItems, ...extraLocal] });
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

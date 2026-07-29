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
  cartUserId: string | null;
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
      cartUserId: null,

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

          // 1. Get or create cart for user
          let { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!cart) {
            const { data: newCart, error: createErr } = await supabase
              .from("carts")
              .insert({ user_id: userId })
              .select("id")
              .single();

            if (createErr || !newCart) return;
            cart = newCart;
          }

          // 2. Delete all existing items for this cart
          await supabase.from("cart_items").delete().eq("cart_id", cart.id);

          if (!items.length) return;

          // 3. Insert normalized cart items (referencing product_id and variant_id)
          const rows = items
            .filter((i) => i.product?.id && i.variant?.id)
            .map((item) => ({
              cart_id: cart.id,
              product_id: item.product.id,
              variant_id: item.variant.id,
              quantity: item.quantity,
            }));

          if (rows.length) {
            await supabase.from("cart_items").insert(rows);
          }
        });

        await cartSyncChain;
      },

      hydrate: async (userId) => {
        if (!hasSupabaseConfig) return;

        // Fetch user's cart and joined products + variants
        const { data: cart } = await supabase
          .from("carts")
          .select(`
            id,
            cart_items (
              quantity,
              product:products (*),
              variant:product_variants (*)
            )
          `)
          .eq("user_id", userId)
          .maybeSingle();

        const rawItems = (cart as unknown as {
          cart_items: {
            quantity: number;
            product: Product;
            variant: Variant;
          }[];
        })?.cart_items || [];

        const serverItems: CartItem[] = rawItems
          .filter((row) => row.product && row.variant)
          .map((row) => ({
            product: row.product,
            variant: row.variant,
            quantity: row.quantity,
          }));

        const localItems = get().items;
        const localCartUserId = get().cartUserId;

        if (localCartUserId === userId) {
          // Local cart is already loaded for this user. Trust the server state.
          set({ items: serverItems, cartUserId: userId });
          return;
        }

        if (localCartUserId === null) {
          // Guest cart: merge with server items
          const mergedItems = mergeCartItems(serverItems, localItems);
          set({ items: mergedItems, cartUserId: userId });

          // Sync merged cart back to Supabase
          await get().syncToSupabase(userId);
          return;
        }

        // Fallback: overwrite with server items
        set({ items: serverItems, cartUserId: userId });
      },
    }),
    {
      name: "raven-cart",
      partialize: (state) => ({ items: state.items, cartUserId: state.cartUserId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items.filter((i) => i?.product && i?.variant);
        }
      },
    },
  ),
);

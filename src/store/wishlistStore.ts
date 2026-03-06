import { create } from "zustand";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "raven_wishlist";

function loadLocalWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface WishlistStore {
  ids: string[];
  isLoading: boolean;

  // Call after auth state resolves
  hydrate: (userId: string | null) => Promise<void>;
  // Merge local → Supabase (called right after login)
  syncToSupabase: (userId: string) => Promise<void>;

  toggle: (productId: string, userId: string | null) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: loadLocalWishlist(),
  isLoading: false,

  hydrate: async (userId) => {
    if (!userId) {
      set({ ids: loadLocalWishlist() });
      return;
    }
    set({ isLoading: true });
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);
    const serverIds = (data ?? []).map(
      (r: { product_id: string }) => r.product_id,
    );
    // Merge: local items not yet on server will be synced separately
    const merged = [...new Set([...serverIds, ...loadLocalWishlist()])];
    set({ ids: merged, isLoading: false });
  },

  syncToSupabase: async (userId) => {
    const local = loadLocalWishlist();
    if (!local.length) return;
    const rows = local.map((product_id) => ({ user_id: userId, product_id }));
    await supabase
      .from("wishlists")
      .upsert(rows, { onConflict: "user_id,product_id" });
    // Clear local cache now that data lives in Supabase
    localStorage.removeItem(STORAGE_KEY);
  },

  toggle: async (productId, userId) => {
    const { ids } = get();
    const alreadyIn = ids.includes(productId);
    const next = alreadyIn
      ? ids.filter((id) => id !== productId)
      : [...ids, productId];
    set({ ids: next });

    if (userId) {
      if (alreadyIn) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: userId, product_id: productId });
      }
    } else {
      saveLocalWishlist(next);
    }
  },

  isWishlisted: (productId) => get().ids.includes(productId),

  clear: () => {
    set({ ids: [] });
    localStorage.removeItem(STORAGE_KEY);
  },
}));

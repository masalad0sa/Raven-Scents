import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "../lib/supabase";
import { useCartStore } from "./cartStore";
import { useWishlistStore } from "./wishlistStore";

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: () => Promise<() => void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  initialized: false,

  initialize: async () => {
    if (!hasSupabaseConfig) {
      set({ user: null, session: null, initialized: true });
      return () => void 0;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, session, initialized: true });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        set({ user: null, session: null });
        useCartStore.getState().clearCart();
        useCartStore.setState({ cartUserId: null });
        useWishlistStore.getState().clear();
      } else if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        set({ user: session?.user ?? null, session });
      }
    });

    // Return unsubscribe so App.tsx can clean up on unmount
    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ isLoading: false });
    return { error: error?.message ?? null };
  },

  signup: async (email, password, fullName) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    set({ isLoading: false });
    return { error: error?.message ?? null };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

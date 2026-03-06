import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, session, initialized: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });
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

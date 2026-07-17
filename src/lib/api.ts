import { hasSupabaseConfig, supabase } from "./supabase";
import { filterLocalProducts, localProducts } from "./localProducts";
import type {
  Product,
  Variant,
  AuthResponse,
  Order,
  OrderPayload,
  CouponResponse,
  AdminOrderFilters,
  AdminOrderDetail,
  PaginatedOrders,
  OrderStats,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const IS_LOCALHOST = API_BASE.includes("localhost");
const SKIP_BACKEND = IS_LOCALHOST && !import.meta.env.DEV;

// ── Auth Token Storage ──────────────────────────────
export async function getAccessToken() {
  const token = localStorage.getItem("raven_access_token");
  if (token) return token;

  // Fallback to Supabase session
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("raven_access_token", access);
  localStorage.setItem("raven_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("raven_access_token");
  localStorage.removeItem("raven_refresh_token");
}

// ── Base Fetch (for auth/orders/coupons routes) ─────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API request failed");
  }

  return res.json();
}

// ── Products ────────────────────────────────────────
export interface ProductFilters {
  search?: string;
  gender?: string;
  scent_family?: string;
  max_price?: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

// Map snake_case from Supabase to frontend camelCase expectations
function mapProduct(p: Record<string, unknown>): Product {
  if (!p) return p as unknown as Product;
  return {
    ...p,
    shortDescription: (p.short_desc || p.shortDescription) as string,
    compareAtPrice: (p.compare_price || p.compareAtPrice) as number | undefined,
    scentFamily: (p.scent_family || p.scentFamily) as string,
    reviewCount: (p.review_count || p.reviewCount || 0) as number,
    isFeatured: (p.is_featured || p.isFeatured || false) as boolean,
    isBestseller: (p.is_bestseller || p.isBestseller || false) as boolean,
    isNew: (p.is_new || p.isNew || false) as boolean,
    notes: {
      top: (p.notes_top ||
        (p.notes as Record<string, unknown>)?.top ||
        []) as string[],
      middle: (p.notes_middle ||
        (p.notes as Record<string, unknown>)?.middle ||
        []) as string[],
      base: (p.notes_base ||
        (p.notes as Record<string, unknown>)?.base ||
        []) as string[],
    },
    variants: (
      (p.product_variants || p.variants || []) as Record<string, unknown>[]
    )
      .map(
        (v) =>
          ({
            ...v,
            id: v.id,
            productId: v.product_id || v.productId,
          }) as unknown as Variant,
      )
      .sort((a, b) => a.size - b.size),
  } as Product;
}

// ── Supabase Direct Queries (fallback when backend unavailable) ────
async function getProductsFromSupabase(filters: ProductFilters = {}) {
  if (!hasSupabaseConfig) throw new Error("Supabase not configured");

  let query = supabase.from("products").select("*, product_variants(*)");

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }
  if (filters.scent_family) {
    query = query.eq("scent_family", filters.scent_family);
  }
  if (filters.max_price) {
    query = query.lte("price", filters.max_price);
  }
  if (filters.is_new) {
    query = query.eq("is_new", true);
  }
  if (filters.is_bestseller) {
    query = query.eq("is_bestseller", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getProductFromSupabaseBySlug(slug: string) {
  if (!hasSupabaseConfig) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

async function getFeaturedFromSupabase() {
  if (!hasSupabaseConfig) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_featured", true)
    .limit(6);

  if (error) throw error;
  return data || [];
}

async function getBestsellersFromSupabase() {
  if (!hasSupabaseConfig) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_bestseller", true)
    .limit(8);

  if (error) throw error;
  return data || [];
}

export const productsApi = {
  getAll: async (filters: ProductFilters = {}) => {
    // Try backend API first (only in development)
    if (!SKIP_BACKEND) {
      try {
        const query = new URLSearchParams();
        if (filters.search) query.append("search", filters.search);
        if (filters.gender) query.append("gender", filters.gender);
        if (filters.scent_family)
          query.append("scent_family", filters.scent_family);
        if (filters.max_price)
          query.append("max_price", filters.max_price.toString());
        if (filters.is_new) query.append("is_new", "true");
        if (filters.is_bestseller) query.append("is_bestseller", "true");
        if (filters.sort) query.append("sort", filters.sort);
        if (filters.page) query.append("page", filters.page.toString());
        if (filters.limit) query.append("limit", filters.limit.toString());

        const res = await fetch(`${API_BASE}/products?${query}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.products?.length) {
            return {
              products: data.products.map(mapProduct),
              total: data.total || data.products.length,
            };
          }
        }
      } catch {
        // Backend unavailable, try Supabase next
      }
    }

    // Try Supabase directly
    try {
      const products = await getProductsFromSupabase(filters);
      if (products.length > 0) {
        return {
          products: products.map(mapProduct),
          total: products.length,
        };
      }
    } catch {
      // Supabase unavailable, fall through to local products
    }

    // Fallback to local products
    const products = filterLocalProducts(filters);
    return { products, total: products.length };
  },

  getBySlug: async (slug: string) => {
    // Try backend API first (only in development)
    if (!SKIP_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/products/${slug}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          return mapProduct(data);
        }
      } catch {
        // Backend unavailable, try Supabase next
      }
    }

    // Try Supabase directly
    try {
      const product = await getProductFromSupabaseBySlug(slug);
      return mapProduct(product);
    } catch {
      // Supabase unavailable, fall through to local products
    }

    // Fallback to local products
    const product = localProducts.find((item) => item.slug === slug);
    if (!product) throw new Error("Product not found");
    return product;
  },

  getFeatured: async () => {
    // Try backend API first (only in development)
    if (!SKIP_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/products/featured`, {
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map(mapProduct);
          }
        }
      } catch {
        // Backend unavailable, try Supabase next
      }
    }

    // Try Supabase directly
    try {
      const products = await getFeaturedFromSupabase();
      if (products.length > 0) {
        return products.map(mapProduct);
      }
    } catch {
      // Supabase unavailable, fall through to local products
    }

    // Fallback to local products
    return localProducts.filter((product) => product.isFeatured).slice(0, 6);
  },

  getBestsellers: async () => {
    // Try backend API first (only in development)
    if (!SKIP_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/products/bestsellers`, {
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map(mapProduct);
          }
        }
      } catch {
        // Backend unavailable, try Supabase next
      }
    }

    // Try Supabase directly
    try {
      const products = await getBestsellersFromSupabase();
      if (products.length > 0) {
        return products.map(mapProduct);
      }
    } catch {
      // Supabase unavailable, fall through to local products
    }

    // Fallback to local products
    return localProducts.filter((product) => product.isBestseller).slice(0, 8);
  },
};

// ── Auth ────────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string, full_name?: string) => {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });
    if (data.access_token) setTokens(data.access_token, data.refresh_token);
    return data;
  },
  login: async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) setTokens(data.access_token, data.refresh_token);
    return data;
  },
  logout: async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    clearTokens();
  },
};

// ── Orders ──────────────────────────────────────────
export const ordersApi = {
  create: (payload: OrderPayload) =>
    apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAll: () => apiFetch<Order[]>("/orders"),
  getById: (id: string) => apiFetch<Order>(`/orders/${id}`),
};

// ── Coupons ─────────────────────────────────────────
export const couponsApi = {
  validate: (code: string, cart_total: number) =>
    apiFetch<CouponResponse>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, cart_total }),
    }),
};

// ── Reviews ─────────────────────────────────────────────────
export const reviewsApi = {
  getByProduct: async (productId: string) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  submit: async (
    productId: string,
    rating: number,
    title: string,
    body: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in to submit a review");
    const { data, error } = await supabase
      .from("reviews")
      .insert({ product_id: productId, user_id: user.id, rating, title, body })
      .select("*, profiles(full_name)")
      .single();
    if (error) {
      if (error.code === "23505")
        throw new Error("You have already reviewed this product");
      throw error;
    }
    return data;
  },
};

// ── Admin Types ───────────────────────────────────────────────
export interface AdminProductPayload {
  name: string;
  brand: string;
  slug: string;
  short_desc: string;
  description: string;
  price: number;
  compare_price?: number | null;
  images: string[];
  category: string;
  gender: string;
  scent_family: string;
  concentration: string;
  sillage: string;
  longevity: string;
  tags: string[];
  notes_top: string[];
  notes_middle: string[];
  notes_base: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}

export interface AdminVariantPayload {
  size: number;
  unit: string;
  price: number;
  stock: number;
  sku: string;
}

// ── Admin API (direct Supabase — requires is_admin = true in profiles) ──
export const adminApi = {
  isAdmin: async (): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    return data?.is_admin === true;
  },

  getAllProducts: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  createProduct: async (
    product: AdminProductPayload,
    variants: AdminVariantPayload[],
  ) => {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    if (variants.length > 0) {
      const { error: ve } = await supabase
        .from("product_variants")
        .insert(variants.map((v) => ({ ...v, product_id: data.id })));
      if (ve) throw ve;
    }
    return data;
  },

  updateProduct: async (
    id: string,
    product: AdminProductPayload,
    variants: AdminVariantPayload[],
  ) => {
    const { error } = await supabase
      .from("products")
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    // Replace all variants atomically
    await supabase.from("product_variants").delete().eq("product_id", id);
    if (variants.length > 0) {
      const { error: ve } = await supabase
        .from("product_variants")
        .insert(variants.map((v) => ({ ...v, product_id: id })));
      if (ve) throw ve;
    }
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  uploadImage: async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  },
};

// ── Admin Orders API ────────────────────────────────────────
function toQuery(params: AdminOrderFilters): string {
  const q = new URLSearchParams();
  if (params.status) q.append("status", params.status);
  if (params.search) q.append("search", params.search);
  if (params.date_from) q.append("date_from", params.date_from);
  if (params.date_to) q.append("date_to", params.date_to);
  if (params.page) q.append("page", params.page.toString());
  if (params.limit) q.append("limit", params.limit.toString());
  if (params.sort) q.append("sort", params.sort);
  if (params.order) q.append("order", params.order);
  return q.toString();
}

export const adminOrdersApi = {
  getAll: (filters: AdminOrderFilters = {}) =>
    apiFetch<PaginatedOrders>(`/admin/orders?${toQuery(filters)}`),

  getById: (id: string) =>
    apiFetch<AdminOrderDetail>(`/admin/orders/${id}`),

  getStats: () =>
    apiFetch<OrderStats>("/admin/orders/stats"),

  updateStatus: (id: string, status: string) =>
    apiFetch<Order>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateNotes: (id: string, notes: string) =>
    apiFetch<Order>(`/admin/orders/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
};

// ── Payments API (Razorpay) ─────────────────────────────────
export interface CreatePaymentOrderPayload {
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
  }[];
  shipping_address: {
    full_name: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  coupon_code?: string | null;
  discount: number;
}

export interface CreatePaymentOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  order_id: string;
  status: string;
}

export const paymentsApi = {
  getKey: () => apiFetch<{ key_id: string }>("/payments/key"),

  createOrder: (payload: CreatePaymentOrderPayload) =>
    apiFetch<CreatePaymentOrderResponse>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verify: (payload: VerifyPaymentPayload) =>
    apiFetch<VerifyPaymentResponse>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

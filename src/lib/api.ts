const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Auth Token Storage ──────────────────────────────
export function getAccessToken() {
  return localStorage.getItem('luxescent_access_token');
}
export function setTokens(access: string, refresh: string) {
  localStorage.setItem('luxescent_access_token', access);
  localStorage.setItem('luxescent_refresh_token', refresh);
}
export function clearTokens() {
  localStorage.removeItem('luxescent_access_token');
  localStorage.removeItem('luxescent_refresh_token');
}

// ── Base Fetch ──────────────────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
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
function mapProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    shortDescription: p.short_desc || p.shortDescription,
    compareAtPrice: p.compare_price || p.compareAtPrice,
    scentFamily: p.scent_family || p.scentFamily,
    reviewCount: p.review_count || p.reviewCount || 0,
    isFeatured: p.is_featured || p.isFeatured || false,
    isBestseller: p.is_bestseller || p.isBestseller || false,
    isNew: p.is_new || p.isNew || false,
    notes: {
      top: p.notes_top || p.notes?.top || [],
      middle: p.notes_middle || p.notes?.middle || [],
      base: p.notes_base || p.notes?.base || []
    },
    variants: (p.product_variants || p.variants || []).map((v: any) => ({
      ...v,
      id: v.id,
      productId: v.product_id || v.productId,
    })).sort((a: any, b: any) => a.size - b.size),
  };
}

export const productsApi = {
  getAll: async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const data = await apiFetch<{ products: any[]; total: number }>(`/products?${params}`);
    return { ...data, products: data.products.map(mapProduct) };
  },
  getBySlug: async (slug: string) => {
    const data = await apiFetch<any>(`/products/${slug}`);
    return mapProduct(data);
  },
  getFeatured: async () => {
    const data = await apiFetch<any[]>('/products/featured');
    return data.map(mapProduct);
  },
  getBestsellers: async () => {
    const data = await apiFetch<any[]>('/products/bestsellers');
    return data.map(mapProduct);
  },
};

// ── Auth ────────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string, full_name?: string) => {
    const data = await apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    if (data.access_token) setTokens(data.access_token, data.refresh_token);
    return data;
  },
  login: async (email: string, password: string) => {
    const data = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) setTokens(data.access_token, data.refresh_token);
    return data;
  },
  logout: async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
  },
};

// ── Orders ──────────────────────────────────────────
export const ordersApi = {
  create: (payload: any) => apiFetch<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getAll: () => apiFetch<any[]>('/orders'),
  getById: (id: string) => apiFetch<any>(`/orders/${id}`),
};

// ── Coupons ─────────────────────────────────────────
export const couponsApi = {
  validate: (code: string, cart_total: number) =>
    apiFetch<any>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cart_total }),
    }),
};

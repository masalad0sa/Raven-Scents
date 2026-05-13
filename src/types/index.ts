export interface Product {
  id: string;
  name: string;
  brand: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category:
    | "eau-de-parfum"
    | "eau-de-toilette"
    | "parfum"
    | "cologne"
    | "body-mist"
    | "Solid Perfume"
    | "Perfume";
  gender: "masculine" | "feminine" | "unisex";
  scentFamily: string;
  tags: string[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  concentration: string;
  sillage: "light" | "moderate" | "heavy";
  longevity: string;
  variants: Variant[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
}

export interface Variant {
  id?: string;
  size: number;
  unit: string;
  price: number;
  stock: number;
  sku: string;
}

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

export interface Filters {
  category: string[];
  brand: string[];
  gender: string[];
  scentFamily: string[];
  priceMin: number;
  priceMax: number;
  search: string;
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  created_at: string;
  profiles?: { full_name: string | null };
}

export interface OrderItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
  unit_price: number;
  products?: Pick<Product, "name" | "images">;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  discount: number;
  coupon_code: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items?: OrderItem[];
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface OrderPayload {
  items: {
    product_id: string;
    variant_sku: string;
    quantity: number;
    unit_price: number;
  }[];
  shipping_address: ShippingAddress;
  discount: number;
  coupon_code: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; full_name?: string };
}

export interface CouponResponse {
  valid: boolean;
  discount_pct: number;
}

// ── Admin Order Types ──────────────────────────────
export interface AdminOrderCustomer {
  email: string;
  full_name: string | null;
}

export interface AdminOrder extends Order {
  customer: AdminOrderCustomer | null;
  notes?: string;
  updated_at?: string;
  shipping_addr?: ShippingAddress;
}

export interface AdminOrderDetailCustomer extends AdminOrderCustomer {
  id: string;
  created_at: string;
  totalOrders: number;
  totalSpend: number;
}

export interface AdminOrderDetail extends AdminOrder {
  customer: AdminOrderDetailCustomer | null;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueTrend: number;
  avgOrderValue: number;
  totalDiscount: number;
  todayOrders: number;
  statusCounts: Record<string, number>;
  pendingOrders: number;
}

export interface AdminOrderFilters {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedOrders {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

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
  category: 'eau-de-parfum' | 'eau-de-toilette' | 'parfum' | 'cologne' | 'body-mist';
  gender: 'masculine' | 'feminine' | 'unisex';
  scentFamily: string;
  tags: string[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  concentration: string;
  sillage: 'light' | 'moderate' | 'heavy';
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

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

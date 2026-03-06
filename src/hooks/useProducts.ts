import { useQuery } from "@tanstack/react-query";
import { productsApi, ProductFilters } from "../lib/api";
import { products as localProducts } from "../data/products";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      try {
        return await productsApi.getAll(filters);
      } catch {
        // Fallback to local data when API is unavailable
        let filtered = [...localProducts];
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q),
          );
        }
        if (filters?.gender)
          filtered = filtered.filter((p) => p.gender === filters.gender);
        if (filters?.scent_family)
          filtered = filtered.filter(
            (p) => p.scentFamily === filters.scent_family,
          );
        if (filters?.max_price)
          filtered = filtered.filter((p) => p.price <= filters.max_price!);
        if (filters?.is_new) filtered = filtered.filter((p) => p.isNew);
        if (filters?.is_bestseller)
          filtered = filtered.filter((p) => p.isBestseller);
        if (filters?.sort === "price_asc")
          filtered.sort((a, b) => a.price - b.price);
        else if (filters?.sort === "price_desc")
          filtered.sort((a, b) => b.price - a.price);
        else if (filters?.sort === "name_asc")
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (filters?.sort === "newest")
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        return { products: filtered, total: filtered.length };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        return await productsApi.getBySlug(slug);
      } catch {
        return localProducts.find((p) => p.slug === slug) || null;
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      try {
        return await productsApi.getFeatured();
      } catch {
        return localProducts.filter((p) => p.isFeatured);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBestsellers() {
  return useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      try {
        return await productsApi.getBestsellers();
      } catch {
        return localProducts.filter((p) => p.isBestseller);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

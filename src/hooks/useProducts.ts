import { useQuery } from "@tanstack/react-query";
import { productsApi, ProductFilters } from "../lib/api";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.getFeatured(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBestsellers() {
  return useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: () => productsApi.getBestsellers(),
    staleTime: 10 * 60 * 1000,
  });
}

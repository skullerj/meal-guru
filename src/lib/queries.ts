import { useQuery } from "@tanstack/react-query";
import {
  getActiveShopForWeek,
  getIngredients,
  getRecipe,
  getRecipes,
  getShopIngredients,
  getShopWithRecipes,
} from "@/lib/database";
import { supabase } from "@/lib/supabase-browser";

export const queryKeys = {
  recipes: ["recipes"] as const,
  ingredients: ["ingredients"] as const,
  activeShop: ["activeShop"] as const,
  shop: (id: string) => ["shop", id] as const,
  shopIngredients: (shopId: string) => ["shopIngredients", shopId] as const,
  recipe: (id: string) => ["recipe", id] as const,
};

export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes,
    queryFn: () => getRecipes(supabase),
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: queryKeys.ingredients,
    queryFn: () => getIngredients(supabase),
  });
}

export function useActiveShop() {
  return useQuery({
    queryKey: queryKeys.activeShop,
    queryFn: () => getActiveShopForWeek(supabase),
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: queryKeys.shop(id),
    queryFn: () => getShopWithRecipes(supabase, id),
  });
}

export function useShopIngredients(shopId: string) {
  return useQuery({
    queryKey: queryKeys.shopIngredients(shopId),
    queryFn: () => getShopIngredients(supabase, shopId),
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: queryKeys.recipe(id),
    queryFn: () => getRecipe(supabase, id),
  });
}

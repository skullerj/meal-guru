import { useMutation } from "@tanstack/react-query";
import type { Category, Recipe, ShopStatus, Unit } from "@/data/types";
import {
  createRecipeWithIngredients,
  createShop,
  deactivateShopsForWeek,
  deleteIngredient,
  deleteRecipe,
  getWeekMonday,
  type IngredientInput,
  recommendRecipeIds,
  type StepDraftInput,
  toggleShopIngredient,
  updateIngredient,
  updateRecipeWithIngredients,
  updateShopStatus,
} from "@/lib/database";
import { queryKeys } from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";

export function useCreateRecipe() {
  return useMutation({
    mutationKey: ["createRecipe"],
    mutationFn: (params: {
      name: string;
      ingredients: IngredientInput[];
      steps?: StepDraftInput[];
    }) =>
      createRecipeWithIngredients(
        supabase,
        params.name,
        params.ingredients,
        params.steps
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
    },
  });
}

export function useUpdateRecipe() {
  return useMutation({
    mutationKey: ["updateRecipe"],
    mutationFn: (params: {
      id: string;
      name: string;
      ingredients: IngredientInput[];
      steps?: StepDraftInput[];
    }) =>
      updateRecipeWithIngredients(
        supabase,
        params.id,
        params.name,
        params.ingredients,
        params.steps
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
    },
  });
}

export function useDeleteRecipe() {
  return useMutation({
    mutationKey: ["deleteRecipe"],
    mutationFn: (id: string) => deleteRecipe(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
    },
  });
}

export function useToggleShopIngredient(shopId?: string) {
  return useMutation({
    mutationKey: ["toggleShopIngredient"],
    mutationFn: (params: { id: string; checked: boolean }) =>
      toggleShopIngredient(supabase, params.id, params.checked),
    onSuccess: () => {
      if (shopId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shopIngredients(shopId),
        });
      }
    },
  });
}

export function useUpdateShopStatus(shopId: string) {
  return useMutation({
    mutationKey: ["updateShopStatus"],
    mutationFn: (status: ShopStatus) =>
      updateShopStatus(supabase, shopId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop(shopId) });
    },
  });
}

export function useUpdateIngredient() {
  return useMutation({
    mutationKey: ["updateIngredient"],
    mutationFn: (params: {
      id: string;
      data: { name: string; unit: Unit; category: Category | null };
    }) => updateIngredient(supabase, params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients });
    },
  });
}

export function useDeleteIngredient() {
  return useMutation({
    mutationKey: ["deleteIngredient"],
    mutationFn: (id: string) => deleteIngredient(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients });
    },
  });
}

export function useStartWeek() {
  return useMutation({
    mutationKey: ["startWeek"],
    mutationFn: async () => {
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      return shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeShop });
    },
  });
}

export function useStartNewWeek() {
  return useMutation({
    mutationKey: ["startNewWeek"],
    mutationFn: async () => {
      const weekMonday = getWeekMonday();
      await deactivateShopsForWeek(supabase, weekMonday);
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      return shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeShop });
    },
  });
}

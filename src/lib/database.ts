import type { Ingredient, Recipe, Shop } from "../data/types";
import { supabase } from "./supabase";

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      name,
      created_at,
      ingredients:recipe_ingredients(
        id,
        recipe_id,
        ingredient_id,
        amount,
        order_index,
        ingredient:ingredients(id, name, unit, category, shelf, created_at)
      )
    `
    )
    .order("name");

  if (error) throw error;
  return (data as unknown as Recipe[]) ?? [];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      name,
      created_at,
      ingredients:recipe_ingredients(
        id,
        recipe_id,
        ingredient_id,
        amount,
        order_index,
        ingredient:ingredients(id, name, unit, category, shelf, created_at)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Recipe;
}

export async function createRecipe(name: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return { ...(data as Recipe), ingredients: [] };
}

export async function updateRecipe(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

export async function getIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as Ingredient[]) ?? [];
}

export async function upsertIngredient(
  ingredient: Omit<Ingredient, "id" | "created_at">
): Promise<Ingredient> {
  const { data, error } = await supabase
    .from("ingredients")
    .upsert(ingredient, { onConflict: "name" })
    .select()
    .single();
  if (error) throw error;
  return data as Ingredient;
}

export async function getRecentShops(limit = 4): Promise<Shop[]> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      `
      id,
      created_at,
      recipes:shop_recipes(
        recipe:recipes(
          id,
          name,
          created_at,
          ingredients:recipe_ingredients(
            id,
            recipe_id,
            ingredient_id,
            amount,
            order_index,
            ingredient:ingredients(id, name, unit, category, shelf, created_at)
          )
        )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as Shop[]) ?? [];
}

export async function createShop(recipeIds: string[]): Promise<Shop> {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({})
    .select()
    .single();
  if (shopError) throw shopError;

  const shopRecipes = recipeIds.map((recipe_id) => ({
    shop_id: shop.id,
    recipe_id,
  }));

  const { error: relError } = await supabase
    .from("shop_recipes")
    .insert(shopRecipes);
  if (relError) throw relError;

  return { ...shop, recipes: [] };
}

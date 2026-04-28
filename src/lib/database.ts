import type {
  Category,
  Ingredient,
  Recipe,
  RecipeIngredient,
  Unit,
} from "../data/types";
import { supabase } from "./supabase";

export interface IngredientInput {
  name: string;
  amount: number;
  unit: Unit;
  category?: Category | null;
  ingredient_id?: string;
}

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
        ingredient:ingredients(id, name, unit, category, created_at)
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
        ingredient:ingredients(id, name, unit, category, created_at)
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

export async function updateIngredient(
  id: string,
  data: { name: string; unit: Unit; category: Category | null }
): Promise<Ingredient> {
  const { data: updated, error } = await supabase
    .from("ingredients")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated as Ingredient;
}

export async function deleteIngredient(id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from("recipe_ingredients")
    .select("id", { count: "exact", head: true })
    .eq("ingredient_id", id);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(`Cannot delete: ingredient is used in ${count} recipe(s)`);
  }
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) throw error;
}

export async function setRecipeIngredients(
  recipeId: string,
  ingredients: IngredientInput[]
): Promise<RecipeIngredient[]> {
  const { error: deleteError } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", recipeId);
  if (deleteError) throw deleteError;

  const result: RecipeIngredient[] = [];

  for (let i = 0; i < ingredients.length; i++) {
    const { name, amount, unit, category, ingredient_id } = ingredients[i];

    let resolvedId: string;

    if (ingredient_id) {
      resolvedId = ingredient_id;
    } else {
      const { data: ingredient, error: ingError } = await supabase
        .from("ingredients")
        .upsert(
          { name: name.trim(), unit, category: category ?? null },
          { onConflict: "name" }
        )
        .select()
        .single();
      if (ingError) throw ingError;
      resolvedId = ingredient.id;
    }

    const { data: ri, error: riError } = await supabase
      .from("recipe_ingredients")
      .insert({
        recipe_id: recipeId,
        ingredient_id: resolvedId,
        amount,
        order_index: i,
      })
      .select(
        `id, recipe_id, ingredient_id, amount, order_index,
         ingredient:ingredients(id, name, unit, category, created_at)`
      )
      .single();
    if (riError) throw riError;

    result.push(ri as unknown as RecipeIngredient);
  }

  return result;
}

export async function createRecipeWithIngredients(
  name: string,
  ingredients: IngredientInput[]
): Promise<Recipe> {
  const recipe = await createRecipe(name);
  const recipeIngredients = await setRecipeIngredients(recipe.id, ingredients);
  return { ...recipe, ingredients: recipeIngredients };
}

export async function updateRecipeWithIngredients(
  id: string,
  name: string,
  ingredients: IngredientInput[]
): Promise<Recipe> {
  await updateRecipe(id, name);
  const recipeIngredients = await setRecipeIngredients(id, ingredients);
  const recipe = await getRecipe(id);
  if (!recipe) throw new Error(`Recipe ${id} not found after update`);
  return { ...recipe, ingredients: recipeIngredients };
}

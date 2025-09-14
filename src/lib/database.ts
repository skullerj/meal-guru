import { z } from "zod";
import type { Database, Tables } from "../types/database";
import { supabase } from "./supabase";

export const sourceSchema = z.object({
  url: z.string().url(),
  price: z.number(),
  amount: z.number(),
});

export type Source = z.infer<typeof sourceSchema>;

// Database table types
export type DBRecipeIngredient =
  Database["public"]["Tables"]["recipe_ingredients"]["Row"];
export type DBIngredient = Database["public"]["Tables"]["ingredients"]["Row"];

// Application types for ingredients
export type Ingredient = Omit<DBIngredient, "source"> & { source: Source };

// Recipe ingredient with nested ingredient data (for edit recipe functionality)
export type RecipeIngredient = {
  id: string; // recipe_ingredients.id
  amount: number; // recipe_ingredients.amount
  order_index: number; // recipe_ingredients.order_index
  ingredient: Ingredient; // Full ingredient data
};

// Legacy flattened ingredient type (for backward compatibility)
export type FlatIngredient = Ingredient & Pick<DBRecipeIngredient, "amount">;

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"] & {
  ingredients: RecipeIngredient[];
};

const recipeSelect = `
*,
recipe_ingredients!inner (
  id,
  amount,
  order_index,
  ingredients (*)
)
`;

function parseDBRecipe(
  dbRecipe: Tables<"recipes"> & {
    recipe_ingredients: (Omit<
      Tables<"recipe_ingredients">,
      "recipe_id" | "ingredient_id"
    > & {
      ingredients: Tables<"ingredients">;
    })[];
  }
): Recipe {
  const ingredients: RecipeIngredient[] = dbRecipe.recipe_ingredients
    .sort((a, b) => a.order_index - b.order_index)
    .map((recipeIng) => ({
      id: recipeIng.id,
      amount: recipeIng.amount,
      order_index: recipeIng.order_index,
      ingredient: {
        ...recipeIng.ingredients,
        source: sourceSchema.parse(recipeIng.ingredients.source),
      },
    }));

  return {
    id: dbRecipe.id,
    name: dbRecipe.name,
    created_at: dbRecipe.created_at,
    ingredients,
  };
}

// Get all recipes with their ingredients
export async function getRecipes(): Promise<Recipe[]> {
  // Get recipes with their ingredients
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .select(recipeSelect)
    .order("name");

  if (recipeError) {
    console.error("Error fetching recipes:", recipeError);
    throw recipeError;
  }

  if (!recipeData) return [];

  // Convert to app format
  const recipes = recipeData.map(parseDBRecipe);

  return recipes;
}

// Create a new ingredient (with conflict handling)
export async function createIngredient(ingredientData: {
  name: string;
  unit: Ingredient["unit"];
  source?: { url: string; price: number; amount: number } | null;
  shelf?: boolean;
}): Promise<Pick<Ingredient, "id" | "name" | "unit" | "source" | "shelf">> {
  // Check if ingredient with this name already exists
  const existingIngredients = await searchIngredients(ingredientData.name);
  const exactMatch = existingIngredients.find(
    (ing) => ing.name.toLowerCase() === ingredientData.name.toLowerCase()
  );

  if (exactMatch) {
    // Return existing ingredient instead of creating duplicate
    return exactMatch;
  }

  const { data, error } = await supabase
    .from("ingredients")
    .insert([
      {
        name: ingredientData.name,
        unit: ingredientData.unit,
        source: sourceSchema.parse(ingredientData.source),
        shelf: ingredientData.shelf || false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating ingredient:", error);
    throw error;
  }

  return { ...data, source: sourceSchema.parse(data.source) };
}

// Create a new recipe with ingredients
export async function createRecipe(
  recipe: { name: string },
  ingredients: Array<{
    ingredient_id: string;
    amount: number;
    order_index: number;
  }>
): Promise<Pick<Recipe, "id" | "name" | "created_at">> {
  // Start a transaction
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .insert([recipe])
    .select()
    .single();

  if (recipeError) {
    console.error("Error creating recipe:", recipeError);
    throw recipeError;
  }

  // Insert recipe ingredients
  const recipeIngredients = ingredients.map((ing) => ({
    recipe_id: recipeData.id,
    ...ing,
  }));

  const { error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .insert(recipeIngredients);

  if (ingredientsError) {
    console.error("Error creating recipe ingredients:", ingredientsError);
    throw ingredientsError;
  }

  return recipeData;
}

// Get a single recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data } = await supabase
    .from("recipes")
    .select(recipeSelect)
    .eq("id", id);
  if (!data?.[0]) return null;
  return parseDBRecipe(data[0]);
}

// Get all ingredients for autocomplete and ingredient reuse
export async function getAllIngredients(): Promise<
  Omit<Ingredient, "amount">[]
> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }

  if (!data) return [];

  // Convert to app format
  return data.map((ingredient) => ({
    ...ingredient,
    source: sourceSchema.parse(ingredient.source),
  }));
}

// Search ingredients by name for reuse functionality
export async function searchIngredients(
  query: string
): Promise<Omit<Ingredient, "amount">[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(10);

  if (error) {
    console.error("Error searching ingredients:", error);
    throw error;
  }

  if (!data) return [];

  // Convert to app format
  return data.map((ingredient) => ({
    ...ingredient,
    source: sourceSchema.parse(ingredient.source),
  }));
}

import { z } from "zod";
import type { Database } from "../types/database";
import { supabase } from "./supabase";

const sourceSchema = z.object({
  url: z.string().url(),
  price: z.number(),
  amount: z.number(),
});

export type Source = z.infer<typeof sourceSchema>;
// Extract types from generated Database type
export type RecipeIngredient =
  Database["public"]["Tables"]["recipe_ingredients"]["Row"];
export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"] &
  Pick<RecipeIngredient, "amount"> & { source: Source };
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"] & {
  ingredients: Ingredient[];
};

// Get all recipes with their ingredients and instructions
export async function getRecipes(): Promise<Recipe[]> {
  // Get recipes with their ingredients
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .select(
      `
      *,
      recipe_ingredients!inner (
        amount,
        order_index,
        ingredients (*)
      )
    `
    )
    .order("name");

  if (recipeError) {
    console.error("Error fetching recipes:", recipeError);
    throw recipeError;
  }

  if (!recipeData) return [];

  // Convert to app format
  const recipes = recipeData.map((dbRecipe) => {
    const ingredients = dbRecipe.recipe_ingredients
      .sort((a, b) => a.order_index - b.order_index)
      .map((ing) => ({
        ...ing.ingredients,
        amount: ing.amount,
        source: sourceSchema.parse(ing.ingredients.source),
      }));

    return {
      id: dbRecipe.id,
      name: dbRecipe.name,
      created_at: dbRecipe.created_at,
      ingredients,
    };
  });

  return recipes;
}

// Create a new ingredient (with conflict handling)
export async function createIngredient(ingredientData: {
  name: string;
  unit: Ingredient["unit"];
  source?: { url: string; price: number; amount: number } | null;
  shelf?: boolean;
}): Promise<Pick<Ingredient, "name" | "unit" | "source" | "shelf">> {
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

// Create a new recipe with ingredients and instructions
export async function createRecipe(
  recipe: { name: string },
  ingredients: Array<{
    ingredient_id: string;
    amount: number;
    order_index: number;
  }>,
  instructions: Array<{
    step_number: number;
    instruction_text: string;
    ingredient_ids?: string[];
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

  // Insert recipe instructions
  const recipeInstructions = instructions.map((inst) => ({
    recipe_id: recipeData.id,
    ...inst,
  }));

  const { error: instructionsError } = await supabase
    .from("recipe_instructions")
    .insert(recipeInstructions);

  if (instructionsError) {
    console.error("Error creating recipe instructions:", instructionsError);
    throw instructionsError;
  }

  return recipeData;
}

// Get a single recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find((recipe) => recipe.id === id) || null;
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

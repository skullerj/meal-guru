import type { Database } from "../types/database";
import { supabase } from "./supabase";

// Extract types from generated Database type
type DbIngredient = Database["public"]["Tables"]["ingredients"]["Row"];
type DbRecipe = Database["public"]["Tables"]["recipes"]["Row"];
type DbRecipeIngredient =
  Database["public"]["Tables"]["recipe_ingredients"]["Row"];

// App-level types for compatibility with existing components
export interface Ingredient {
  id: string;
  name: string;
  unit: DbIngredient["unit"];
  amount: number;
  source: {
    url: string;
    price: number;
    amount: number;
  };
  shelf: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: Array<{
    text: string;
    ingredientIds: string[];
  }>;
}

// Extended types for database queries
interface DbRecipeIngredientWithIngredient extends DbRecipeIngredient {
  ingredients: DbIngredient;
}

interface DbRecipeWithIngredients extends DbRecipe {
  recipe_ingredients: DbRecipeIngredientWithIngredient[];
}

// Convert database ingredient to app ingredient format
function dbIngredientToIngredient(
  dbIngredient: DbIngredient,
  amount: number
): Ingredient {
  const source = dbIngredient.source || { url: "", price: 0, amount: 0 };
  return {
    id: dbIngredient.id,
    name: dbIngredient.name,
    unit: dbIngredient.unit,
    amount: amount,
    source: {
      url: source.url,
      price: source.price,
      amount: source.amount,
    },
    shelf: dbIngredient.shelf,
  };
}

// Get all ingredients
export async function getIngredients(): Promise<DbIngredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }

  return data || [];
}

// Get all recipes with their ingredients and instructions
export async function getRecipes(): Promise<Recipe[]> {
  // Get recipes with their ingredients
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients!inner (
        amount,
        order_index,
        ingredients (*)
      )
    `)
    .order("name");

  if (recipeError) {
    console.error("Error fetching recipes:", recipeError);
    throw recipeError;
  }

  if (!recipeData) return [];

  // Get instructions for all recipes
  const recipeIds = recipeData.map((recipe) => recipe.id);
  const { data: instructionsData, error: instructionsError } = await supabase
    .from("recipe_instructions")
    .select("*")
    .in("recipe_id", recipeIds)
    .order("recipe_id, step_number");

  if (instructionsError) {
    console.error("Error fetching instructions:", instructionsError);
    throw instructionsError;
  }

  // Convert to app format
  const recipes: Recipe[] = (recipeData as DbRecipeWithIngredients[]).map(
    (dbRecipe) => {
      const ingredients = dbRecipe.recipe_ingredients
        .sort((a, b) => a.order_index - b.order_index)
        .map((ri) => dbIngredientToIngredient(ri.ingredients, ri.amount));

      const instructions = (instructionsData || [])
        .filter((inst) => inst.recipe_id === dbRecipe.id)
        .sort((a, b) => a.step_number - b.step_number)
        .map((inst) => ({
          text: inst.instruction_text,
          ingredientIds: inst.ingredient_ids || [],
        }));

      return {
        id: dbRecipe.id,
        name: dbRecipe.name,
        ingredients,
        instructions,
      };
    }
  );

  return recipes;
}

// Create a new ingredient
export async function createIngredient(ingredientData: {
  name: string;
  unit: DbIngredient["unit"];
  source?: { url: string; price: number; amount: number } | null;
  shelf?: boolean;
}): Promise<DbIngredient> {
  const { data, error } = await supabase
    .from("ingredients")
    .insert([
      {
        name: ingredientData.name,
        unit: ingredientData.unit,
        source: ingredientData.source || null,
        shelf: ingredientData.shelf || false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating ingredient:", error);
    throw error;
  }

  return data;
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
): Promise<DbRecipe> {
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

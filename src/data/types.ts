export const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "unit",
] as const;
export type Unit = (typeof UNITS)[number];

export const CATEGORIES = [
  "produce",
  "bakery",
  "dairy",
  "meat",
  "canned",
  "condiments",
  "oils",
  "spices",
  "grains",
  "frozen",
] as const;
export type Category = (typeof CATEGORIES)[number] | null;

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  category: Category;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  amount: number;
  order_index: number;
  ingredient: Ingredient;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
  // ingredient_ids holds recipe_ingredient.id values used in this step
  ingredient_ids: string[];
}

export type ShopStatus = "shopping" | "cooking";

export interface Recipe {
  id: string;
  name: string;
  created_at: string;
  ingredients: RecipeIngredient[];
  steps?: RecipeStep[];
}

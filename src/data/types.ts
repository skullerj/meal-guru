export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "oz"
  | "lb"
  | "unit";

export type Category = "produce" | "tins" | "dairy" | "meat" | "pantry" | null;

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  category: Category;
  shelf: boolean;
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

export interface Recipe {
  id: string;
  name: string;
  created_at: string;
  ingredients: RecipeIngredient[];
}

export interface Shop {
  id: string;
  created_at: string;
  recipes: Recipe[];
}

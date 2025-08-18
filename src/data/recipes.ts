// Re-export types from database module for backward compatibility
export type { Ingredient, Recipe } from "../lib/database";

// Legacy type exports for existing components
export type UnitType =
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

// Data is now stored in Supabase database
// Use getRecipes() from '../lib/database' to fetch recipe data

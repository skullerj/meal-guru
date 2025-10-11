import { z } from "astro:schema";
import { sourceSchema } from "../../lib/database";

const unitSchema = z.enum([
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
]);

export const createIngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  unit: unitSchema,
  shelf: z.boolean().default(false),
  source: sourceSchema.optional(),
});

export const updateIngredientSchema = z.object({
  id: z.string().min(1, "Ingredient ID is required"),
  name: z.string().min(1, "Ingredient name is required").optional(),
  unit: unitSchema.optional(),
  shelf: z.boolean().optional(),
  source: sourceSchema.optional(),
});

export const deleteIngredientSchema = z.object({
  id: z.string().min(1, "Ingredient ID is required"),
});

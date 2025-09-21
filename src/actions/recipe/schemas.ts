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

export const saveRecipeSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Recipe name must be at least 3 characters"),
  ingredients: z.array(
    z.object({
      amount: z.number().positive(),
      ingredient: z.object({
        id: z.string().nullish(),
        unit: unitSchema,
        name: z.string(),
        shelf: z.boolean(),
        source: sourceSchema
          .nullish()
          .transform((val) => val || { url: "", price: 0, amount: 0 }),
      }),
    })
  ),
});

export const editRecipeSchema = z.object({
  id: z.string().min(1, "Recipe ID is required"),
  name: z
    .string()
    .min(3, "Recipe name must be at least 3 characters")
    .optional(),
  ingredientsToUpdate: z
    .array(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        ingredient: z.object({
          id: z.string(),
          unit: unitSchema.optional(),
          name: z.string().optional(),
          shelf: z.boolean().optional(),
          source: sourceSchema.optional(),
        }),
      })
    )
    .optional(),
  ingredientsToDelete: z.array(z.string()).optional(),
  ingredientsToAdd: z
    .array(
      z.object({
        amount: z.number().positive(),
        ingredient: z.object({
          name: z.string().min(1, "Ingredient name is required"),
          unit: unitSchema,
          shelf: z.boolean(),
          source: sourceSchema,
        }),
      })
    )
    .optional(),
});

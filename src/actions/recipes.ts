import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import {
  createRecipeWithIngredients,
  deleteRecipe,
  getRecipe,
  updateRecipeWithIngredients,
} from "@/lib/database";

const ingredientInputSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum([
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
  ]),
});

export const recipes = {
  create: defineAction({
    input: z.object({
      name: z.string().min(1),
      ingredients: z.array(ingredientInputSchema),
    }),
    handler: async ({ name, ingredients }) => {
      return await createRecipeWithIngredients(name, ingredients);
    },
  }),

  update: defineAction({
    input: z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      ingredients: z.array(ingredientInputSchema),
    }),
    handler: async ({ id, name, ingredients }) => {
      const existing = await getRecipe(id);
      if (!existing)
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      return await updateRecipeWithIngredients(id, name, ingredients);
    },
  }),

  delete: defineAction({
    input: z.object({
      id: z.string().uuid(),
    }),
    handler: async ({ id }) => {
      await deleteRecipe(id);
    },
  }),
};

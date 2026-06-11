import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { CATEGORIES, UNITS } from "@/data/types";
import {
  createRecipeWithIngredients,
  deleteRecipe,
  getRecipe,
  setRecipeSteps,
  updateRecipeWithIngredients,
} from "@/lib/database";

const ingredientInputSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(UNITS),
  category: z.enum(CATEGORIES).nullable().optional(),
  ingredient_id: z.string().uuid().optional(),
});

export const recipes = {
  create: defineAction({
    input: z.object({
      name: z.string().min(1),
      ingredients: z.array(ingredientInputSchema),
    }),
    handler: async ({ name, ingredients }) => {
      try {
        return await createRecipeWithIngredients(name, ingredients);
      } catch (e) {
        console.error("[recipes.create]", { name }, e);
        throw e;
      }
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
      try {
        return await updateRecipeWithIngredients(id, name, ingredients);
      } catch (e) {
        console.error("[recipes.update]", { id, name }, e);
        throw e;
      }
    },
  }),

  delete: defineAction({
    input: z.object({
      id: z.string().uuid(),
    }),
    handler: async ({ id }) => {
      try {
        await deleteRecipe(id);
      } catch (e) {
        console.error("[recipes.delete]", { id }, e);
        throw e;
      }
    },
  }),

  saveSteps: defineAction({
    input: z.object({
      recipe_id: z.string().uuid(),
      steps: z.array(
        z.object({
          step_number: z.number().int().positive(),
          instruction: z.string().min(1),
          ingredient_ids: z.array(z.string().uuid()),
        })
      ),
    }),
    handler: async ({ recipe_id, steps }) => {
      return await setRecipeSteps(recipe_id, steps);
    },
  }),
};

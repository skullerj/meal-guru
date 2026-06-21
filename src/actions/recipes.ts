import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { CATEGORIES, UNITS } from "@/data/types";
import {
  createRecipeWithIngredients,
  deleteRecipe,
  getRecipe,
  updateRecipeWithIngredients,
} from "@/lib/database";
import { createSupabaseServerClient } from "@/lib/supabase";

const ingredientInputSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(UNITS),
  category: z.enum(CATEGORIES).nullable().optional(),
  ingredient_id: z.string().uuid().optional(),
});

const stepDraftSchema = z.object({
  step_number: z.number().int().positive(),
  instruction: z.string().min(1),
  ingredient_indices: z.array(z.number().int().min(0)),
});

export const recipes = {
  create: defineAction({
    input: z.object({
      name: z.string().min(1),
      ingredients: z.array(ingredientInputSchema),
      steps: z.array(stepDraftSchema).optional(),
    }),
    handler: async ({ name, ingredients, steps }, context) => {
      const supabase = createSupabaseServerClient({
        headers: context.request.headers,
        cookies: context.cookies,
      });
      try {
        return await createRecipeWithIngredients(
          supabase,
          name,
          ingredients,
          steps
        );
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
      steps: z.array(stepDraftSchema).optional(),
    }),
    handler: async ({ id, name, ingredients, steps }, context) => {
      const supabase = createSupabaseServerClient({
        headers: context.request.headers,
        cookies: context.cookies,
      });
      const existing = await getRecipe(supabase, id);
      if (!existing)
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      try {
        return await updateRecipeWithIngredients(
          supabase,
          id,
          name,
          ingredients,
          steps
        );
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
    handler: async ({ id }, context) => {
      const supabase = createSupabaseServerClient({
        headers: context.request.headers,
        cookies: context.cookies,
      });
      try {
        await deleteRecipe(supabase, id);
      } catch (e) {
        console.error("[recipes.delete]", { id }, e);
        throw e;
      }
    },
  }),
};

import { defineAction } from "astro:actions";
import { z } from "zod";
import type { Recipe, RecipeIngredient } from "@/data/types";
import { supabase } from "@/lib/supabase";

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

const ingredientInputSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: unitSchema,
});

export const server = {
  recipes: {
    create: defineAction({
      input: z.object({
        name: z.string().min(1),
        ingredients: z.array(ingredientInputSchema),
      }),
      handler: async ({ name, ingredients }): Promise<Recipe> => {
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert({ name })
          .select()
          .single();

        if (recipeError) throw recipeError;

        const savedIngredients = await upsertAndLinkIngredients(
          recipe.id,
          ingredients
        );

        return {
          ...recipe,
          ingredients: savedIngredients,
        } as Recipe;
      },
    }),

    update: defineAction({
      input: z.object({
        id: z.string(),
        name: z.string().min(1),
        ingredients: z.array(ingredientInputSchema),
      }),
      handler: async ({ id, name, ingredients }): Promise<Recipe> => {
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .update({ name })
          .eq("id", id)
          .select()
          .single();

        if (recipeError) throw recipeError;

        const { error: deleteError } = await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", id);

        if (deleteError) throw deleteError;

        const savedIngredients = await upsertAndLinkIngredients(
          id,
          ingredients
        );

        return {
          ...recipe,
          ingredients: savedIngredients,
        } as Recipe;
      },
    }),

    delete: defineAction({
      input: z.object({
        id: z.string(),
      }),
      handler: async ({ id }): Promise<void> => {
        const { error } = await supabase.from("recipes").delete().eq("id", id);

        if (error) throw error;
      },
    }),
  },
};

interface IngredientInputRaw {
  name: string;
  amount: number;
  unit: string;
}

async function upsertAndLinkIngredients(
  recipeId: string,
  ingredients: IngredientInputRaw[]
): Promise<RecipeIngredient[]> {
  const result: RecipeIngredient[] = [];

  for (let i = 0; i < ingredients.length; i++) {
    const { name, amount, unit } = ingredients[i];

    const { data: ingredient, error: ingError } = await supabase
      .from("ingredients")
      .upsert({ name, unit }, { onConflict: "name" })
      .select()
      .single();

    if (ingError) throw ingError;

    const { data: recipeIngredient, error: riError } = await supabase
      .from("recipe_ingredients")
      .insert({
        recipe_id: recipeId,
        ingredient_id: ingredient.id,
        amount,
        order_index: i,
      })
      .select(
        `
        id,
        recipe_id,
        ingredient_id,
        amount,
        order_index,
        ingredient:ingredients(id, name, unit, category, shelf, created_at)
      `
      )
      .single();

    if (riError) throw riError;

    result.push(recipeIngredient as unknown as RecipeIngredient);
  }

  return result;
}

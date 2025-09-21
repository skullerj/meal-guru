import { ActionError, defineAction } from "astro:actions";
import { createIngredient, getRecipeById } from "../../lib/database";
import { supabase } from "../../lib/supabase";
import { editRecipeSchema } from "./schemas";

export default defineAction({
  input: editRecipeSchema,
  handler: async ({
    id,
    name,
    ingredientsToUpdate,
    ingredientsToDelete,
    ingredientsToAdd,
  }) => {
    try {
      if (name) {
        await supabase.from("recipes").update({ name }).eq("id", id);
      }

      // Add ingredient updates if provided
      if (ingredientsToUpdate?.length) {
        for (const toUpdate of ingredientsToUpdate) {
          if (toUpdate.ingredient) {
            await supabase
              .from("ingredients")
              .update(toUpdate.ingredient)
              .eq("id", toUpdate.ingredient.id);
          }

          await supabase
            .from("recipe_ingredients")
            .update({
              amount: toUpdate.amount,
            })
            .eq("id", toUpdate.id);
        }
      }

      // Add deleted ingredients if provided
      if (ingredientsToDelete?.length) {
        await supabase
          .from("recipe_ingredients")
          .delete()
          .in("id", ingredientsToDelete);
      }

      // Add new ingredients if provided
      if (ingredientsToAdd?.length) {
        // Get current recipe to determine next order_index
        const currentRecipe = await getRecipeById(id);
        if (!currentRecipe) {
          throw new Error("Recipe not found");
        }

        let nextOrderIndex =
          Math.max(
            ...currentRecipe.ingredients.map((ing) => ing.order_index),
            -1
          ) + 1;

        for (const newIngredient of ingredientsToAdd) {
          // Create or reuse the ingredient
          const ingredient = await createIngredient({
            name: newIngredient.ingredient.name,
            unit: newIngredient.ingredient.unit,
            shelf: newIngredient.ingredient.shelf,
            source: newIngredient.ingredient.source,
          });

          // Add the recipe_ingredient relationship
          await supabase.from("recipe_ingredients").insert({
            recipe_id: id,
            ingredient_id: ingredient.id,
            amount: newIngredient.amount,
            order_index: nextOrderIndex++,
          });
        }
      }

      return getRecipeById(id);

      // Call the update function
    } catch (error) {
      console.error("Error updating recipe:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("Recipe not found")) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Recipe not found",
          });
        }

        if (error.message.includes("ingredient")) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update recipe",
      });
    }
  },
});

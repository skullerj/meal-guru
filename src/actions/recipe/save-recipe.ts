import { ActionError, defineAction } from "astro:actions";
import { createIngredient, createRecipe } from "../../lib/database";
import { saveRecipeSchema } from "./schemas";

export default defineAction({
  input: saveRecipeSchema,
  handler: async ({ name, ingredients }) => {
    try {
      // First, create any new ingredients
      const processedIngredients = [];

      for (let i = 0; i < ingredients.length; i++) {
        const recipeIngredient = ingredients[i];

        const { ingredient, amount } = recipeIngredient;

        if (ingredient?.id) {
          // Use existing ingredient ID
          processedIngredients.push({
            ingredient_id: ingredient.id,
            amount: amount,
            order_index: i,
          });
        } else {
          // Create new ingredient

          try {
            const newIngredient = await createIngredient(ingredient);

            processedIngredients.push({
              ingredient_id: newIngredient.id,
              amount: amount,
              order_index: i,
            });
          } catch (error) {
            console.error(
              `Failed to create ingredient ${ingredient.name}:`,
              error
            );
            throw new ActionError({
              code: "BAD_REQUEST",
              message: `Failed to create ingredient: ${ingredient.name}`,
            });
          }
        }
      }

      // Create the recipe
      const newRecipe = await createRecipe({ name }, processedIngredients);

      return {
        success: true,
        recipe: newRecipe,
      };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }

      console.error("Error creating recipe:", error);
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to save recipe to database",
      });
    }
  },
});

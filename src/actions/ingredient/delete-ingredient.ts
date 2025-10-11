import { ActionError, defineAction } from "astro:actions";
import { supabase } from "../../lib/supabase";
import { deleteIngredientSchema } from "./schemas";

export default defineAction({
  input: deleteIngredientSchema,
  handler: async ({ id }) => {
    try {
      // Check if ingredient is used in any recipes
      const { data: recipeIngredients, error: checkError } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id")
        .eq("ingredient_id", id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (recipeIngredients && recipeIngredients.length > 0) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete ingredient that is used in recipes. Remove it from all recipes first.",
        });
      }

      // Delete the ingredient
      const { error: deleteError } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting ingredient:", error);

      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete ingredient",
      });
    }
  },
});

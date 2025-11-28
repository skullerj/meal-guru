import { ActionError, defineAction } from "astro:actions";
import { supabase } from "../../lib/supabase";
import { createShopSchema } from "./schemas";

export default defineAction({
  input: createShopSchema,
  handler: async ({ recipeIds, ingredients, totalCost }) => {
    try {
      // Create the shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .insert([{ total_cost: totalCost }])
        .select()
        .single();

      if (shopError || !shopData) {
        console.error("Error creating shop:", shopError);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create shop",
        });
      }

      const shopId = shopData.id;

      // Insert shop ingredients
      const shopIngredients = ingredients.map((ing, index) => ({
        shop_id: shopId,
        ingredient_id: ing.ingredientId,
        amount: ing.amount,
        cost: ing.cost,
        order_index: index,
      }));

      const { error: ingredientsError } = await supabase
        .from("shop_ingredients")
        .insert(shopIngredients);

      if (ingredientsError) {
        console.error("Error creating shop ingredients:", ingredientsError);
        // Rollback: delete the shop if ingredients fail
        await supabase.from("shops").delete().eq("id", shopId);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save shop ingredients",
        });
      }

      // Insert shop recipes
      const shopRecipes = recipeIds.map((recipeId) => ({
        shop_id: shopId,
        recipe_id: recipeId,
      }));

      const { error: recipesError } = await supabase
        .from("shop_recipes")
        .insert(shopRecipes);

      if (recipesError) {
        console.error("Error creating shop recipes:", recipesError);
        // Rollback: delete the shop if recipes fail
        await supabase.from("shops").delete().eq("id", shopId);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save shop recipes",
        });
      }

      return {
        success: true,
        shopId: shopId,
      };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }

      console.error("Error creating shop:", error);
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create shop",
      });
    }
  },
});

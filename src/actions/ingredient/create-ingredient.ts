import { ActionError, defineAction } from "astro:actions";
import { createIngredient } from "../../lib/database";
import { createIngredientSchema } from "./schemas";

export default defineAction({
  input: createIngredientSchema,
  handler: async ({ name, unit, shelf, source }) => {
    try {
      const newIngredient = await createIngredient({
        name,
        unit,
        shelf,
        source: source || { url: "", price: 0, amount: 0 },
      });

      return {
        success: true,
        ingredient: newIngredient,
      };
    } catch (error) {
      console.error("Error creating ingredient:", error);

      if (error instanceof Error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create ingredient",
      });
    }
  },
});

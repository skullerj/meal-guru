import { ActionError, defineAction } from "astro:actions";
import { supabase } from "../../lib/supabase";
import { updateIngredientSchema } from "./schemas";

export default defineAction({
  input: updateIngredientSchema,
  handler: async ({ id, name, unit, shelf, source }) => {
    try {
      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (unit !== undefined) updateData.unit = unit;
      if (shelf !== undefined) updateData.shelf = shelf;
      if (source !== undefined) updateData.source = source;

      const { data, error } = await supabase
        .from("ingredients")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Ingredient not found",
        });
      }

      return {
        success: true,
        ingredient: data,
      };
    } catch (error) {
      console.error("Error updating ingredient:", error);

      if (error instanceof ActionError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("not found")) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Ingredient not found",
        });
      }

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update ingredient",
      });
    }
  },
});

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { CATEGORIES, UNITS } from "@/data/types";
import { deleteIngredient, updateIngredient } from "@/lib/database";
import { createSupabaseServerClient } from "@/lib/supabase";

export const ingredients = {
  update: defineAction({
    input: z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      unit: z.enum(UNITS),
      category: z.enum(CATEGORIES).nullable(),
    }),
    handler: async ({ id, name, unit, category }, context) => {
      const supabase = createSupabaseServerClient({
        headers: context.request.headers,
        cookies: context.cookies,
      });
      try {
        return await updateIngredient(supabase, id, { name, unit, category });
      } catch (e) {
        console.error("[ingredients.update]", { id, name }, e);
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
        await deleteIngredient(supabase, id);
        return { success: true };
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("Cannot delete:")) {
          throw new ActionError({ code: "BAD_REQUEST", message: e.message });
        }
        console.error("[ingredients.delete]", { id }, e);
        throw e;
      }
    },
  }),
};

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { commitShop } from "@/lib/database";

export const shops = {
  commit: defineAction({
    input: z.object({
      recipeIds: z.array(z.string().uuid()).min(1).max(20),
    }),
    handler: async ({ recipeIds }) => {
      try {
        return await commitShop(recipeIds);
      } catch (e) {
        console.error("[shops.commit]", { recipeIds }, e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to commit shop",
        });
      }
    },
  }),
};

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import {
  commitShop,
  createShop,
  deactivateShopsForWeek,
  getActiveShopForWeek,
  getShopIngredients,
  getWeekMonday,
  recommendRecipeIds,
  toggleShopIngredient,
  updateShopStatus,
} from "@/lib/database";

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

  createFromIds: defineAction({
    input: z.object({
      recipeIds: z.array(z.string().uuid()).min(1),
    }),
    handler: async ({ recipeIds }) => {
      try {
        return await createShop(recipeIds);
      } catch (e) {
        console.error("[shops.createFromIds]", { count: recipeIds.length }, e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create shop",
        });
      }
    },
  }),

  startNewWeek: defineAction({
    input: z.object({}),
    handler: async () => {
      try {
        const weekMonday = getWeekMonday();
        await deactivateShopsForWeek(weekMonday);
        const recommendedIds = await recommendRecipeIds();
        const shop = await createShop(recommendedIds);
        return { id: shop.id };
      } catch (e) {
        console.error("[shops.startNewWeek]", e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start new week",
        });
      }
    },
  }),

  getOrCreateWeeklyShop: defineAction({
    input: z.object({}),
    handler: async () => {
      try {
        const existing = await getActiveShopForWeek();
        if (existing) {
          return { id: existing.id, created: false };
        }
        const ids = await recommendRecipeIds();
        const shop = await createShop(ids);
        return { id: shop.id, created: true };
      } catch (e) {
        console.error("[shops.getOrCreateWeeklyShop]", e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get or create weekly shop",
        });
      }
    },
  }),

  getIngredients: defineAction({
    input: z.object({
      shopId: z.string().uuid(),
    }),
    handler: async ({ shopId }) => {
      try {
        return await getShopIngredients(shopId);
      } catch (e) {
        console.error("[shops.getIngredients]", { shopId }, e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch shop ingredients",
        });
      }
    },
  }),

  toggleIngredient: defineAction({
    input: z.object({
      id: z.string().uuid(),
      checked: z.boolean(),
    }),
    handler: async ({ id, checked }) => {
      try {
        await toggleShopIngredient(id, checked);
        return { success: true };
      } catch (e) {
        console.error("[shops.toggleIngredient]", { id, checked }, e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle shop ingredient",
        });
      }
    },
  }),

  finishShopping: defineAction({
    input: z.object({
      shopId: z.string().uuid(),
    }),
    handler: async ({ shopId }) => {
      try {
        await updateShopStatus(shopId, "cooking");
        return { success: true };
      } catch (e) {
        console.error("[shops.finishShopping]", { shopId }, e);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to finish shopping",
        });
      }
    },
  }),
};

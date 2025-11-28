import { z } from "astro:schema";

export const createShopSchema = z.object({
  recipeIds: z.array(z.string()),
  ingredients: z.array(
    z.object({
      ingredientId: z.string(),
      amount: z.number().positive(),
      cost: z.number().nonnegative(),
    })
  ),
  totalCost: z.number().nonnegative(),
});

export const prerender = false;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { APIRoute } from "astro";
import { z } from "zod";
import type { Category } from "@/data/types";
import { CATEGORIES, UNITS } from "@/data/types";
import {
  createRecipeWithIngredients,
  deleteIngredient,
  deleteRecipe,
  getIngredients,
  getRecipe,
  getRecipeSteps,
  getRecipes,
  recommendRecipeIds,
  setRecipeSteps,
  updateIngredient,
  updateRecipeWithIngredients,
  updateShopStatus,
  upsertIngredient,
} from "@/lib/database";
import { createServiceRoleClient } from "@/lib/supabase";

const stepDraftInputShape = {
  step_number: z
    .number()
    .int()
    .positive()
    .describe(
      "Step order number (1-based, unique within this call). Drives display order."
    ),
  instruction: z
    .string()
    .min(1)
    .describe("Full instruction text for this step"),
  ingredient_indices: z
    .array(z.number().int().min(0))
    .describe(
      "Zero-based indices into the ingredients array passed alongside. For example, [0, 2] means the step uses the 1st and 3rd ingredients from the ingredients list in this same request. Pass an empty array if the step does not reference specific ingredients."
    ),
};

const ingredientInputShape = {
  name: z
    .string()
    .min(1)
    .describe(
      "Ingredient name — used as the deduplication key if ingredient_id is omitted. Must match existing ingredient name exactly (case-sensitive) to avoid creating a duplicate. Prefer passing ingredient_id when you have already called list_ingredients."
    ),
  amount: z
    .number()
    .positive()
    .describe("Quantity of the ingredient in the given unit"),
  unit: z
    .enum(UNITS)
    .describe(
      "Unit of measurement. Dry weights: g, kg, oz, lb. Liquids: ml, l. Small measures: tsp (teaspoon), tbsp (tablespoon), cup. Countable items: unit. When selecting an existing ingredient via ingredient_id, this value is ignored — the ingredient's stored unit takes precedence."
    ),
  ingredient_id: z
    .string()
    .uuid()
    .optional()
    .describe(
      "UUID of an existing ingredient from the master list. Pass this (from list_ingredients) to guarantee an exact match and avoid case-mismatch duplicates. Omit only when intentionally creating a new ingredient by name."
    ),
};

function createMcpServer() {
  const server = new McpServer({ name: "meal-guru", version: "1.0.0" });
  const supabase = createServiceRoleClient();

  server.registerTool(
    "list_recipes",
    {
      title: "List Recipes",
      description:
        "Returns all recipes ordered by name, each with their full ingredient list (amounts, units, and master ingredient details). Use this to discover recipe IDs or browse what exists. For a single recipe's details, prefer get_recipe with a known ID.",
    },
    async () => {
      const recipes = await getRecipes(supabase);
      return {
        content: [{ type: "text", text: JSON.stringify(recipes, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_recipe",
    {
      title: "Get Recipe",
      description:
        "Returns a single recipe by UUID, including its full nested ingredient list. Returns isError: true if not found — always check before proceeding. Use list_recipes first if you need to discover the ID.",
      inputSchema: { id: z.string().uuid().describe("The recipe UUID") },
    },
    async ({ id }) => {
      const recipe = await getRecipe(supabase, id);
      if (!recipe) {
        return {
          content: [{ type: "text", text: `Recipe ${id} not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_recipe",
    {
      title: "Create Recipe",
      description:
        "Creates a new recipe with a list of ingredients and optional instruction steps, all in one atomic operation. Ingredients are upserted by name — if an ingredient with that name already exists in the master list it is reused, otherwise a new one is created. To guarantee an exact match, call list_ingredients first and pass ingredient_id. Note: ingredient category is not set here — use upsert_ingredient separately if you need to assign a category to a new ingredient. Steps use ingredient_indices (zero-based positions into the ingredients array) rather than UUIDs, because recipe_ingredient IDs do not exist yet at creation time — the server resolves them automatically.",
      inputSchema: {
        name: z.string().min(1).describe("Recipe name"),
        ingredients: z
          .array(z.object(ingredientInputShape))
          .describe("List of ingredients with amounts and units"),
        steps: z
          .array(z.object(stepDraftInputShape))
          .optional()
          .describe(
            "Optional instruction steps to create alongside the recipe. Each step references ingredients by their zero-based index in the ingredients array above. Omit or pass undefined to create a recipe with no steps."
          ),
      },
    },
    async ({ name, ingredients, steps }) => {
      const recipe = await createRecipeWithIngredients(
        supabase,
        name,
        ingredients,
        steps
      );
      return {
        content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_recipe",
    {
      title: "Update Recipe",
      description:
        "Replaces a recipe's name, full ingredient list, and optionally its instruction steps. This is a full replacement — all existing ingredient rows (and steps, if provided) are deleted and recreated from scratch. Always pass the complete desired ingredient list, including rows you want to keep. The same ingredient upsert-by-name logic applies as in create_recipe. Steps use ingredient_indices (zero-based positions into the ingredients array) rather than UUIDs, because the new recipe_ingredient IDs are generated during this call — the server resolves them automatically. If steps is omitted, existing steps are left unchanged; pass an empty array to explicitly clear all steps.",
      inputSchema: {
        id: z.string().uuid().describe("The recipe UUID to update"),
        name: z.string().min(1).describe("New recipe name"),
        ingredients: z
          .array(z.object(ingredientInputShape))
          .describe("Complete replacement ingredient list"),
        steps: z
          .array(z.object(stepDraftInputShape))
          .optional()
          .describe(
            "Optional replacement instruction steps. Each step references ingredients by their zero-based index in the ingredients array above. Omit to leave existing steps unchanged; pass an empty array to clear all steps."
          ),
      },
    },
    async ({ id, name, ingredients, steps }) => {
      const recipe = await updateRecipeWithIngredients(
        supabase,
        id,
        name,
        ingredients,
        steps
      );
      return {
        content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_recipe",
    {
      title: "Delete Recipe",
      description:
        "Permanently deletes a recipe and its ingredient associations. This cannot be undone. The master ingredients themselves are NOT deleted — they remain available in the ingredient library for other recipes.",
      inputSchema: {
        id: z.string().uuid().describe("The recipe UUID to delete"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) => {
      await deleteRecipe(supabase, id);
      return { content: [{ type: "text", text: `Recipe ${id} deleted.` }] };
    }
  );

  server.registerTool(
    "list_ingredients",
    {
      title: "List Ingredients",
      description:
        "Returns the master ingredient catalogue — all ingredients that exist across any recipe, ordered by name. Each entry includes id, name, unit, and category. Call this before create_recipe or update_recipe when you want to pass ingredient_id for exact matching rather than relying on name-based upsert. Ingredients are shared across recipes — the same ingredient record is reused every time it appears.",
    },
    async () => {
      const ingredients = await getIngredients(supabase);
      return {
        content: [{ type: "text", text: JSON.stringify(ingredients, null, 2) }],
      };
    }
  );

  server.registerTool(
    "upsert_ingredient",
    {
      title: "Upsert Ingredient",
      description:
        "Creates a new ingredient or updates an existing one matched by name (case-sensitive). Use this specifically to set or correct the category or default unit on a master ingredient. Do NOT call this just to add an ingredient to a recipe — create_recipe and update_recipe handle ingredient creation automatically. Categories: produce (fresh fruit/veg), tins (canned goods), dairy, meat, pantry (dry goods, oils, condiments). Omit category (or pass null) if unsure.",
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe("Ingredient name (case-sensitive match key)"),
        unit: z.enum(UNITS).describe("Default unit for this ingredient"),
        category: z
          .enum(CATEGORIES)
          .nullable()
          .optional()
          .describe(
            "Grocery category: produce, tins, dairy, meat, pantry, or null"
          ),
      },
    },
    async ({ name, unit, category }) => {
      const ingredient = await upsertIngredient(supabase, {
        name,
        unit,
        category: (category ?? null) as Category,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(ingredient, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_ingredient",
    {
      title: "Update Ingredient",
      description:
        "Updates an ingredient's name, unit, and/or category by its UUID. Use this to fix ingredients that were imported with the wrong category or unit. Unlike upsert_ingredient (which matches by name), this targets a specific record by ID. Call list_ingredients first to get the ID.",
      inputSchema: {
        id: z.string().uuid().describe("The ingredient UUID to update"),
        name: z.string().min(1).describe("New ingredient name"),
        unit: z
          .enum(UNITS)
          .describe(
            "Unit of measurement. Dry weights: g, kg, oz, lb. Liquids: ml, l. Small measures: tsp (teaspoon), tbsp (tablespoon), cup. Countable items: unit."
          ),
        category: z
          .enum(CATEGORIES)
          .nullable()
          .optional()
          .describe(
            "Grocery category: produce, tins, dairy, meat, pantry, or null"
          ),
      },
    },
    async ({ id, name, unit, category }) => {
      const ingredient = await updateIngredient(supabase, id, {
        name,
        unit,
        category: (category ?? null) as Category,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(ingredient, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_ingredient",
    {
      title: "Delete Ingredient",
      description:
        "Permanently deletes an ingredient from the master library. Will fail if the ingredient is still referenced by any recipe — remove it from all recipes first. This cannot be undone.",
      inputSchema: {
        id: z.string().uuid().describe("The ingredient UUID to delete"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) => {
      await deleteIngredient(supabase, id);
      return { content: [{ type: "text", text: `Ingredient ${id} deleted.` }] };
    }
  );

  server.registerTool(
    "recommend_recipes",
    {
      title: "Recommend Recipes",
      description:
        "Returns recommended recipe IDs, excluding recently cooked recipes. Uses shop history to avoid repeating meals from the last N days. Falls back to picking from all recipes if too few candidates remain after filtering.",
      inputSchema: {
        count: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Number of recipe IDs to return (default 2)"),
        exclude_days: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe(
            "Exclude recipes cooked within this many days (default 14)"
          ),
      },
    },
    async ({ count, exclude_days }) => {
      const recipeIds = await recommendRecipeIds(supabase, count, exclude_days);
      return {
        content: [
          { type: "text", text: JSON.stringify({ recipeIds }, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    "list_steps",
    {
      title: "List Steps",
      description:
        "Returns all instruction steps for a recipe, ordered by step_number. Each step includes its id, recipe_id, step_number, instruction text, created_at, and ingredient_ids. The ingredient_ids are recipe_ingredient row UUIDs (the join-table rows from the recipe's ingredients[] array), not master ingredient IDs from list_ingredients — use them to cross-reference which ingredients are used in a given step. Returns an empty array if the recipe has no steps.",
      inputSchema: {
        recipe_id: z
          .string()
          .uuid()
          .describe("UUID of the recipe whose steps to fetch"),
      },
    },
    async ({ recipe_id }) => {
      const steps = await getRecipeSteps(supabase, recipe_id);
      return {
        content: [{ type: "text", text: JSON.stringify(steps, null, 2) }],
      };
    }
  );

  server.registerTool(
    "set_steps",
    {
      title: "Set Steps",
      description:
        "Replaces all instruction steps for a recipe. This is a full replacement — all existing steps are deleted atomically and the provided list is inserted in their place. Use for both initial step creation and subsequent edits. Pass an empty array to clear all steps. Each step requires a step_number (used for ordering and as the key that maps ingredient_ids back to inserted rows — must be unique within the call), an instruction string, and an ingredient_ids array. ingredient_ids must be recipe_ingredient row UUIDs (the id field on items in a recipe's ingredients[] array, obtained from get_recipe or list_recipes) — these are NOT master ingredient IDs from list_ingredients. Omit ingredient_ids or pass an empty array for steps that do not reference specific ingredients.",
      inputSchema: {
        recipe_id: z
          .string()
          .uuid()
          .describe("UUID of the recipe whose steps to replace"),
        steps: z
          .array(
            z.object({
              step_number: z
                .number()
                .int()
                .positive()
                .describe(
                  "Step order number (1-based, unique within this call). Drives display order and is used internally to match ingredient_ids to inserted rows."
                ),
              instruction: z
                .string()
                .min(1)
                .describe("Full instruction text for this step"),
              ingredient_ids: z
                .array(z.string().uuid())
                .describe(
                  "recipe_ingredient row UUIDs referenced by this step (from recipe.ingredients[].id, NOT from list_ingredients). Pass an empty array if the step does not highlight specific ingredients."
                ),
            })
          )
          .describe(
            "Complete replacement list of steps. Pass an empty array to clear all steps for the recipe."
          ),
      },
    },
    async ({ recipe_id, steps }) => {
      const result = await setRecipeSteps(supabase, recipe_id, steps);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    "update_shop_status",
    {
      title: "Update Shop Status",
      description:
        'Transitions a shop between lifecycle phases. A shop starts in "shopping" status (the user is buying groceries) and moves to "cooking" status when all items have been purchased and the user is ready to cook. This is a one-way progression in normal usage: shopping → cooking. Accepts the shop UUID and the target status.',
      inputSchema: {
        id: z.string().uuid().describe("The shop UUID to update"),
        status: z
          .enum(["shopping", "cooking"])
          .describe(
            'The new status for the shop. "shopping" means the user is still buying groceries; "cooking" means shopping is complete and the user is ready to cook the recipes.'
          ),
      },
    },
    async ({ id, status }) => {
      await updateShopStatus(supabase, id, status);
      return {
        content: [
          {
            type: "text",
            text: `Shop ${id} status updated to "${status}".`,
          },
        ],
      };
    }
  );

  return server;
}

export const ALL: APIRoute = async ({ request }) => {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({});
  await server.connect(transport);
  return transport.handleRequest(request);
};

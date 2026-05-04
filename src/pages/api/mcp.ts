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
  getRecipes,
  recommendRecipeIds,
  updateIngredient,
  updateRecipeWithIngredients,
  upsertIngredient,
} from "@/lib/database";

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

  server.registerTool(
    "list_recipes",
    {
      title: "List Recipes",
      description:
        "Returns all recipes ordered by name, each with their full ingredient list (amounts, units, and master ingredient details). Use this to discover recipe IDs or browse what exists. For a single recipe's details, prefer get_recipe with a known ID.",
    },
    async () => {
      const recipes = await getRecipes();
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
      const recipe = await getRecipe(id);
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
        "Creates a new recipe with a list of ingredients. Ingredients are upserted by name — if an ingredient with that name already exists in the master list it is reused, otherwise a new one is created. To guarantee an exact match, call list_ingredients first and pass ingredient_id. Note: ingredient category is not set here — use upsert_ingredient separately if you need to assign a category to a new ingredient.",
      inputSchema: {
        name: z.string().min(1).describe("Recipe name"),
        ingredients: z
          .array(z.object(ingredientInputShape))
          .describe("List of ingredients with amounts and units"),
      },
    },
    async ({ name, ingredients }) => {
      const recipe = await createRecipeWithIngredients(name, ingredients);
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
        "Replaces a recipe's name and full ingredient list. This is a full replacement — all existing ingredient rows are deleted and recreated from scratch. Always pass the complete desired ingredient list, including rows you want to keep. The same ingredient upsert-by-name logic applies as in create_recipe.",
      inputSchema: {
        id: z.string().uuid().describe("The recipe UUID to update"),
        name: z.string().min(1).describe("New recipe name"),
        ingredients: z
          .array(z.object(ingredientInputShape))
          .describe("Complete replacement ingredient list"),
      },
    },
    async ({ id, name, ingredients }) => {
      const recipe = await updateRecipeWithIngredients(id, name, ingredients);
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
      await deleteRecipe(id);
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
      const ingredients = await getIngredients();
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
      const ingredient = await upsertIngredient({
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
      const ingredient = await updateIngredient(id, {
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
      await deleteIngredient(id);
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
      const recipeIds = await recommendRecipeIds(count, exclude_days);
      return {
        content: [
          { type: "text", text: JSON.stringify({ recipeIds }, null, 2) },
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

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import Anthropic from "@anthropic-ai/sdk";
import {
  createIngredient,
  createRecipe,
  getAllIngredients,
} from "../lib/database.js";

// Define input schemas
const parseRecipeSchema = z.object({
  text: z.string().min(1, "Recipe text is required"),
});

const saveRecipeSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Recipe name must be at least 3 characters"),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number().positive(),
      unit: z.enum([
        "g",
        "kg",
        "ml",
        "l",
        "tsp",
        "tbsp",
        "cup",
        "oz",
        "lb",
        "unit",
      ]),
      shelf: z.boolean(),
      source: z.object({
        url: z.string(),
        price: z.number().min(0),
        amount: z.number().positive(),
      }),
      created_at: z.string().default(new Date().toISOString()),
      isExisting: z.boolean().optional(),
    })
  ),
});

// Parse recipe text using Claude API
export const server = {
  parseRecipe: defineAction({
    input: parseRecipeSchema,
    handler: async ({ text }) => {
      try {
        // Fetch existing ingredients from database
        let existingIngredients: Awaited<ReturnType<typeof getAllIngredients>> =
          [];
        try {
          existingIngredients = await getAllIngredients();
        } catch (dbError) {
          console.warn("Failed to fetch existing ingredients:", dbError);
        }

        const apiKey = import.meta.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Anthropic API key not configured",
          });
        }

        const anthropic = new Anthropic({
          apiKey: apiKey,
        });

        // Format existing ingredients for LLM
        const existingIngredientsText =
          existingIngredients.length > 0
            ? `\n\nEXISTING INGREDIENTS IN DATABASE:\n${existingIngredients
                .map(
                  (ing) =>
                    `- "${ing.name}" (id: ${ing.id}, unit: ${ing.unit}, shelf: ${ing.shelf})`
                )
                .join("\n")}`
            : "";

        const prompt = `Extract recipe information from the following text and format it as JSON according to this TypeScript interface:

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "oz" | "lb" | "unit";
  source: {
    url: string;
    price: number;
    amount: number;
  };
  shelf: boolean;
  isExisting?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

Instructions:
1. **INGREDIENT MATCHING**: First check if ingredients match existing ones in the database (see list below). If found, use the EXACT name, id, unit, and shelf value from the database. Set isExisting: true for these.
2. **NEW INGREDIENTS**: For ingredients not in database, generate kebab-case IDs (e.g., "soy-sauce", "chicken-breast") and set isExisting: false or omit.
3. **UNITS**: Only use these valid units: "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "oz", "lb", "unit"
4. **SOURCE FIELD**: Always set url to "", price to 0, amount to 0 (will be filled later)
5. **SHELF ITEMS**: Set shelf: true for pantry/spice items (oils, spices, flour, etc.), false for fresh items
6. **AMOUNTS**: Parse as numbers (convert "1/2" to 0.5, "1 1/2" to 1.5)
7. **RECIPE ID**: Generate kebab-case ID for recipe
8. **LANGUAGE**: Translate any recipe text to English if needed
${existingIngredientsText}

Text to parse:
${text}

Return ONLY the JSON object for the recipe, no other text or explanation.`;

        const message = await anthropic.messages.create({
          model: "claude-3-5-haiku-latest",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const responseText =
          message.content[0].type === "text" ? message.content[0].text : "";

        let parsedRecipe: z.output<typeof saveRecipeSchema>;
        try {
          parsedRecipe = JSON.parse(responseText);
        } catch (_parseError) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Failed to parse recipe from LLM response",
          });
        }

        // Create a lookup map for existing ingredients by name (case-insensitive)
        const ingredientLookup = new Map(
          existingIngredients.map((ing) => [ing.name.toLowerCase(), ing])
        );

        // Post-process ingredients to enrich with database source information
        if (parsedRecipe.ingredients) {
          parsedRecipe.ingredients = parsedRecipe.ingredients.map(
            (ingredient) => {
              const existingIngredient = ingredientLookup.get(
                ingredient.name.toLowerCase()
              );

              if (existingIngredient && ingredient.isExisting) {
                return {
                  ...ingredient,
                  source: existingIngredient.source,
                  name: existingIngredient.name,
                  unit: existingIngredient.unit,
                  shelf: existingIngredient.shelf,
                  id: existingIngredient.id,
                  created_at: existingIngredient.created_at,
                };
              }

              return ingredient;
            }
          );
        }

        return parsedRecipe;
      } catch (error) {
        console.error("Error calling Claude API:", error);
        if (error instanceof ActionError) {
          throw error;
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse recipe with LLM",
        });
      }
    },
  }),

  saveRecipe: defineAction({
    input: saveRecipeSchema,
    handler: async ({ name, ingredients }) => {
      try {
        // First, create any new ingredients
        const processedIngredients = [];

        for (let i = 0; i < ingredients.length; i++) {
          const ingredient = ingredients[i];

          if (ingredient.isExisting) {
            // Use existing ingredient ID
            processedIngredients.push({
              ingredient_id: ingredient.id,
              amount: ingredient.amount,
              order_index: i,
            });
          } else {
            // Create new ingredient
            try {
              const newIngredient = await createIngredient({
                name: ingredient.name,
                unit: ingredient.unit,
                source: ingredient.source,
                shelf: ingredient.shelf,
              });

              processedIngredients.push({
                ingredient_id: newIngredient.id || ingredient.id,
                amount: ingredient.amount,
                order_index: i,
              });
            } catch (error) {
              console.error(
                `Failed to create ingredient ${ingredient.name}:`,
                error
              );
              throw new ActionError({
                code: "BAD_REQUEST",
                message: `Failed to create ingredient: ${ingredient.name}`,
              });
            }
          }
        }

        // Create the recipe
        const newRecipe = await createRecipe({ name }, processedIngredients);

        return {
          success: true,
          recipe: newRecipe,
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("Error creating recipe:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save recipe to database",
        });
      }
    },
  }),
};

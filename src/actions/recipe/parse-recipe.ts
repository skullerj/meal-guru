import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import Anthropic from "@anthropic-ai/sdk";
import { getAllIngredients } from "../../lib/database";
import { saveRecipeSchema } from "./schemas";

const getPrompt = (
  existingIngredients: string,
  text: string
) => `Extract recipe information from the following text and format it as JSON according to this TypeScript interface:

interface RecipeIngredient {
  amount: number;
  ingredient: {
    id: string;
    name: string;
    unit: "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "oz" | "lb" | "unit";
    source: {
      url: string;
      price: number;
      amount: number;
    } | null;
    shelf: boolean;
  }
}

interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

Instructions:
1. **RECIPE INGREDIENT MATCHING**: First check if the ingredients match existing ones in the database (see list below). If found add a RecipeIngredient and set its "ingredient" field to the found one, othwerwise try to fill the ingredient as best as you can.
2. **NEW INGREDIENTS**: For ingredients not in database, add an entry into Recipe's ingredient with the matching fields, and fill the ingredient info as best as you can.
3. **UNITS**: Only use these valid units: "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "oz", "lb", "unit"
4. **SOURCE FIELD**: Set source field to null if the ingredient was not found
5. **SHELF ITEMS**: Set shelf: true for pantry/spice items (oils, spices, flour, etc.), false for fresh items
6. **AMOUNTS**: Parse as numbers (convert "1/2" to 0.5, "1 1/2" to 1.5)
7. **RECIPE ID**: Generate kebab-case ID for recipe
8. **LANGUAGE**: Translate any recipe text to English if needed
${existingIngredients}

Text to parse:
${text}

Return ONLY the JSON object for the recipe, no other text or explanation.`;

const parseRecipeSchema = z.object({
  text: z.string().min(1, "Recipe text is required"),
});

export default defineAction({
  input: parseRecipeSchema,
  handler: async ({ text }) => {
    try {
      const existingIngredients = await getAllIngredients();

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

      const prompt = getPrompt(existingIngredientsText, text);
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
        parsedRecipe = saveRecipeSchema.parse(JSON.parse(responseText));
      } catch (_parseError) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Failed to parse recipe from LLM response",
        });
      }
      const ingredientLookup = new Map(
        existingIngredients.map((ing) => [ing.id, ing])
      );

      parsedRecipe.ingredients = parsedRecipe.ingredients.map((ing) => {
        const existing = ing.ingredient?.id
          ? ingredientLookup.get(ing.ingredient?.id)
          : null;
        if (existing) {
          return {
            ...ing,
            ingredient: existing,
          };
        }
        return ing;
      });

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
});

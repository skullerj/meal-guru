import Anthropic from "@anthropic-ai/sdk";
import type { APIRoute } from "astro";
export const prerender = false; // Disable prerendering for this API route

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const prompt = `Extract recipe information from the following text and format it as JSON according to this TypeScript interface:

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  source: {
    url: string;
    price: number;
    amount: number;
  };
  shelf: boolean;
}

interface InstructionStep {
  text: string;
  ingredientIds: string[];
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
}

Instructions:
1. Generate a kebab-case ID for the recipe and each ingredient (e.g., "chicken-stir-fry", "soy-sauce")
2. For the source field: set url to empty string "", price to 0, and amount to 0 (will be filled by user later)
3. Set shelf to true for common pantry/spice items (oils, spices, flour, etc.), false for fresh items
4. For ingredientIds in instructions, match ingredient IDs where the ingredient is mentioned in that step
5. Parse amounts as numbers (convert fractions like "1/2" to 0.5)
6. Use standard units (tbsp, tsp, cup, g, ml, etc.)

Text to parse:
${text}

Return ONLY the JSON object for the recipe, no other text or explanation.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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

    try {
      // Try to parse the response as JSON
      const parsedRecipe = JSON.parse(responseText);

      return new Response(JSON.stringify({ recipe: parsedRecipe }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing Claude response as JSON:", parseError);
      return new Response(
        JSON.stringify({
          error: "Failed to parse recipe from LLM response",
          rawResponse: responseText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to parse recipe with LLM",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

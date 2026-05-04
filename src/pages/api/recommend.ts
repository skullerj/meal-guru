import type { APIRoute } from "astro";
import { recommendRecipeIds } from "@/lib/database";

export const POST: APIRoute = async ({ request }) => {
  let count: number | undefined;
  let excludeDays: number | undefined;

  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text);
      count = body.count;
      excludeDays = body.excludeDays;
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const recipeIds = await recommendRecipeIds(count, excludeDays);
    return new Response(JSON.stringify({ recipeIds }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

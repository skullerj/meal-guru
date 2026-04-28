import type { APIRoute } from "astro";
import type { Category, Unit } from "@/data/types";
import { updateIngredient } from "@/lib/database";

export const POST: APIRoute = async ({ request }) => {
  let body: { id: string; name: string; unit: Unit; category: Category | null };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id, name, unit, category } = body;
  if (!id || !name || !unit) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const ingredient = await updateIngredient(id, { name, unit, category });
    return new Response(JSON.stringify(ingredient), {
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

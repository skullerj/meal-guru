import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import {
  TEST_CREATED_INGREDIENTS,
  TEST_CREATED_RECIPES,
  TEST_INGREDIENTS,
  TEST_RECIPE_NAME,
} from "../fixtures/data";

loadEnv({ path: resolve(process.cwd(), ".env.test") });

export default async function globalSetup() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in .env.test");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Wipe all test-owned records from previous runs (recipes cascade to recipe_ingredients)
  await supabase.from("recipes").delete().in("name", TEST_CREATED_RECIPES);
  await supabase
    .from("ingredients")
    .delete()
    .in("name", TEST_CREATED_INGREDIENTS);

  // Upsert test ingredients (safe to run repeatedly)
  const { data: ingredients, error: ingError } = await supabase
    .from("ingredients")
    .upsert(TEST_INGREDIENTS, { onConflict: "name" })
    .select();
  if (ingError) throw ingError;

  // Create the test recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({ name: TEST_RECIPE_NAME })
    .select()
    .single();
  if (recipeError) throw recipeError;

  // Link both ingredients to the recipe
  const links = ingredients!.map((ing, i) => ({
    recipe_id: recipe.id,
    ingredient_id: ing.id,
    amount: i === 0 ? 200 : 150,
    order_index: i,
  }));
  const { error: riError } = await supabase
    .from("recipe_ingredients")
    .insert(links);
  if (riError) throw riError;
}

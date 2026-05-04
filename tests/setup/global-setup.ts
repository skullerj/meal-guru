import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import {
  TEST_CREATED_INGREDIENTS,
  TEST_CREATED_RECIPES,
  TEST_INGREDIENTS,
  TEST_RECIPE_NAME,
  TEST_RECIPE_NAME_2,
  TEST_RECIPE_NAME_3,
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

  // Wipe all shops from previous runs (shop_recipes cascades from shops)
  await supabase
    .from("shops")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

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
  if (!ingredients) throw new Error("Failed to upsert test ingredients");

  // Create the three seeded test recipes
  const { data: recipesInserted, error: recipesError } = await supabase
    .from("recipes")
    .insert([
      { name: TEST_RECIPE_NAME },
      { name: TEST_RECIPE_NAME_2 },
      { name: TEST_RECIPE_NAME_3 },
    ])
    .select();
  if (recipesError) throw recipesError;
  if (!recipesInserted) throw new Error("Failed to insert test recipes");

  const recipe = recipesInserted.find((r) => r.name === TEST_RECIPE_NAME);
  const recipe2 = recipesInserted.find((r) => r.name === TEST_RECIPE_NAME_2);
  const recipe3 = recipesInserted.find((r) => r.name === TEST_RECIPE_NAME_3);
  if (!recipe || !recipe2 || !recipe3)
    throw new Error("Seeded recipes missing after insert");

  // Link Spaghetti + Tomato sauce to the primary test recipe
  const spaghetti = ingredients.find((i) => i.name === "Spaghetti");
  const tomatoSauce = ingredients.find((i) => i.name === "Tomato sauce");
  const chickenBreast = ingredients.find((i) => i.name === "Chicken breast");
  if (!spaghetti || !tomatoSauce || !chickenBreast)
    throw new Error("Missing expected test ingredients after upsert");

  const links = [
    {
      recipe_id: recipe.id,
      ingredient_id: spaghetti.id,
      amount: 200,
      order_index: 0,
    },
    {
      recipe_id: recipe.id,
      ingredient_id: tomatoSauce.id,
      amount: 150,
      order_index: 1,
    },
  ];
  const { error: riError } = await supabase
    .from("recipe_ingredients")
    .insert(links);
  if (riError) throw riError;

  // Link Tomato sauce (shared) + Chicken breast (unique) to recipe 2
  const recipe2Links = [
    {
      recipe_id: recipe2.id,
      ingredient_id: tomatoSauce.id,
      amount: 200,
      order_index: 0,
    },
    {
      recipe_id: recipe2.id,
      ingredient_id: chickenBreast.id,
      amount: 300,
      order_index: 1,
    },
  ];
  const { error: ri2Error } = await supabase
    .from("recipe_ingredients")
    .insert(recipe2Links);
  if (ri2Error) throw ri2Error;

  // Export recipe IDs so specs can build shop URLs without hitting the DB
  process.env.TEST_RECIPE_ID = recipe.id;
  process.env.TEST_RECIPE_ID_2 = recipe2.id;
  process.env.TEST_RECIPE_ID_3 = recipe3.id;
}

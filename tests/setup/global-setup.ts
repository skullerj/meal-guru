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
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from "../fixtures/data";

loadEnv({ path: resolve(process.cwd(), ".env.test") });

export default async function globalSetup() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test"
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create or fetch the test user FIRST — we need the user_id for all data
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingTestUser = existingUsers?.users?.find(
    (u) => u.email === TEST_USER_EMAIL
  );

  let testUserId: string;
  if (existingTestUser) {
    testUserId = existingTestUser.id;
    await supabase.auth.admin.updateUserById(existingTestUser.id, {
      password: TEST_USER_PASSWORD,
    });
  } else {
    const { data: newUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        email_confirm: true,
      });
    if (createUserError) throw createUserError;
    testUserId = newUser.user.id;
  }

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

  // Insert test ingredients with user_id
  const ingredientsWithUser = TEST_INGREDIENTS.map((i) => ({
    ...i,
    user_id: testUserId,
  }));

  // Delete then insert (upsert onConflict changed to composite key)
  const { data: ingredients, error: ingError } = await supabase
    .from("ingredients")
    .upsert(ingredientsWithUser, { onConflict: "user_id,name" })
    .select();
  if (ingError) throw ingError;
  if (!ingredients) throw new Error("Failed to upsert test ingredients");

  // Create the three seeded test recipes with user_id
  const { data: recipesInserted, error: recipesError } = await supabase
    .from("recipes")
    .insert([
      { name: TEST_RECIPE_NAME, user_id: testUserId },
      { name: TEST_RECIPE_NAME_2, user_id: testUserId },
      { name: TEST_RECIPE_NAME_3, user_id: testUserId },
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

  // Fetch recipe_ingredient IDs for the primary recipe to link steps
  const { data: recipeIngredients, error: riSelectError } = await supabase
    .from("recipe_ingredients")
    .select("id, ingredient_id")
    .eq("recipe_id", recipe.id);
  if (riSelectError) throw riSelectError;

  const spaghettiRI = recipeIngredients?.find(
    (ri) => ri.ingredient_id === spaghetti.id
  );
  const tomatoSauceRI = recipeIngredients?.find(
    (ri) => ri.ingredient_id === tomatoSauce.id
  );
  if (!spaghettiRI || !tomatoSauceRI)
    throw new Error("Missing recipe_ingredients after insert");

  // Insert 2 recipe steps for the primary test recipe
  const { data: stepsData, error: stepsError } = await supabase
    .from("recipe_steps")
    .insert([
      {
        recipe_id: recipe.id,
        step_number: 1,
        instruction: "Boil the spaghetti in salted water for 10 minutes",
      },
      {
        recipe_id: recipe.id,
        step_number: 2,
        instruction: "Heat the tomato sauce and mix with the drained pasta",
      },
    ])
    .select();
  if (stepsError) throw stepsError;
  if (!stepsData || stepsData.length !== 2)
    throw new Error("Failed to insert test steps");

  const step1 = stepsData.find((s) => s.step_number === 1);
  const step2 = stepsData.find((s) => s.step_number === 2);
  if (!step1 || !step2) throw new Error("Missing steps after insert");

  // Link ingredients to steps
  const { error: siError } = await supabase.from("step_ingredients").insert([
    { step_id: step1.id, recipe_ingredient_id: spaghettiRI.id },
    { step_id: step2.id, recipe_ingredient_id: tomatoSauceRI.id },
    { step_id: step2.id, recipe_ingredient_id: spaghettiRI.id },
  ]);
  if (siError) throw siError;

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

import type {
  Category,
  Ingredient,
  Recipe,
  RecipeIngredient,
  RecipeStep,
  Unit,
} from "../data/types";
import { supabase } from "./supabase";

export interface IngredientInput {
  name: string;
  amount: number;
  unit: Unit;
  category?: Category | null;
  ingredient_id?: string;
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      name,
      created_at,
      ingredients:recipe_ingredients(
        id,
        recipe_id,
        ingredient_id,
        amount,
        order_index,
        ingredient:ingredients(id, name, unit, category, created_at)
      )
    `
    )
    .order("name");

  if (error) throw error;
  const recipes = (data as unknown as Recipe[]) ?? [];

  // Fetch steps for all recipes in parallel
  const stepsPerRecipe = await Promise.all(
    recipes.map((r) => getRecipeSteps(r.id))
  );

  return recipes.map((r, i) => ({ ...r, steps: stepsPerRecipe[i] }));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      name,
      created_at,
      ingredients:recipe_ingredients(
        id,
        recipe_id,
        ingredient_id,
        amount,
        order_index,
        ingredient:ingredients(id, name, unit, category, created_at)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  const recipe = data as unknown as Recipe;
  const steps = await getRecipeSteps(id);
  return { ...recipe, steps };
}

export async function createRecipe(name: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return { ...(data as Recipe), ingredients: [] };
}

export async function updateRecipe(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

export async function getIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as Ingredient[]) ?? [];
}

export async function upsertIngredient(
  ingredient: Omit<Ingredient, "id" | "created_at">
): Promise<Ingredient> {
  const { data, error } = await supabase
    .from("ingredients")
    .upsert(ingredient, { onConflict: "name" })
    .select()
    .single();
  if (error) throw error;
  return data as Ingredient;
}

export async function updateIngredient(
  id: string,
  data: { name: string; unit: Unit; category: Category | null }
): Promise<Ingredient> {
  const { data: updated, error } = await supabase
    .from("ingredients")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated as Ingredient;
}

export async function deleteIngredient(id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from("recipe_ingredients")
    .select("id", { count: "exact", head: true })
    .eq("ingredient_id", id);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(`Cannot delete: ingredient is used in ${count} recipe(s)`);
  }
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) throw error;
}

export async function setRecipeIngredients(
  recipeId: string,
  ingredients: IngredientInput[]
): Promise<RecipeIngredient[]> {
  const { error: deleteError } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", recipeId);
  if (deleteError) throw deleteError;

  const result: RecipeIngredient[] = [];

  for (let i = 0; i < ingredients.length; i++) {
    const { name, amount, unit, category, ingredient_id } = ingredients[i];

    let resolvedId: string;

    if (ingredient_id) {
      resolvedId = ingredient_id;
    } else {
      const { data: ingredient, error: ingError } = await supabase
        .from("ingredients")
        .upsert(
          { name: name.trim(), unit, category: category ?? null },
          { onConflict: "name" }
        )
        .select()
        .single();
      if (ingError) throw ingError;
      resolvedId = ingredient.id;
    }

    const { data: ri, error: riError } = await supabase
      .from("recipe_ingredients")
      .insert({
        recipe_id: recipeId,
        ingredient_id: resolvedId,
        amount,
        order_index: i,
      })
      .select(
        `id, recipe_id, ingredient_id, amount, order_index,
         ingredient:ingredients(id, name, unit, category, created_at)`
      )
      .single();
    if (riError) throw riError;

    result.push(ri as unknown as RecipeIngredient);
  }

  return result;
}

export async function createRecipeWithIngredients(
  name: string,
  ingredients: IngredientInput[],
  steps?: StepDraftInput[]
): Promise<Recipe> {
  const recipe = await createRecipe(name);
  const recipeIngredients = await setRecipeIngredients(recipe.id, ingredients);

  let savedSteps: RecipeStep[] = [];
  if (steps && steps.length > 0) {
    const stepInputs: StepInput[] = steps.map((s) => ({
      step_number: s.step_number,
      instruction: s.instruction,
      ingredient_ids: s.ingredient_indices
        .map((idx) => recipeIngredients[idx]?.id)
        .filter((id): id is string => id !== undefined),
    }));
    savedSteps = await setRecipeSteps(recipe.id, stepInputs);
  }

  return { ...recipe, ingredients: recipeIngredients, steps: savedSteps };
}

export async function updateRecipeWithIngredients(
  id: string,
  name: string,
  ingredients: IngredientInput[],
  steps?: StepDraftInput[]
): Promise<Recipe> {
  await updateRecipe(id, name);
  const recipeIngredients = await setRecipeIngredients(id, ingredients);

  let savedSteps: RecipeStep[] = [];
  if (steps && steps.length > 0) {
    const stepInputs: StepInput[] = steps.map((s) => ({
      step_number: s.step_number,
      instruction: s.instruction,
      ingredient_ids: s.ingredient_indices
        .map((idx) => recipeIngredients[idx]?.id)
        .filter((id): id is string => id !== undefined),
    }));
    savedSteps = await setRecipeSteps(id, stepInputs);
  }

  const recipe = await getRecipe(id);
  if (!recipe) throw new Error(`Recipe ${id} not found after update`);
  return { ...recipe, ingredients: recipeIngredients, steps: savedSteps };
}

// --- Feature 11: Recipe step instructions ---

export async function getRecipeSteps(recipeId: string): Promise<RecipeStep[]> {
  const { data: steps, error: stepsError } = await supabase
    .from("recipe_steps")
    .select("id, recipe_id, step_number, instruction, created_at")
    .eq("recipe_id", recipeId)
    .order("step_number");

  if (stepsError) throw stepsError;
  if (!steps || steps.length === 0) return [];

  const stepIds = steps.map((s: { id: string }) => s.id);

  const { data: links, error: linksError } = await supabase
    .from("step_ingredients")
    .select("step_id, recipe_ingredient_id")
    .in("step_id", stepIds);

  if (linksError) throw linksError;

  const linksByStep = new Map<string, string[]>();
  for (const link of links ?? []) {
    const l = link as { step_id: string; recipe_ingredient_id: string };
    const existing = linksByStep.get(l.step_id) ?? [];
    existing.push(l.recipe_ingredient_id);
    linksByStep.set(l.step_id, existing);
  }

  return steps.map(
    (s: {
      id: string;
      recipe_id: string;
      step_number: number;
      instruction: string;
      created_at: string;
    }) => ({
      id: s.id,
      recipe_id: s.recipe_id,
      step_number: s.step_number,
      instruction: s.instruction,
      created_at: s.created_at,
      ingredient_ids: linksByStep.get(s.id) ?? [],
    })
  );
}

export interface StepInput {
  step_number: number;
  instruction: string;
  ingredient_ids: string[];
}

export interface StepDraftInput {
  step_number: number;
  instruction: string;
  /** Indices into the ingredients array (positional references) */
  ingredient_indices: number[];
}

export async function setRecipeSteps(
  recipeId: string,
  steps: StepInput[]
): Promise<RecipeStep[]> {
  const { error: deleteError } = await supabase
    .from("recipe_steps")
    .delete()
    .eq("recipe_id", recipeId);

  if (deleteError) throw deleteError;

  if (steps.length === 0) return [];

  const { data: inserted, error: insertError } = await supabase
    .from("recipe_steps")
    .insert(
      steps.map((s) => ({
        recipe_id: recipeId,
        step_number: s.step_number,
        instruction: s.instruction,
      }))
    )
    .select("id, recipe_id, step_number, instruction, created_at");

  if (insertError) throw insertError;

  const insertedRows = inserted as Array<{
    id: string;
    recipe_id: string;
    step_number: number;
    instruction: string;
    created_at: string;
  }>;

  // Map step_number → inserted row id so we can match ingredient_ids
  const byStepNumber = new Map<number, string>();
  for (const row of insertedRows) {
    byStepNumber.set(row.step_number, row.id);
  }

  const linkRows: { step_id: string; recipe_ingredient_id: string }[] = [];
  for (const s of steps) {
    if (s.ingredient_ids.length === 0) continue;
    const stepId = byStepNumber.get(s.step_number);
    if (!stepId) continue;
    for (const riId of s.ingredient_ids) {
      linkRows.push({ step_id: stepId, recipe_ingredient_id: riId });
    }
  }

  if (linkRows.length > 0) {
    const { error: linkError } = await supabase
      .from("step_ingredients")
      .insert(linkRows);
    if (linkError) throw linkError;
  }

  // Return fully-populated steps with ingredient_ids
  const linksByStep = new Map<string, string[]>();
  for (const lr of linkRows) {
    const existing = linksByStep.get(lr.step_id) ?? [];
    existing.push(lr.recipe_ingredient_id);
    linksByStep.set(lr.step_id, existing);
  }

  return insertedRows.map((row) => ({
    id: row.id,
    recipe_id: row.recipe_id,
    step_number: row.step_number,
    instruction: row.instruction,
    created_at: row.created_at,
    ingredient_ids: linksByStep.get(row.id) ?? [],
  }));
}

export async function getRecentRecipeIds(withinDays = 14): Promise<string[]> {
  const cutoff = new Date(
    Date.now() - withinDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("shop_recipes")
    .select("recipe_id, shop:shops!inner(created_at)")
    .gte("shops.created_at", cutoff);

  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.recipe_id))];
}

export async function commitShop(recipeIds: string[]): Promise<{ id: string }> {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({})
    .select("id")
    .single();

  if (shopError) throw shopError;

  const rows = recipeIds.map((recipe_id) => ({
    shop_id: shop.id,
    recipe_id,
  }));
  const { error: linkError } = await supabase.from("shop_recipes").insert(rows);

  if (linkError) throw linkError;

  return { id: shop.id };
}

// --- Feature 9: Persistent Weekly Shop ---

export interface ShopSummary {
  id: string;
  week_of: string;
  active: boolean;
  created_at: string;
  recipe_ids: string[];
}

export interface ShopWithRecipes {
  id: string;
  week_of: string;
  active: boolean;
  created_at: string;
  recipes: Recipe[];
}

/**
 * Returns the ISO date string (YYYY-MM-DD) of the Monday of the given date's week.
 * Uses ISO week definition (Monday = start of week).
 */
export function getWeekMonday(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  // ISO: Monday=1 ... Sunday=7; JS getDay: Sunday=0 ... Saturday=6
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function getActiveShopForWeek(
  weekOf?: string
): Promise<ShopSummary | null> {
  const targetWeek = weekOf ?? getWeekMonday();

  const { data, error } = await supabase
    .from("shops")
    .select(
      `
      id,
      week_of,
      active,
      created_at,
      shop_recipes(recipe_id)
    `
    )
    .eq("week_of", targetWeek)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const recipeIds = (data.shop_recipes as Array<{ recipe_id: string }>).map(
    (sr) => sr.recipe_id
  );

  return {
    id: data.id as string,
    week_of: data.week_of as string,
    active: data.active as boolean,
    created_at: data.created_at as string,
    recipe_ids: recipeIds,
  };
}

export async function getShopWithRecipes(
  id: string
): Promise<ShopWithRecipes | null> {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, week_of, active, created_at")
    .eq("id", id)
    .single();

  if (shopError) {
    if (shopError.code === "PGRST116") return null;
    throw shopError;
  }

  const { data: links, error: linkError } = await supabase
    .from("shop_recipes")
    .select("recipe_id")
    .eq("shop_id", id);

  if (linkError) throw linkError;

  const recipeIds = (links ?? []).map(
    (l: { recipe_id: string }) => l.recipe_id
  );

  const recipes: Recipe[] = [];
  for (const recipeId of recipeIds) {
    const recipe = await getRecipe(recipeId);
    if (recipe) recipes.push(recipe);
  }

  return {
    id: shop.id as string,
    week_of: shop.week_of as string,
    active: shop.active as boolean,
    created_at: shop.created_at as string,
    recipes,
  };
}

export async function createShop(
  recipeIds: string[],
  weekOf?: string
): Promise<{ id: string }> {
  const targetWeek = weekOf ?? getWeekMonday();

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({ week_of: targetWeek, active: true })
    .select("id")
    .single();

  if (shopError) throw shopError;

  const rows = recipeIds.map((recipe_id) => ({
    shop_id: shop.id,
    recipe_id,
  }));
  const { error: linkError } = await supabase.from("shop_recipes").insert(rows);

  if (linkError) throw linkError;

  return { id: shop.id as string };
}

export async function deactivateShopsForWeek(weekOf: string): Promise<void> {
  const { error } = await supabase
    .from("shops")
    .update({ active: false })
    .eq("week_of", weekOf)
    .eq("active", true);

  if (error) throw error;
}

export async function recommendRecipeIds(
  count = 2,
  excludeDays = 14
): Promise<string[]> {
  const recentIds = await getRecentRecipeIds(excludeDays);

  const { data: allRecipes, error } = await supabase
    .from("recipes")
    .select("id");

  if (error) throw error;

  const allIds = (allRecipes ?? []).map((r: { id: string }) => r.id);

  let candidates = allIds.filter((id) => !recentIds.includes(id));

  // Fall back to all recipes if not enough candidates after filtering
  if (candidates.length < count) {
    candidates = [...allIds];
  }

  // Fisher-Yates shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, count);
}

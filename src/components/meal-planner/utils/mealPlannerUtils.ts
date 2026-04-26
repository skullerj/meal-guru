import type { Category, Recipe, Unit } from "@/data/types";

export interface AggregatedIngredient {
  ingredient_id: string;
  name: string;
  unit: Unit;
  category: Category | null;
  totalAmount: number;
}

export interface IngredientGroup {
  category: string;
  ingredients: AggregatedIngredient[];
}

const CATEGORY_ORDER = ["produce", "tins", "dairy", "meat", "pantry", "other"];

export function aggregateIngredients(
  recipes: Recipe[],
  selectedIds: string[]
): IngredientGroup[] {
  const selected = recipes.filter((r) => selectedIds.includes(r.id));

  const totals = new Map<string, AggregatedIngredient>();

  for (const recipe of selected) {
    for (const ri of recipe.ingredients) {
      const key = ri.ingredient_id;
      const existing = totals.get(key);
      if (existing) {
        existing.totalAmount += ri.amount;
      } else {
        totals.set(key, {
          ingredient_id: ri.ingredient_id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          category: ri.ingredient.category,
          totalAmount: ri.amount,
        });
      }
    }
  }

  const grouped = new Map<string, AggregatedIngredient[]>();

  for (const ingredient of totals.values()) {
    const key = ingredient.category ?? "other";
    const list = grouped.get(key) ?? [];
    list.push(ingredient);
    grouped.set(key, list);
  }

  return CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => ({
    category: cat,
    ingredients: (grouped.get(cat) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }));
}

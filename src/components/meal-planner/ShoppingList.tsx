import { useState } from "react";
import Icon from "@/components/shared/Icon";
import type { ShopIngredient } from "@/lib/database";
import { cn } from "@/lib/utils";
import type { IngredientGroup } from "./utils/mealPlannerUtils";

interface ShoppingListProps {
  groups: IngredientGroup[];
  shopIngredients?: ShopIngredient[];
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  bakery: "Bakery",
  dairy: "Dairy",
  meat: "Meat",
  canned: "Canned Goods",
  condiments: "Condiments",
  oils: "Oils",
  spices: "Spices",
  grains: "Grains & Pasta",
  frozen: "Frozen",
  other: "Other",
};

export default function ShoppingList({
  groups,
  shopIngredients,
}: ShoppingListProps) {
  const isPersisted = !!shopIngredients && shopIngredients.length > 0;

  const [checked, setChecked] = useState<Set<string>>(
    () =>
      new Set<string>(
        isPersisted
          ? shopIngredients
              .filter((si) => si.checked)
              .map((si) => si.ingredient_id)
          : []
      )
  );

  const shopIngredientMap = new Map<string, string>(
    isPersisted ? shopIngredients.map((si) => [si.ingredient_id, si.id]) : []
  );

  function toggleChecked(ingredientId: string) {
    const newChecked = !checked.has(ingredientId);

    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });

    if (isPersisted) {
      const shopIngredientId = shopIngredientMap.get(ingredientId);
      if (shopIngredientId) {
        import("astro:actions").then(({ actions }) =>
          actions.shops.toggleIngredient({
            id: shopIngredientId,
            checked: newChecked,
          })
        );
      }
    }
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Select recipes to see your shopping list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const unchecked = group.ingredients.filter(
          (i) => !checked.has(i.ingredient_id)
        );
        const checkedItems = group.ingredients.filter((i) =>
          checked.has(i.ingredient_id)
        );
        const sorted = [...unchecked, ...checkedItems];

        return (
          <div key={group.category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {CATEGORY_LABELS[group.category] ?? group.category}
            </h3>
            <ul className="space-y-0">
              {sorted.map((ingredient) => {
                const isChecked = checked.has(ingredient.ingredient_id);
                return (
                  <li
                    key={ingredient.ingredient_id}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    className={cn(
                      "flex items-center gap-3 py-3 border-b border-border/50 last:border-0",
                      "cursor-pointer select-none active:bg-accent/50 transition-colors"
                    )}
                    onClick={() => toggleChecked(ingredient.ingredient_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleChecked(ingredient.ingredient_id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 flex items-center justify-center size-6 rounded-full",
                        isChecked
                          ? "bg-[var(--success)]"
                          : "border-2 border-border"
                      )}
                    >
                      {isChecked && (
                        <Icon
                          name="check"
                          size="xs"
                          className="text-[var(--success-foreground)]"
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-1 text-base inline-flex items-center gap-1.5",
                        isChecked
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {ingredient.name}
                      {ingredient.recipeCount > 1 && (
                        <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 no-underline">
                          ×{ingredient.recipeCount}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-base whitespace-nowrap",
                        isChecked
                          ? "line-through text-muted-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {ingredient.totalAmount} {ingredient.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

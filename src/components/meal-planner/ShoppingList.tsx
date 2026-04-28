import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import type { IngredientGroup } from "./utils/mealPlannerUtils";

interface ShoppingListProps {
  groups: IngredientGroup[];
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  tins: "Tins",
  dairy: "Dairy",
  meat: "Meat",
  pantry: "Pantry",
  other: "Other",
};

export default function ShoppingList({ groups }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggleChecked(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
                          ? "bg-green-600"
                          : "border-2 border-border"
                      )}
                    >
                      {isChecked && (
                        <Icon name="check" size="xs" className="text-white" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-1 text-base",
                        isChecked
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {ingredient.name}
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

      <div className="pt-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Done shopping
        </Button>
      </div>
    </div>
  );
}

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
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {CATEGORY_LABELS[group.category] ?? group.category}
          </h3>
          <ul className="space-y-1">
            {group.ingredients.map((ingredient) => (
              <li
                key={ingredient.ingredient_id}
                className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-foreground">
                  {ingredient.name}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {ingredient.totalAmount} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

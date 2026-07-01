import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/shared/Icon";
import type { ShopIngredient } from "@/lib/database";
import { toggleShopIngredient } from "@/lib/database";
import { queryKeys } from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import type {
  AggregatedIngredient,
  IngredientGroup,
} from "./utils/mealPlannerUtils";

interface ShoppingListProps {
  groups: IngredientGroup[];
  shopIngredients?: ShopIngredient[];
  shopId?: string;
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

const ENTRANCE_ANIMATION_MS = 300;
const RECENTLY_CHANGED_TIMEOUT_MS = 400;

export default function ShoppingList({
  groups,
  shopIngredients,
  shopId,
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

  const [recentlyChanged, setRecentlyChanged] = useState<Set<string>>(
    () => new Set<string>()
  );
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const shopIngredientMap = new Map<string, string>(
    isPersisted ? shopIngredients.map((si) => [si.ingredient_id, si.id]) : []
  );

  const markRecentlyChanged = useCallback((ingredientId: string) => {
    setRecentlyChanged((prev) => {
      const next = new Set(prev);
      next.add(ingredientId);
      return next;
    });

    const existingTimer = timersRef.current.get(ingredientId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      setRecentlyChanged((prev) => {
        const next = new Set(prev);
        next.delete(ingredientId);
        return next;
      });
      timersRef.current.delete(ingredientId);
    }, RECENTLY_CHANGED_TIMEOUT_MS);

    timersRef.current.set(ingredientId, timer);
  }, []);

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

    markRecentlyChanged(ingredientId);

    if (isPersisted) {
      const shopIngredientId = shopIngredientMap.get(ingredientId);
      if (shopIngredientId) {
        toggleShopIngredient(supabase, shopIngredientId, newChecked).then(
          () => {
            if (shopId) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.shopIngredients(shopId),
              });
            }
          }
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

  const allIngredients: AggregatedIngredient[] = groups.flatMap(
    (g) => g.ingredients
  );
  const checkedItems = allIngredients.filter((i) =>
    checked.has(i.ingredient_id)
  );
  const checkedCount = checkedItems.length;

  const entranceStyle = `
@keyframes shopping-list-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

  return (
    <div className="space-y-6">
      <style>{entranceStyle}</style>

      {groups.map((group) => {
        const uncheckedItems = group.ingredients.filter(
          (i) => !checked.has(i.ingredient_id)
        );

        if (uncheckedItems.length === 0) {
          return null;
        }

        return (
          <div key={group.category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {CATEGORY_LABELS[group.category] ?? group.category}
            </h3>
            <div className="space-y-0">
              {uncheckedItems.map((ingredient) => (
                <IngredientRow
                  key={ingredient.ingredient_id}
                  ingredient={ingredient}
                  isChecked={false}
                  isRecentlyChanged={recentlyChanged.has(
                    ingredient.ingredient_id
                  )}
                  onToggle={toggleChecked}
                />
              ))}
            </div>
          </div>
        );
      })}

      {checkedCount > 0 && (
        <div>
          <button
            type="button"
            className="flex w-full items-center gap-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setCompletedExpanded((prev) => !prev)}
          >
            <Icon
              name="chevron-down"
              size="xs"
              className={cn(
                "transition-transform duration-200",
                !completedExpanded && "-rotate-90"
              )}
            />
            Completed ({checkedCount})
          </button>
          {completedExpanded && (
            <div className="space-y-0">
              {checkedItems.map((ingredient) => (
                <IngredientRow
                  key={ingredient.ingredient_id}
                  ingredient={ingredient}
                  isChecked={true}
                  isRecentlyChanged={recentlyChanged.has(
                    ingredient.ingredient_id
                  )}
                  onToggle={toggleChecked}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface IngredientRowProps {
  ingredient: AggregatedIngredient;
  isChecked: boolean;
  isRecentlyChanged: boolean;
  onToggle: (ingredientId: string) => void;
}

function IngredientRow({
  ingredient,
  isChecked,
  isRecentlyChanged,
  onToggle,
}: IngredientRowProps) {
  return (
    <label
      className={cn(
        "relative flex items-center gap-3 py-3 border-b border-border/50 last:border-0",
        "cursor-pointer select-none active:bg-accent/50 transition-colors"
      )}
      style={
        isRecentlyChanged
          ? {
              animation: `shopping-list-enter ${ENTRANCE_ANIMATION_MS}ms ease-out`,
            }
          : undefined
      }
    >
      <input
        type="checkbox"
        className="absolute inset-0 opacity-0 cursor-pointer"
        checked={isChecked}
        onChange={() => onToggle(ingredient.ingredient_id)}
      />
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center size-6 rounded-full",
          isChecked ? "bg-[var(--success)]" : "border-2 border-border"
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
          isChecked ? "line-through text-muted-foreground" : "text-foreground"
        )}
      >
        {ingredient.name}
        {ingredient.recipeCount > 1 && (
          <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 no-underline">
            &times;{ingredient.recipeCount}
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
    </label>
  );
}

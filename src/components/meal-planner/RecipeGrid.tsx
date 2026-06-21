import type { Recipe } from "@/data/types";
import { cn } from "@/lib/utils";

interface RecipeGridProps {
  recipes: Recipe[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function RecipeGrid({
  recipes,
  selectedIds,
  onToggle,
}: RecipeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {recipes.map((recipe) => {
        const isSelected = selectedIds.includes(recipe.id);
        return (
          <button
            key={recipe.id}
            type="button"
            onClick={() => onToggle(recipe.id)}
            className={cn(
              "text-left rounded-lg border p-4 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent"
            )}
          >
            <p className="font-medium text-foreground leading-snug">
              {recipe.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {recipe.ingredients.length}{" "}
              {recipe.ingredients.length === 1 ? "ingredient" : "ingredients"}
            </p>
          </button>
        );
      })}
    </div>
  );
}

import type { Recipe } from "@/data/types";
import { cn } from "@/lib/utils";

const MAX_DOTS = 4;
const MAX_NAMES = 3;

interface PickableRecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  sharedNames: string[];
  showPairing: boolean;
  /** Increments on every selection change so the settle animation restarts. */
  settleKey: number;
  onToggle: (id: string) => void;
}

export default function PickableRecipeCard({
  recipe,
  isSelected,
  sharedNames,
  showPairing,
  settleKey,
  onToggle,
}: PickableRecipeCardProps) {
  const dotNames = sharedNames.slice(0, MAX_DOTS);
  const visibleNames = sharedNames.slice(0, MAX_NAMES);
  const remaining = sharedNames.length - visibleNames.length;

  // Alternating class names restart the CSS animation on each reorder.
  const settleClass =
    settleKey === 0
      ? undefined
      : settleKey % 2 === 0
        ? "pick-card-settle-even"
        : "pick-card-settle-odd";

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(recipe.id)}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent",
        settleClass
      )}
    >
      <p className="font-medium text-foreground leading-snug">{recipe.name}</p>
      {showPairing &&
        !isSelected &&
        (sharedNames.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-1.5">nothing shared</p>
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
            <span className="flex items-center gap-0.5 shrink-0">
              {dotNames.map((name) => (
                <span key={name} className="size-1.5 rounded-full bg-primary" />
              ))}
            </span>
            <span className="truncate">
              {visibleNames.map((name) => name.toLowerCase()).join(", ")}
              {remaining > 0 && ` +${remaining} more`}
            </span>
          </p>
        ))}
    </button>
  );
}

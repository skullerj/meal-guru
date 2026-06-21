import Icon from "@/components/shared/Icon";
import IconButton from "@/components/shared/IconButton";
import type { Recipe } from "@/data/types";

interface Props {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete }: Props) {
  const count = recipe.ingredients.length;
  const stepCount = recipe.steps?.length ?? 0;

  return (
    <div
      data-testid="recipe-card"
      className="flex items-center justify-between border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-shadow bg-card"
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="font-semibold text-foreground">{recipe.name}</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">
            {count} {count === 1 ? "ingredient" : "ingredients"}
          </span>
          {stepCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">
              {stepCount} {stepCount === 1 ? "step" : "steps"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon="edit"
          variant="ghost"
          size="sm"
          aria-label="Edit recipe"
          onClick={onEdit}
        />
        <IconButton
          icon="trash"
          variant="danger"
          size="sm"
          aria-label="Delete recipe"
          onClick={onDelete}
        />
        {stepCount > 0 && (
          <a
            href={`/recipe/${recipe.id}`}
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-8 px-3 text-sm gap-1.5 ml-1"
            aria-label="Cook recipe"
          >
            <Icon name="book-open" size="xs" />
            Cook
          </a>
        )}
      </div>
    </div>
  );
}

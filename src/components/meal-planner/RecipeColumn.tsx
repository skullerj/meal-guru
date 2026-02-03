import type { Recipe } from "../../data/recipes";
import CheckboxCard from "../shared/CheckboxCard";
import Icon from "../shared/Icon";
import {
  calculateRecipePrice,
  sortRecipesByRecommendation,
} from "./utils/mealPlannerUtils";

interface RecipeColumnProps {
  recipes: Recipe[];
  selectedRecipeIds: string[];
  onRecipeToggle: (recipeId: string) => void;
}

export default function RecipeColumn({
  recipes,
  selectedRecipeIds,
  onRecipeToggle,
}: RecipeColumnProps) {
  const sortedRecipes = sortRecipesByRecommendation(recipes, selectedRecipeIds);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-stone-800">Recipes</h2>
      <div className="space-y-4">
        {sortedRecipes.map((recipe) => {
          const isSelected = selectedRecipeIds.includes(recipe.id);
          const recipePrice = calculateRecipePrice(recipe);

          return (
            <CheckboxCard
              key={recipe.id}
              variant="amber"
              checked={isSelected}
              onToggle={() => onRecipeToggle(recipe.id)}
              className="p-4"
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onRecipeToggle(recipe.id)}
                  className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded accent-amber-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="text-start">
                      <h3 className="font-semibold text-stone-900">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-stone-600 mt-1">
                        {recipe.ingredients.length} ingredients
                      </p>
                      <p className="text-lg font-medium text-emerald-600 mt-2">
                        £{recipePrice.toFixed(2)}
                      </p>
                    </div>
                    <a
                      href={`/recipe/${recipe.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="Edit recipe"
                    >
                      <Icon name="edit" size="xs" aria-label="Edit recipe" />
                    </a>
                  </div>
                </div>
              </div>
            </CheckboxCard>
          );
        })}
      </div>
    </div>
  );
}

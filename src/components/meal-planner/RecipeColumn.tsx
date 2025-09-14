import type { Recipe } from "../../data/recipes";
import { calculateRecipePrice } from "./utils/mealPlannerUtils";

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
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Recipes</h2>
      <div className="space-y-4">
        {recipes.map((recipe) => {
          const isSelected = selectedRecipeIds.includes(recipe.id);
          const recipePrice = calculateRecipePrice(recipe);

          return (
            // biome-ignore lint/a11y/useSemanticElements: Need full div area clickable for better UX
            <div
              key={recipe.id}
              role="button"
              tabIndex={0}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => onRecipeToggle(recipe.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRecipeToggle(recipe.id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onRecipeToggle(recipe.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {recipe.ingredients.length} ingredients
                      </p>
                      <p className="text-lg font-medium text-green-600 mt-2">
                        £{recipePrice.toFixed(2)}
                      </p>
                    </div>
                    <a
                      href={`/recipe/${recipe.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit recipe"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Edit recipe"
                        role="graphics-symbol"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

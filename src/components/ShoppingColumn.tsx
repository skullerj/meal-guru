import type { AggregatedIngredient } from "./utils/mealPlannerUtils";
import { separateIngredientsByShelf } from "./utils/mealPlannerUtils";

interface ShoppingColumnProps {
  aggregatedIngredients: AggregatedIngredient[];
  ownedIngredientIds: string[];
  onIngredientToggle: (ingredientId: string) => void;
}

interface IngredientItemProps {
  ingredient: AggregatedIngredient;
  isOwned: boolean;
  onToggle: (ingredientId: string) => void;
}

function IngredientItem({
  ingredient,
  isOwned,
  onToggle,
}: IngredientItemProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`block w-full border rounded-lg p-3 cursor-pointer transition-colors ${
        isOwned
          ? "border-green-500 bg-green-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onClick={() => onToggle(ingredient.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(ingredient.id);
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isOwned}
          onChange={() => onToggle(ingredient.id)}
          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4
                className={`font-medium ${isOwned ? "text-green-900" : "text-gray-900"}`}
              >
                {ingredient.name}
              </h4>
              <p
                className={`text-sm ${isOwned ? "text-green-700" : "text-gray-600"}`}
              >
                {ingredient.amount} {ingredient.unit}
              </p>
            </div>
            <p
              className={`text-sm font-medium ${isOwned ? "text-green-600" : "text-gray-700"}`}
            >
              £{ingredient.totalCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ShoppingColumn({
  aggregatedIngredients,
  ownedIngredientIds,
  onIngredientToggle,
}: ShoppingColumnProps) {
  const { shelfIngredients, nonShelfIngredients } = separateIngredientsByShelf(
    aggregatedIngredients
  );

  if (aggregatedIngredients.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Shopping List</h2>
        <p className="text-gray-500 text-center py-8">
          Select recipes to see aggregated ingredients
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Shopping List</h2>

      {/* Non-shelf ingredients (aggregated quantities) */}
      {nonShelfIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Fresh Ingredients
          </h3>
          <div className="space-y-2">
            {nonShelfIngredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.id}
                ingredient={ingredient}
                isOwned={ownedIngredientIds.includes(ingredient.id)}
                onToggle={onIngredientToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shelf ingredients (not aggregated) */}
      {shelfIngredients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Pantry Items
          </h3>
          <div className="space-y-2">
            {shelfIngredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.id}
                ingredient={ingredient}
                isOwned={ownedIngredientIds.includes(ingredient.id)}
                onToggle={onIngredientToggle}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Check items you already have at home
        </p>
      </div>
    </div>
  );
}

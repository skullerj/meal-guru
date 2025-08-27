import type { AggregatedIngredient } from "./utils/mealPlannerUtils";
import {
  calculateRemainingToTarget,
  separateIngredientsByShelf,
} from "./utils/mealPlannerUtils";

interface LeftToBuyColumnProps {
  remainingIngredients: AggregatedIngredient[];
  totalPrice: number;
  targetAmount?: number;
}

function openSmallWindow(e: React.MouseEvent<HTMLAnchorElement>) {
  window.open(
    e.currentTarget.href,
    "_blank",
    "width=800,height=600,scrollbars=yes,resizable=yes"
  );
  return false;
}

export default function LeftToBuyColumn({
  remainingIngredients,
  totalPrice,
  targetAmount = 40,
}: LeftToBuyColumnProps) {
  const remainingToTarget = calculateRemainingToTarget(
    totalPrice,
    targetAmount
  );
  const { shelfIngredients, nonShelfIngredients } =
    separateIngredientsByShelf(remainingIngredients);

  if (remainingIngredients.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Left to Buy</h2>
        <p className="text-gray-500 text-center py-8">
          Select recipes and mark owned ingredients to see what you need to buy
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Left to Buy</h2>

      {/* Fresh ingredients */}
      {nonShelfIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Fresh Ingredients
          </h3>
          <div className="space-y-2">
            {nonShelfIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {ingredient.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      <span>
                        Buy&nbsp;
                        {Math.ceil(
                          ingredient.amount / ingredient.source.amount
                        )}
                        &nbsp;
                      </span>
                      <span>
                        ({ingredient.amount} {ingredient.unit} needed)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-700">
                      £{ingredient.totalCost.toFixed(2)}
                    </p>
                    <a
                      href={ingredient.source.url}
                      onClick={openSmallWindow}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline mt-1 inline-block"
                    >
                      Buy on Ocado
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pantry items */}
      {shelfIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Pantry Items
          </h3>
          <div className="space-y-2">
            {shelfIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {ingredient.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-700">
                      £{ingredient.totalCost.toFixed(2)}
                    </p>
                    <a
                      href={ingredient.source.url}
                      onClick={openSmallWindow}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline mt-1 inline-block"
                    >
                      Buy on Ocado
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span className="text-green-600">£{totalPrice.toFixed(2)}</span>
        </div>

        {remainingToTarget > 0 ? (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Remaining to £{targetAmount}:</span>
            <span>£{remainingToTarget.toFixed(2)}</span>
          </div>
        ) : (
          <div className="text-sm text-green-600 text-center">
            ✅ Target of £{targetAmount} reached!
          </div>
        )}
      </div>
    </div>
  );
}

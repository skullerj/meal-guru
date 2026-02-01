import type { Ingredient } from "../../lib/database";
import Button from "../shared/Button";
import CheckboxCard from "../shared/CheckboxCard";
import Icon from "../shared/Icon";
import IconButton from "../shared/IconButton";
import AddIngredientDialog from "./AddIngredientDialog";
import type { ExtraIngredient } from "./utils/mealPlannerReducer";
import type { AggregatedIngredient } from "./utils/mealPlannerUtils";
import { separateIngredientsByShelf } from "./utils/mealPlannerUtils";

interface ShoppingColumnProps {
  aggregatedIngredients: AggregatedIngredient[];
  ownedIngredientIds: string[];
  extraIngredients: ExtraIngredient[];
  availableIngredients: Omit<Ingredient, "amount">[];
  onIngredientToggle: (ingredientId: string) => void;
  onAddExtraIngredient: (
    ingredient: Omit<Ingredient, "amount">,
    amount: number
  ) => void;
  onRemoveExtraIngredient: (ingredientId: string) => void;
}

interface IngredientItemProps {
  ingredient: AggregatedIngredient;
  isOwned: boolean;
  onToggle: (ingredientId: string) => void;
}

interface ExtraIngredientItemProps {
  extraIngredient: ExtraIngredient;
  isOwned: boolean;
  onToggle: (ingredientId: string) => void;
  onRemove: (ingredientId: string) => void;
}

function IngredientItem({
  ingredient,
  isOwned,
  onToggle,
}: IngredientItemProps) {
  return (
    <CheckboxCard
      checked={isOwned}
      variant="yellow"
      onToggle={() => onToggle(ingredient.id)}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isOwned}
          onChange={() => onToggle(ingredient.id)}
          className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded accent-yellow-500"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <h4
                className={`font-medium ${isOwned ? "text-yellow-900" : "text-gray-900"}`}
              >
                {ingredient.ingredient.name}
                {isOwned && (
                  <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Already have
                  </span>
                )}
              </h4>
              <p
                className={`text-sm ${isOwned ? "text-yellow-700" : "text-gray-600"}`}
              >
                {ingredient.amount} {ingredient.ingredient.unit}
              </p>
            </div>
            <p
              className={`text-sm font-medium ${isOwned ? "text-yellow-600 line-through" : "text-gray-700"}`}
            >
              £{ingredient.totalCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </CheckboxCard>
  );
}

function ExtraIngredientItem({
  extraIngredient,
  isOwned,
  onToggle,
  onRemove,
}: ExtraIngredientItemProps) {
  const totalCost = extraIngredient.ingredient.shelf
    ? extraIngredient.ingredient.source.price
    : Math.max(
        (extraIngredient.amount * extraIngredient.ingredient.source.price) /
          extraIngredient.ingredient.source.amount,
        extraIngredient.ingredient.source.price
      );

  return (
    <CheckboxCard
      checked={isOwned}
      variant="yellow"
      onToggle={() => onToggle(extraIngredient.ingredient.id)}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isOwned}
          onChange={() => onToggle(extraIngredient.ingredient.id)}
          className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded accent-yellow-500"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <h4
                className={`font-medium ${isOwned ? "text-yellow-900" : "text-gray-900"}`}
              >
                {extraIngredient.ingredient.name}
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  Extra
                </span>
                {isOwned && (
                  <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Already have
                  </span>
                )}
              </h4>
              <p
                className={`text-sm ${isOwned ? "text-yellow-700" : "text-gray-600"}`}
              >
                {extraIngredient.amount} {extraIngredient.ingredient.unit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-medium ${isOwned ? "text-yellow-600 line-through" : "text-gray-700"}`}
              >
                £{totalCost.toFixed(2)}
              </p>
              <IconButton
                icon="close"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(extraIngredient.ingredient.id)}
                aria-label="Remove extra ingredient"
              />
            </div>
          </div>
        </div>
      </div>
    </CheckboxCard>
  );
}

export default function ShoppingColumn({
  aggregatedIngredients,
  ownedIngredientIds,
  extraIngredients,
  availableIngredients,
  onIngredientToggle,
  onAddExtraIngredient,
  onRemoveExtraIngredient,
}: ShoppingColumnProps) {
  const { shelfIngredients, nonShelfIngredients } = separateIngredientsByShelf(
    aggregatedIngredients
  );

  if (aggregatedIngredients.length === 0 && extraIngredients.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Shopping List</h2>
        <p className="text-gray-500 text-center py-8">
          Select recipes to see aggregated ingredients or add your own items
        </p>

        {/* Add Item button - always visible */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <AddIngredientDialog
            availableIngredients={availableIngredients}
            onAddIngredient={onAddExtraIngredient}
            trigger={
              <Button variant="secondary" leftIcon="add" className="w-full">
                Add Item to List
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Shopping List</h2>

      {/* Info banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <Icon name="info" size="sm" className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Check items you already have at home. Checked items will be excluded from your final shopping list.
        </p>
      </div>

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
        <div className="mb-6">
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

      {/* Extra ingredients (manually added) */}
      {extraIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Extra Items
          </h3>
          <div className="space-y-2">
            {extraIngredients.map((extra) => (
              <ExtraIngredientItem
                key={extra.ingredient.id}
                extraIngredient={extra}
                isOwned={ownedIngredientIds.includes(extra.ingredient.id)}
                onToggle={onIngredientToggle}
                onRemove={onRemoveExtraIngredient}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Item button */}
      <div>
        <AddIngredientDialog
          availableIngredients={availableIngredients}
          onAddIngredient={onAddExtraIngredient}
          trigger={
            <Button variant="secondary" leftIcon="add" className="w-full">
              Add Item to List
            </Button>
          }
        />
      </div>
    </div>
  );
}

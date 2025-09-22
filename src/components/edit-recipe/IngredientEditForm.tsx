import { useState } from "react";
import Icon from "../shared/Icon";
import type { EditableRecipeIngredient } from "./utils/editRecipeUtils";

const ALLOWED_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "unit",
] as const;

interface IngredientEditFormProps {
  ingredient: EditableRecipeIngredient | null;
  onUpdate: (
    ingredientId: string,
    updates: Partial<EditableRecipeIngredient>
  ) => void;
  onReset: (ingredientId: string) => void;
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  if (!string) return true; // Empty URL is valid
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export default function IngredientEditForm({
  ingredient,
  onUpdate,
  onReset,
}: IngredientEditFormProps) {
  const [localName, setLocalName] = useState(ingredient?.ingredient.name || "");
  const [localAmount, setLocalAmount] = useState(
    ingredient?.amount?.toString() || ""
  );
  const [localUnit, setLocalUnit] = useState(ingredient?.ingredient.unit || "");
  const [localPrice, setLocalPrice] = useState(
    ingredient?.ingredient.source.price?.toString() || ""
  );
  const [localSourceAmount, setLocalSourceAmount] = useState(
    ingredient?.ingredient.source.amount?.toString() || ""
  );
  const [localUrl, setLocalUrl] = useState(
    ingredient?.ingredient.source.url || ""
  );

  // Update local state when ingredient changes
  if (
    ingredient &&
    (localName !== ingredient.ingredient.name ||
      localAmount !== ingredient.amount.toString() ||
      localUnit !== ingredient.ingredient.unit ||
      localPrice !== ingredient.ingredient.source.price.toString() ||
      localSourceAmount !== ingredient.ingredient.source.amount.toString() ||
      localUrl !== ingredient.ingredient.source.url)
  ) {
    setLocalName(ingredient.ingredient.name);
    setLocalAmount(ingredient.amount.toString());
    setLocalUnit(ingredient.ingredient.unit);
    setLocalPrice(ingredient.ingredient.source.price.toString());
    setLocalSourceAmount(ingredient.ingredient.source.amount.toString());
    setLocalUrl(ingredient.ingredient.source.url);
  }

  if (!ingredient) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <Icon name="edit" size="xl" className="mx-auto text-grey-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No ingredient selected
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Select an ingredient from the left to edit its details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNameChange = (value: string) => {
    setLocalName(value);
    onUpdate(ingredient.id, {
      ingredient: { ...ingredient.ingredient, name: value },
    });
  };

  const handleAmountChange = (value: string) => {
    setLocalAmount(value);
    const numericValue = parseFloat(value);
    if (!Number.isNaN(numericValue) && numericValue > 0) {
      onUpdate(ingredient.id, { amount: numericValue });
    }
  };

  const handleUnitChange = (value: string) => {
    setLocalUnit(value);
    onUpdate(ingredient.id, {
      ingredient: {
        ...ingredient.ingredient,
        unit: value as (typeof ALLOWED_UNITS)[number],
      },
    });
  };

  const handlePriceChange = (value: string) => {
    setLocalPrice(value);
    const numericValue = parseFloat(value);
    if (!Number.isNaN(numericValue) && numericValue > 0) {
      onUpdate(ingredient.id, {
        ingredient: {
          ...ingredient.ingredient,
          source: { ...ingredient.ingredient.source, price: numericValue },
        },
      });
    }
  };

  const handleSourceAmountChange = (value: string) => {
    setLocalSourceAmount(value);
    const numericValue = parseFloat(value);
    if (!Number.isNaN(numericValue) && numericValue > 0) {
      onUpdate(ingredient.id, {
        ingredient: {
          ...ingredient.ingredient,
          source: { ...ingredient.ingredient.source, amount: numericValue },
        },
      });
    }
  };

  const handleUrlChange = (value: string) => {
    setLocalUrl(value);
    // Basic URL validation - update immediately, validation shown in UI
    onUpdate(ingredient.id, {
      ingredient: {
        ...ingredient.ingredient,
        source: { ...ingredient.ingredient.source, url: value },
      },
    });
  };

  const handleReset = () => {
    if (ingredient) {
      onReset(ingredient.id);
      setLocalName(
        ingredient.originalIngredient?.name || ingredient.ingredient.name
      );
      setLocalAmount(
        (ingredient.originalAmount || ingredient.amount).toString()
      );
      setLocalUnit(
        ingredient.originalIngredient?.unit || ingredient.ingredient.unit
      );
      setLocalPrice(ingredient.ingredient.source.price.toString());
      setLocalSourceAmount(ingredient.ingredient.source.amount.toString());
      setLocalUrl(ingredient.ingredient.source.url);
    }
  };

  const hasChanges =
    ingredient &&
    (ingredient.ingredient.name !== ingredient.originalIngredient?.name ||
      ingredient.amount !== ingredient.originalAmount ||
      ingredient.ingredient.unit !== ingredient.originalIngredient?.unit ||
      ingredient.ingredient.source.price !==
        ingredient.originalIngredient?.source.price ||
      ingredient.ingredient.source.amount !==
        ingredient.originalIngredient?.source.amount ||
      ingredient.ingredient.source.url !==
        ingredient.originalIngredient?.source.url);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Ingredient
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Make changes to the selected ingredient
            </p>
          </div>

          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Icon
                name="reset"
                size="xs"
                className="mr-2"
                aria-label="Reset icon"
              />
              Reset
            </button>
          )}
        </div>

        <form className="space-y-6">
          {/* Ingredient Name */}
          <div>
            <label
              htmlFor="ingredient-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ingredient Name
            </label>
            <input
              id="ingredient-name"
              type="text"
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter ingredient name..."
            />
            {ingredient.ingredient.name !==
              ingredient.originalIngredient?.name && (
              <p className="mt-1 text-xs text-amber-600">
                Changed from: {ingredient.originalIngredient?.name}
              </p>
            )}
          </div>

          {/* Amount and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ingredient-amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount
              </label>
              <input
                id="ingredient-amount"
                type="number"
                min="0"
                step="0.01"
                value={localAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {ingredient.amount !== ingredient.originalAmount && (
                <p className="mt-1 text-xs text-amber-600">
                  Was: {ingredient.originalAmount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ingredient-unit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit
              </label>
              <select
                id="ingredient-unit"
                value={localUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select unit...</option>
                {ALLOWED_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {ingredient.ingredient.unit !==
                ingredient.originalIngredient?.unit && (
                <p className="mt-1 text-xs text-amber-600">
                  Was: {ingredient.originalIngredient?.unit}
                </p>
              )}
            </div>
          </div>

          {/* Source Information */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Source Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ingredient-price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price (£)
                </label>
                <input
                  id="ingredient-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {ingredient.ingredient.source.price !==
                  ingredient.originalIngredient?.source.price && (
                  <p className="mt-1 text-xs text-amber-600">
                    Was: £
                    {ingredient.originalIngredient?.source.price.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="ingredient-source-amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Source Amount
                </label>
                <input
                  id="ingredient-source-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localSourceAmount}
                  onChange={(e) => handleSourceAmountChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                {ingredient.ingredient.source.amount !==
                ingredient.originalIngredient?.source.amount ? (
                  <p className="mt-1 text-xs text-amber-600">
                    Was: {ingredient.originalIngredient?.source.amount}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Amount in {ingredient.ingredient.unit}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="ingredient-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Source URL
              </label>
              <input
                id="ingredient-url"
                type="url"
                value={localUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  localUrl && !isValidUrl(localUrl)
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="https://example.com/product"
              />
              {localUrl && !isValidUrl(localUrl) && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter a valid URL
                </p>
              )}
              {ingredient.ingredient.source.url !==
                ingredient.originalIngredient?.source.url && (
                <p className="mt-1 text-xs text-amber-600">
                  Was: {ingredient.originalIngredient?.source.url || "(empty)"}
                </p>
              )}
              {localUrl && (
                <div className="mt-2">
                  <a
                    href={localUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    View Source →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shelf Item Status */}
          <div>
            <div className="flex items-center">
              <input
                id="shelf-item"
                type="checkbox"
                checked={ingredient.ingredient.shelf}
                readOnly
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50"
              />
              <label
                htmlFor="shelf-item"
                className="ml-2 block text-sm text-gray-700"
              >
                Shelf item (already owned)
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Shelf status cannot be changed in this version
            </p>
          </div>
        </form>

        {/* Status Indicators */}
        {ingredient.isModified && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon
                  name="warning"
                  size="sm"
                  className="text-amber-400"
                  aria-label="Warning icon"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  This ingredient has unsaved changes. Remember to save your
                  recipe to persist these changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

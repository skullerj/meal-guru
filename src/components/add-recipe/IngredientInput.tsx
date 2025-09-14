import { useEffect, useRef, useState } from "react";
import type { Ingredient } from "../../lib/database";
import type { EditableIngredient } from "./utils/addRecipeReducer";
import {
  ALLOWED_UNITS,
  filterIngredientsForAutocomplete,
} from "./utils/addRecipeUtils";

interface IngredientInputProps {
  ingredient: EditableIngredient;
  index: number;
  availableIngredients: Omit<Ingredient, "amount">[];
  onUpdate: (index: number, ingredient: Partial<EditableIngredient>) => void;
  onRemove: (index: number) => void;
}

export default function IngredientInput({
  ingredient: recipeIngredient,
  index,
  availableIngredients,
  onUpdate,
  onRemove,
}: IngredientInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<Ingredient, "amount">[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { ingredient } = recipeIngredient;

  // Update suggestions based on name input
  useEffect(() => {
    if (ingredient.name && ingredient.name.length > 1) {
      const filtered = filterIngredientsForAutocomplete(
        availableIngredients,
        ingredient.name,
        5
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && !ingredient.id);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [ingredient?.name, availableIngredients, ingredient.id]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNameChange = (name: string) => {
    onUpdate(index, {
      ingredient: { ...recipeIngredient.ingredient, id: "", name },
    });
  };

  const handleSuggestionSelect = (
    selectedIngredient: Omit<Ingredient, "amount">
  ) => {
    onUpdate(index, {
      ingredient: selectedIngredient,
    });
    setShowSuggestions(false);
  };

  const handleAmountChange = (amount: number) => {
    onUpdate(index, { amount });
  };

  const handleUnitChange = (unit: string) => {
    onUpdate(index, {
      ingredient: {
        ...recipeIngredient.ingredient,
        unit: unit as Ingredient["unit"],
      },
    });
  };

  const handleShelfChange = (shelf: boolean) => {
    onUpdate(index, { ingredient: { ...recipeIngredient.ingredient, shelf } });
  };

  const handleSourceChange = (sourceField: string, value: string | number) => {
    onUpdate(index, {
      ingredient: {
        ...recipeIngredient.ingredient,
        source: {
          ...recipeIngredient.ingredient.source,
          [sourceField]: value,
        },
      },
    });
  };

  const isUsingExistingIngredient = Boolean(recipeIngredient.ingredient.id);

  return (
    <div className="border border-gray-200 p-4 rounded-md">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-medium text-gray-700">
          Ingredient {index + 1}
          {isUsingExistingIngredient && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Reusing existing
            </span>
          )}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="Remove ingredient"
            role="graphics-symbol"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Name field with autocomplete */}
        <div className="relative">
          <label
            htmlFor={`ingredient-name-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id={`ingredient-name-${index}`}
            ref={inputRef}
            type="text"
            value={ingredient.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Start typing ingredient name..."
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-sm text-gray-500">
                    Unit: {suggestion.unit} | Shelf:{" "}
                    {suggestion.shelf ? "Yes" : "No"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recipe Amount */}
        <div>
          <label
            htmlFor={`ingredient-amount-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipe Amount
          </label>
          <input
            id={`ingredient-amount-${index}`}
            type="number"
            step="0.1"
            value={recipeIngredient.amount || ""}
            onChange={(e) =>
              handleAmountChange(parseFloat(e.target.value) || 0)
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Unit */}
        <div>
          <label
            htmlFor={`ingredient-unit-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Unit
          </label>
          <select
            id={`ingredient-unit-${index}`}
            value={ingredient.unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {ALLOWED_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {/* Shelf checkbox */}
        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={ingredient.shelf}
              onChange={(e) => handleShelfChange(e.target.checked)}
              className="mr-2"
            />
            Shelf item
          </label>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Source Information (Required for new ingredients)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-md">
          <div>
            <label
              htmlFor={`ingredient-url-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Store URL
            </label>
            <input
              id={`ingredient-url-${index}`}
              type="url"
              value={ingredient.source.url}
              onChange={(e) => handleSourceChange("url", e.target.value)}
              placeholder="https://store.com/product"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor={`ingredient-price-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Store Price (£)
            </label>
            <input
              id={`ingredient-price-${index}`}
              type="number"
              step="0.01"
              value={ingredient.source.price || ""}
              onChange={(e) =>
                handleSourceChange("price", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor={`ingredient-store-amount-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Store Amount
            </label>
            <input
              id={`ingredient-store-amount-${index}`}
              type="number"
              step="0.1"
              value={ingredient.source.amount || ""}
              onChange={(e) =>
                handleSourceChange("amount", parseFloat(e.target.value) || 0)
              }
              placeholder="Amount sold at store"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

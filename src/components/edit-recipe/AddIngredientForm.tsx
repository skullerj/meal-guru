import { useState } from "react";
import type { UnitType } from "../../data/recipes";
import type { Ingredient } from "../../lib/database";
import SearchIngredientInput from "../shared/SearchIngredientInput";
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

interface AddIngredientFormProps {
  availableIngredients: Omit<Ingredient, "amount">[];
  onAdd: (ingredient: EditableRecipeIngredient) => void;
  onCancel: () => void;
}

export default function AddIngredientForm({
  availableIngredients,
  onAdd,
  onCancel,
}: AddIngredientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: 1,
    unit: "unit" as UnitType,
    shelf: false,
    source: {
      url: "",
      price: 0,
      amount: 0,
    },
  });

  const [selectedIngredient, setSelectedIngredient] = useState<Omit<
    Ingredient,
    "amount"
  > | null>(null);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setSelectedIngredient(null);
  };

  const handleIngredientSelect = (ingredient: Omit<Ingredient, "amount">) => {
    setSelectedIngredient(ingredient);
    setFormData((prev) => ({
      ...prev,
      name: ingredient.name,
      unit: ingredient.unit,
      shelf: ingredient.shelf,
      source: ingredient.source,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const tempId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const newIngredient: EditableRecipeIngredient = {
      id: tempId,
      amount: formData.amount,
      order_index: 0,
      ingredient: {
        id: selectedIngredient?.id || "",
        name: formData.name,
        unit: formData.unit,
        shelf: formData.shelf,
        source: formData.source,
        created_at: new Date().toISOString(), // placeholder
      },
      isModified: false,
      isDeleted: false,
      isNew: true,
    };

    onAdd(newIngredient);
  };

  const isUsingExistingIngredient = Boolean(selectedIngredient);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Add New Ingredient
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="graphics-symbol"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field with autocomplete */}
            <SearchIngredientInput
              value={formData.name}
              availableIngredients={availableIngredients}
              selectedIngredient={selectedIngredient}
              onIngredientChange={handleNameChange}
              onIngredientSelect={handleIngredientSelect}
              id="ingredient-name"
              label="Ingredient Name"
              required={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Amount */}
              <div>
                <label
                  htmlFor="ingredient-amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipe Amount
                </label>
                <input
                  id="ingredient-amount"
                  type="number"
                  step="0.1"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0.1"
                />
              </div>

              {/* Unit */}
              <div>
                <label
                  htmlFor="ingredient-unit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Unit
                </label>
                <select
                  id="ingredient-unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit: e.target.value as typeof formData.unit,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isUsingExistingIngredient}
                >
                  {ALLOWED_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shelf */}
              <div className="flex items-center justify-center">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.shelf}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shelf: e.target.checked,
                      }))
                    }
                    className="mr-2"
                    disabled={isUsingExistingIngredient}
                  />
                  Shelf item
                </label>
              </div>
            </div>

            {/* Source Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Source Information{" "}
                {!isUsingExistingIngredient && "(Required for new ingredients)"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-md">
                <div>
                  <label
                    htmlFor="ingredient-url"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Store URL
                  </label>
                  <input
                    id="ingredient-url"
                    type="url"
                    value={formData.source.url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        source: { ...prev.source, url: e.target.value },
                      }))
                    }
                    placeholder="https://store.com/product"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={!isUsingExistingIngredient}
                    disabled={isUsingExistingIngredient}
                  />
                </div>
                <div>
                  <label
                    htmlFor="ingredient-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Store Price (£)
                  </label>
                  <input
                    id="ingredient-price"
                    type="number"
                    step="0.01"
                    value={formData.source.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        source: {
                          ...prev.source,
                          price: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={!isUsingExistingIngredient}
                    disabled={isUsingExistingIngredient}
                    min="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ingredient-store-amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Store Amount
                  </label>
                  <input
                    id="ingredient-store-amount"
                    type="number"
                    step="0.1"
                    value={formData.source.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        source: {
                          ...prev.source,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="Amount sold at store"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={!isUsingExistingIngredient}
                    disabled={isUsingExistingIngredient}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Ingredient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

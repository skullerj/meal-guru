import { useReducer, useState } from "react";
import { actions } from "astro:actions";
import type { Ingredient } from "../../lib/database";
import Button from "../shared/Button";
import IngredientList from "./IngredientList";
import AddIngredientDialog from "./AddIngredientDialog";
import EditIngredientDialog from "./EditIngredientDialog";
import {
  createInitialState,
  ingredientManagerReducer,
} from "./utils/ingredientManagerReducer";

interface IngredientManagerProps {
  ingredients: Ingredient[];
}

export default function IngredientManager({
  ingredients,
}: IngredientManagerProps) {
  const [state, dispatch] = useReducer(
    ingredientManagerReducer,
    ingredients,
    createInitialState
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "SET_SORT_BY",
      sortBy: e.target.value as "name" | "unit",
    });
  };

  const handleAddSuccess = (ingredient: Ingredient) => {
    dispatch({
      type: "ADD_INGREDIENT",
      ingredient,
    });
  };

  const handleUpdateSuccess = (ingredient: Ingredient) => {
    dispatch({
      type: "UPDATE_INGREDIENT",
      ingredient,
    });
  };

  const handleDeleteIngredient = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this ingredient? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await actions.deleteIngredient({ id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      dispatch({ type: "DELETE_INGREDIENT", id });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete ingredient"
      );
      console.error("Error deleting ingredient:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ingredient Management
        </h1>
        <p className="text-gray-600">
          Manage your ingredient library for recipes
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={state.sortBy}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="unit">Sort by Unit</option>
          </select>

          <Button
            variant="primary"
            onClick={() => dispatch({ type: "OPEN_ADD_DIALOG" })}
            disabled={isLoading}
            leftIcon="add"
          >
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <IngredientList
          ingredients={state.filteredIngredients}
          onEdit={(ingredient) =>
            dispatch({ type: "OPEN_EDIT_DIALOG", ingredient })
          }
          onDelete={handleDeleteIngredient}
        />
      </div>

      <AddIngredientDialog
        isOpen={state.isAddDialogOpen}
        onClose={() => dispatch({ type: "CLOSE_ADD_DIALOG" })}
        onSuccess={handleAddSuccess}
      />

      <EditIngredientDialog
        isOpen={state.isEditDialogOpen}
        ingredient={state.selectedIngredient}
        onClose={() => dispatch({ type: "CLOSE_EDIT_DIALOG" })}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

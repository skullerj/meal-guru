import { actions } from "astro:actions";
import { useReducer, useState } from "react";
import type { Recipe } from "../../lib/database";
import EditRecipeHeader from "./EditRecipeHeader";
import IngredientEditForm from "./IngredientEditForm";
import IngredientListColumn from "./IngredientListColumn";
import {
  createInitialState,
  editRecipeReducer,
} from "./utils/editRecipeReducer";
import {
  type EditableRecipeIngredient,
  getActiveIngredients,
  getDeletedIngredients,
  getModifiedIngredients,
  validateRecipeForm,
} from "./utils/editRecipeUtils";

interface EditRecipeFormProps {
  recipe: Recipe;
}

export default function EditRecipeForm({ recipe }: EditRecipeFormProps) {
  const [state, dispatch] = useReducer(
    editRecipeReducer,
    createInitialState(recipe)
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handler functions
  const handleRecipeNameChange = (name: string) => {
    dispatch({ type: "SET_RECIPE_NAME", name });
  };

  const handleIngredientSelect = (ingredientId: string) => {
    dispatch({ type: "SELECT_INGREDIENT", ingredientId });
  };

  const handleIngredientUpdate = (
    ingredientId: string,
    updates: Partial<EditableRecipeIngredient>
  ) => {
    dispatch({ type: "UPDATE_INGREDIENT", ingredientId, updates });
  };

  const handleIngredientDelete = (ingredientId: string) => {
    dispatch({ type: "DELETE_INGREDIENT", ingredientId });
  };

  const handleIngredientRestore = (ingredientId: string) => {
    dispatch({ type: "RESTORE_INGREDIENT", ingredientId });
  };

  const handleIngredientReset = (ingredientId: string) => {
    dispatch({ type: "RESET_INGREDIENT", ingredientId });
  };

  const handleResetAll = () => {
    dispatch({ type: "RESET_ALL_CHANGES" });
    setValidationErrors([]);
  };

  const handleSave = async () => {
    // Validate form first
    const activeIngredients = getActiveIngredients(state.ingredients);
    const validation = validateRecipeForm(state.recipeName, activeIngredients);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      // Prepare the action input
      const actionInput: Parameters<typeof actions.editRecipe>[0] = {
        id: recipe.id,
        name: state.recipeName,
      };

      // Add modified ingredients - transform to action schema format
      const modifiedIngredients = getModifiedIngredients(state.ingredients);
      if (modifiedIngredients.length > 0) {
        actionInput.ingredientsToUpdate = modifiedIngredients;
      }

      // Add deleted ingredients
      const deletedIngredients = getDeletedIngredients(state.ingredients);
      if (deletedIngredients.length > 0) {
        actionInput.ingredientsToDelete = deletedIngredients.map(
          (ingredient) => ingredient.id
        );
      }

      // Call the edit recipe action
      const { error } = await actions.editRecipe(actionInput);

      if (error) {
        throw new Error(error.message || "Failed to update recipe");
      }

      // Success - redirect to the recipe page
      window.location.href = `/recipe/${recipe.id}`;
    } catch (error) {
      console.error("Error saving recipe:", error);
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Failed to save recipe",
      });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  };

  const selectedIngredient = state.selectedIngredientId
    ? (state.ingredients.find((ing) => ing.id === state.selectedIngredientId) ??
      null)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <EditRecipeHeader
        recipeName={state.recipeName}
        hasUnsavedChanges={state.hasUnsavedChanges}
        isLoading={state.isLoading}
        recipeId={recipe.id}
        onRecipeNameChange={handleRecipeNameChange}
        onSave={handleSave}
        onReset={handleResetAll}
      />

      {/* Error Messages */}
      {(state.error || validationErrors.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-label="Error icon"
                role="graphics-symbol"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There were errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {state.error && <li>{state.error}</li>}
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Ingredients List */}
          <IngredientListColumn
            ingredients={state.ingredients}
            selectedIngredientId={state.selectedIngredientId}
            onIngredientSelect={handleIngredientSelect}
            onIngredientDelete={handleIngredientDelete}
            onIngredientRestore={handleIngredientRestore}
          />

          {/* Right Column - Ingredient Edit Form */}
          <IngredientEditForm
            ingredient={selectedIngredient}
            onUpdate={handleIngredientUpdate}
            onReset={handleIngredientReset}
          />
        </div>
      </div>
    </div>
  );
}

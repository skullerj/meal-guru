import { actions } from "astro:actions";
import { useState } from "react";
import type { Recipe } from "../../lib/database";

interface CreateRecipeStepProps {
  recipeJson: Omit<Recipe, "created_at">;
  onReset: () => void;
  onBackToEdit: () => void;
}

export default function CreateRecipeStep({
  recipeJson,
  onReset,
  onBackToEdit,
}: CreateRecipeStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRecipe, setCreatedRecipe] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreateRecipe = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const { data, error: actionError } = await actions.saveRecipe({
        id: recipeJson.id,
        name: recipeJson.name,
        ingredients: recipeJson.ingredients,
      });

      if (actionError) {
        throw new Error(actionError.message);
      }

      if (data) {
        setCreatedRecipe(data.recipe);
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Failed to create recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to create recipe");
    } finally {
      setIsCreating(false);
    }
  };

  if (isSuccess && createdRecipe) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="graphics-symbol"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recipe Created Successfully!
          </h2>
          <p className="text-gray-600 mt-2">
            "{createdRecipe.name}" has been added to your recipe collection.
          </p>
        </div>

        {/* Success Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="graphics-symbol"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Recipe Details
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>Name:</strong> {createdRecipe.name}
                </p>
                <p>
                  <strong>Ingredients:</strong> {recipeJson.ingredients.length}{" "}
                  items
                </p>
                <p>
                  <strong>Recipe ID:</strong> {createdRecipe.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What's Next?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your recipe is now available in the meal planner</li>
            <li>• You can use it to generate shopping lists</li>
            <li>
              • All ingredients have been added to your ingredient library
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6">
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Meal Planner
          </a>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Add Another Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isCreating}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            role="graphics-symbol"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H13a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414L4.879 6.879a1 1 0 011.414 1.414L2.586 12H13a1 1 0 110-2H2.586l3.707-3.707z"
              clipRule="evenodd"
            />
          </svg>
          Back to Edit
        </button>
        <h2 className="text-xl font-semibold">Ready to Create Recipe</h2>
        <div></div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="graphics-symbol"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error Creating Recipe
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recipe Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-900">Recipe Name</div>
            <div className="text-blue-700">{recipeJson.name}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-900">Ingredients</div>
            <div className="text-green-700">
              {recipeJson.ingredients.length} items
            </div>
          </div>
        </div>

        {/* Ingredient breakdown */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Ingredients:
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipeJson.ingredients.map((ingredient) => (
              <span
                key={ingredient.id}
                className={`px-2 py-1 text-xs rounded-full ${
                  ingredient.id.includes("existing") ||
                  ingredient.id.length > 20
                    ? "bg-green-100 text-green-800" // Reused ingredients
                    : "bg-blue-100 text-blue-800" // New ingredients
                }`}
              >
                {ingredient.name} ({ingredient.amount} {ingredient.unit})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Create Recipe Button */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Save to Database
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will create the recipe in your database with all ingredients
          </p>
          <button
            type="button"
            onClick={handleCreateRecipe}
            disabled={isCreating}
            className={`px-8 py-3 text-white rounded-lg font-medium transition-colors ${
              isCreating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isCreating ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="graphics-symbol"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Recipe...
              </div>
            ) : (
              "Create Recipe"
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <button
          type="button"
          onClick={onBackToEdit}
          disabled={isCreating}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Edit Recipe
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isCreating}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

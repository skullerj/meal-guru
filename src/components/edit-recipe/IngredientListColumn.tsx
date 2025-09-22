import Icon from "../shared/Icon";
import type { EditableRecipeIngredient } from "./utils/editRecipeUtils";

interface IngredientListColumnProps {
  ingredients: EditableRecipeIngredient[];
  selectedIngredientId: string | null;
  onIngredientSelect: (ingredientId: string) => void;
  onIngredientDelete: (ingredientId: string) => void;
  onIngredientRestore: (ingredientId: string) => void;
  onAddIngredient: () => void;
}

export default function IngredientListColumn({
  ingredients,
  selectedIngredientId,
  onIngredientSelect,
  onIngredientDelete,
  onIngredientRestore,
  onAddIngredient,
}: IngredientListColumnProps) {
  // Show all ingredients including deleted ones (with different styling)
  const sortedIngredients = [...ingredients].sort((a, b) => {
    // Sort deleted ingredients to the bottom
    if (a.isDeleted && !b.isDeleted) return 1;
    if (!a.isDeleted && b.isDeleted) return -1;
    return a.ingredient.name.localeCompare(b.ingredient.name);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recipe Ingredients
        </h2>

        {sortedIngredients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon
              name="package"
              size="xl"
              className="mx-auto text-gray-400"
              aria-label="No ingredients"
            />
            <p className="mt-2">No ingredients found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedIngredients.map((ingredient) => (
              // biome-ignore lint/a11y/useSemanticElements: Need to place a div as the container for full area clickable
              <div
                key={ingredient.id}
                role="button"
                tabIndex={0}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  ingredient.isDeleted
                    ? "bg-red-50 border-red-200 opacity-60 cursor-not-allowed"
                    : ingredient.isNew
                      ? "bg-green-50 border-green-200 hover:bg-green-100"
                      : ingredient.isModified
                        ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
                        : selectedIngredientId === ingredient.id
                          ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500 ring-opacity-50"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() =>
                  !ingredient.isDeleted && onIngredientSelect(ingredient.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onIngredientSelect(ingredient.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-sm font-medium truncate ${
                          ingredient.isDeleted
                            ? "text-red-600 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {ingredient.ingredient.name}
                      </h3>

                      {/* Status indicators */}
                      <div className="flex space-x-1">
                        {ingredient.isNew && !ingredient.isDeleted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                        {ingredient.isModified &&
                          !ingredient.isDeleted &&
                          !ingredient.isNew && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              Modified
                            </span>
                          )}
                        {ingredient.isDeleted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className={`text-sm mt-1 ${
                        ingredient.isDeleted ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {ingredient.amount} {ingredient.ingredient.unit}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {ingredient.isDeleted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onIngredientRestore(ingredient.id);
                        }}
                        className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-green-600 hover:text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Restore ingredient"
                      >
                        <Icon
                          name="reset"
                          size="xs"
                          aria-label="Restore ingredient"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onIngredientDelete(ingredient.id);
                        }}
                        className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete ingredient"
                      >
                        <Icon
                          name="delete"
                          size="xs"
                          aria-label="Delete ingredient"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add ingredient button */}
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onAddIngredient}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="add" size="sm" aria-label="Add ingredient" />
              <span className="text-sm font-medium">Add Ingredient</span>
            </div>
          </button>

          {/* Selection instruction */}
          {!selectedIngredientId &&
            sortedIngredients.some((ing) => !ing.isDeleted) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Icon
                    name="info"
                    size="xs"
                    className="inline mr-2"
                    aria-label="Info icon"
                  />
                  Click on an ingredient to edit its details
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

import type { Ingredient } from "../../lib/database";
import Button from "../shared/Button";
import IngredientInput from "./IngredientInput";
import type { EditableIngredient } from "./utils/addRecipeReducer";

interface RecipeEditStepProps {
  recipeName: string;
  extractedText: string;
  ingredients: EditableIngredient[];
  availableIngredients: Omit<Ingredient, "amount">[];
  onRecipeNameChange: (name: string) => void;
  onIngredientUpdate: (
    index: number,
    ingredient: Partial<EditableIngredient>
  ) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onGenerateJson: () => void;
  onBackToUpload: () => void;
}

export default function RecipeEditStep({
  recipeName,
  extractedText,
  ingredients,
  availableIngredients,
  onRecipeNameChange,
  onIngredientUpdate,
  onAddIngredient,
  onRemoveIngredient,
  onGenerateJson,
  onBackToUpload,
}: RecipeEditStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateJson();
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={onBackToUpload}
          leftIcon="arrow-left"
          size="sm"
        >
          Back to Upload
        </Button>
        <h2 className="text-xl font-semibold">Recipe Details</h2>
        <div></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Recipe Name */}
          <div className="mb-6">
            <label
              htmlFor="recipe-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Recipe Name
            </label>
            <input
              type="text"
              id="recipe-name"
              value={recipeName}
              onChange={(e) => onRecipeNameChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter recipe name"
            />
          </div>

          {/* Extracted Text Display (if available) */}
          {extractedText && (
            <div className="mb-6">
              <label
                htmlFor="extracted-text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Extracted Text from PDF
              </label>
              <textarea
                id="extracted-text"
                value={extractedText}
                className="w-full h-32 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                readOnly
                placeholder="No PDF text extracted"
              />
            </div>
          )}
        </div>

        {/* Ingredients Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
            <Button
              variant="success"
              onClick={onAddIngredient}
              leftIcon="add"
              size="sm"
            >
              Add Ingredient
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>No ingredients added yet.</p>
              <Button
                variant="secondary"
                onClick={onAddIngredient}
                leftIcon="add"
                size="sm"
                className="mt-2"
              >
                Add your first ingredient
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ingredients.map((recipeIngredient, index) => (
                <IngredientInput
                  key={recipeIngredient.ingredient?.id || `new-${index}`}
                  ingredient={recipeIngredient}
                  index={index}
                  availableIngredients={availableIngredients}
                  onUpdate={onIngredientUpdate}
                  onRemove={onRemoveIngredient}
                />
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6">
          <div className="text-sm text-gray-500">
            {ingredients.length} ingredients
          </div>
          <div className="space-x-4">
            <Button variant="secondary" onClick={onBackToUpload}>
              Back
            </Button>
            <Button type="submit">Generate Recipe JSON</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

import type { Ingredient } from "../lib/database";
import IngredientInput from "./IngredientInput";
import type {
  IngredientFormData,
  InstructionFormData,
} from "./utils/addRecipeReducer";

interface RecipeEditStepProps {
  recipeName: string;
  extractedText: string;
  ingredients: IngredientFormData[];
  instructions: InstructionFormData[];
  availableIngredients: Omit<Ingredient, "amount">[];
  onRecipeNameChange: (name: string) => void;
  onIngredientUpdate: (
    index: number,
    ingredient: Partial<IngredientFormData>
  ) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onInstructionUpdate: (
    index: number,
    instruction: Partial<InstructionFormData>
  ) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  onGenerateJson: () => void;
  onBackToUpload: () => void;
}

export default function RecipeEditStep({
  recipeName,
  extractedText,
  ingredients,
  instructions,
  availableIngredients,
  onRecipeNameChange,
  onIngredientUpdate,
  onAddIngredient,
  onRemoveIngredient,
  onInstructionUpdate,
  onAddInstruction,
  onRemoveInstruction,
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
        <button
          type="button"
          onClick={onBackToUpload}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="Back arrow"
            role="graphics-symbol"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H13a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414L4.879 6.879a1 1 0 011.414 1.414L2.586 12H13a1 1 0 110-2H2.586l3.707-3.707z"
              clipRule="evenodd"
            />
          </svg>
          Back to Upload
        </button>
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
            <button
              type="button"
              onClick={onAddIngredient}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Add Ingredient
            </button>
          </div>

          {ingredients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>No ingredients added yet.</p>
              <button
                type="button"
                onClick={onAddIngredient}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Add your first ingredient
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <IngredientInput
                  key={ingredient.id}
                  ingredient={ingredient}
                  index={index}
                  availableIngredients={availableIngredients}
                  onUpdate={onIngredientUpdate}
                  onRemove={onRemoveIngredient}
                />
              ))}
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
            <button
              type="button"
              onClick={onAddInstruction}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Add Step
            </button>
          </div>

          {instructions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>No instructions added yet.</p>
              <button
                type="button"
                onClick={onAddInstruction}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Add your first instruction step
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                <div
                  key={instruction.id}
                  className="border border-gray-200 p-4 rounded-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <label
                      htmlFor={`instruction-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Step {index + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveInstruction(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Remove instruction"
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
                  <textarea
                    id={`instruction-${index}`}
                    value={instruction.text}
                    onChange={(e) =>
                      onInstructionUpdate(index, { text: e.target.value })
                    }
                    className="w-full h-20 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder={`Enter instruction for step ${index + 1}...`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6">
          <div className="text-sm text-gray-500">
            {ingredients.length} ingredients, {instructions.length} steps
          </div>
          <div className="space-x-4">
            <button
              type="button"
              onClick={onBackToUpload}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Recipe JSON
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

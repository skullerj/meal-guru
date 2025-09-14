import { actions } from "astro:actions";
import { useReducer } from "react";
import type { Ingredient } from "../../lib/database";
import CreateRecipeStep from "./CreateRecipeStep";
import PdfUploadStep from "./PdfUploadStep";
import RecipeEditStep from "./RecipeEditStep";
import type { IngredientFormData } from "./utils/addRecipeReducer";
import { addRecipeReducer, createInitialState } from "./utils/addRecipeReducer";
import {
  extractTextFromPdf,
  transformToRecipeJson,
  validateRecipeForm,
} from "./utils/addRecipeUtils";

export default function AddRecipeForm({
  ingredients: availableIngredients,
}: {
  ingredients: Omit<Ingredient, "amount">[];
}) {
  const [state, dispatch] = useReducer(
    addRecipeReducer,
    createInitialState(availableIngredients)
  );

  // Handle PDF file upload
  const handleFileUpload = (file: File) => {
    dispatch({ type: "SET_UPLOADED_FILE", file });
    dispatch({ type: "SET_ERROR", error: null });
  };

  // Handle PDF parsing with AI
  const handleParsePdf = async () => {
    if (!state.uploadedFile) return;

    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      // Extract text from PDF
      const text = await extractTextFromPdf(state.uploadedFile);
      dispatch({ type: "SET_EXTRACTED_TEXT", text });

      // Call the parse recipe action
      const { data, error } = await actions.parseRecipe({ text });

      if (error) {
        throw new Error(error.message || "Failed to parse recipe");
      }

      if (data) {
        // Set parsed recipe data
        dispatch({
          type: "SET_PARSED_RECIPE",
          recipe: data,
        });
      }
    } catch (error) {
      console.error("Error parsing PDF:", error);
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  };

  // Handle recipe name change
  const handleRecipeNameChange = (name: string) => {
    dispatch({ type: "SET_RECIPE_NAME", name });
  };

  // Handle ingredient updates
  const handleIngredientUpdate = (
    index: number,
    ingredient: Partial<IngredientFormData>
  ) => {
    dispatch({ type: "UPDATE_INGREDIENT", index, ingredient });
  };

  // Handle adding new ingredient
  const handleAddIngredient = () => {
    dispatch({ type: "ADD_INGREDIENT" });
  };

  // Handle removing ingredient
  const handleRemoveIngredient = (index: number) => {
    dispatch({ type: "REMOVE_INGREDIENT", index });
  };

  // Handle form submission (generate JSON)
  const handleGenerateJson = () => {
    const validation = validateRecipeForm(state.recipeName, state.ingredients);

    if (!validation.isValid) {
      dispatch({
        type: "SET_ERROR",
        error: validation.errors.join("; "),
      });
      return;
    }

    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_STEP", step: "output" });
  };

  // Handle form reset
  const handleResetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  // Generate JSON for output
  const getRecipeJson = () => {
    return transformToRecipeJson(state.recipeName, state.ingredients);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add New Recipe
        </h1>
        <p className="text-gray-600">
          Upload a PDF recipe and let AI parse it, or create one from scratch
        </p>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{state.error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      {state.currentStep === "upload" && (
        <PdfUploadStep
          uploadedFile={state.uploadedFile}
          isLoading={state.isLoading}
          onFileUpload={handleFileUpload}
          onParsePdf={handleParsePdf}
        />
      )}

      {state.currentStep === "edit" && (
        <RecipeEditStep
          recipeName={state.recipeName}
          extractedText={state.extractedText}
          ingredients={state.ingredients}
          availableIngredients={state.availableIngredients}
          onRecipeNameChange={handleRecipeNameChange}
          onIngredientUpdate={handleIngredientUpdate}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onGenerateJson={handleGenerateJson}
          onBackToUpload={() => dispatch({ type: "SET_STEP", step: "upload" })}
        />
      )}

      {state.currentStep === "output" && (
        <CreateRecipeStep
          recipeJson={getRecipeJson()}
          onReset={handleResetForm}
          onBackToEdit={() => dispatch({ type: "SET_STEP", step: "edit" })}
        />
      )}
    </div>
  );
}

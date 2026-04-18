import { useReducer } from "react";
import { actions } from "astro:actions";
import type { Ingredient, Recipe } from "@/data/types";
import Button from "@/components/shared/Button";
import RecipeCard from "./RecipeCard";
import RecipeFormDialog from "./RecipeFormDialog";
import type { IngredientInput } from "./IngredientRow";

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

interface State {
  list: Recipe[];
  dialogMode: "add" | "edit" | null;
  editingRecipe: Recipe | null;
  isSubmitting: boolean;
}

type Action =
  | { type: "OPEN_ADD" }
  | { type: "OPEN_EDIT"; recipe: Recipe }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SAVE_SUCCESS"; recipe: Recipe }
  | { type: "DELETE_SUCCESS"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_ADD":
      return { ...state, dialogMode: "add", editingRecipe: null };

    case "OPEN_EDIT":
      return { ...state, dialogMode: "edit", editingRecipe: action.recipe };

    case "CLOSE_DIALOG":
      return {
        ...state,
        dialogMode: null,
        editingRecipe: null,
        isSubmitting: false,
      };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };

    case "SAVE_SUCCESS": {
      const updatedList = state.editingRecipe
        ? state.list.map((r) =>
            r.id === action.recipe.id ? action.recipe : r
          )
        : [action.recipe, ...state.list];
      return {
        ...state,
        list: updatedList,
        dialogMode: null,
        editingRecipe: null,
        isSubmitting: false,
      };
    }

    case "DELETE_SUCCESS":
      return {
        ...state,
        list: state.list.filter((r) => r.id !== action.id),
      };

    default:
      return state;
  }
}

export default function RecipeList({ recipes, ingredients }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    list: recipes,
    dialogMode: null,
    editingRecipe: null,
    isSubmitting: false,
  });

  async function handleSave({
    name,
    ingredients: ingredientInputs,
  }: {
    name: string;
    ingredients: IngredientInput[];
  }) {
    dispatch({ type: "SET_SUBMITTING", value: true });

    if (state.editingRecipe) {
      const { data, error } = await actions.recipes.update({
        id: state.editingRecipe.id,
        name,
        ingredients: ingredientInputs,
      });
      if (error || !data) {
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }
      dispatch({ type: "SAVE_SUCCESS", recipe: data });
    } else {
      const { data, error } = await actions.recipes.create({
        name,
        ingredients: ingredientInputs,
      });
      if (error || !data) {
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }
      dispatch({ type: "SAVE_SUCCESS", recipe: data });
    }
  }

  async function handleDelete(id: string) {
    await actions.recipes.delete({ id });
    dispatch({ type: "DELETE_SUCCESS", id });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
            >
              ← Home
            </a>
            <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          </div>
          <Button
            variant="primary"
            leftIcon="plus"
            onClick={() => dispatch({ type: "OPEN_ADD" })}
          >
            Add Recipe
          </Button>
        </header>

        {state.list.length === 0 ? (
          <p className="text-muted-foreground">
            No recipes yet. Add your first recipe to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {state.list.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => dispatch({ type: "OPEN_EDIT", recipe })}
                onDelete={() => handleDelete(recipe.id)}
              />
            ))}
          </div>
        )}

        {state.dialogMode !== null && (
          <RecipeFormDialog
            mode={state.dialogMode}
            recipe={state.editingRecipe ?? undefined}
            allIngredients={ingredients}
            isSubmitting={state.isSubmitting}
            onSave={handleSave}
            onClose={() => dispatch({ type: "CLOSE_DIALOG" })}
          />
        )}
      </div>
    </div>
  );
}

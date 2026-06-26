import { useReducer } from "react";
import Button from "@/components/shared/Button";
import PageLayout from "@/components/shared/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ingredient, Recipe } from "@/data/types";
import {
  createRecipeWithIngredients,
  deleteRecipe,
  updateRecipeWithIngredients,
} from "@/lib/database";
import { queryKeys } from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";
import RecipeCard from "./RecipeCard";
import RecipeFormDialog, { type SaveData } from "./RecipeFormDialog";

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

interface State {
  list: Recipe[];
  dialogMode: "add" | "edit" | null;
  editingRecipe: Recipe | null;
  deletingRecipe: Recipe | null;
  isSubmitting: boolean;
}

type Action =
  | { type: "OPEN_ADD" }
  | { type: "OPEN_EDIT"; recipe: Recipe }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SAVE_SUCCESS"; recipe: Recipe }
  | { type: "CONFIRM_DELETE"; recipe: Recipe }
  | { type: "CANCEL_DELETE" }
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

    case "CONFIRM_DELETE":
      return { ...state, deletingRecipe: action.recipe };

    case "CANCEL_DELETE":
      return { ...state, deletingRecipe: null };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };

    case "SAVE_SUCCESS": {
      const updatedList = state.editingRecipe
        ? state.list.map((r) => (r.id === action.recipe.id ? action.recipe : r))
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
        deletingRecipe: null,
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
    deletingRecipe: null,
    isSubmitting: false,
  });

  async function handleSave({
    name,
    ingredients: ingredientInputs,
    ingredientRowKeys,
    steps,
  }: SaveData) {
    dispatch({ type: "SET_SUBMITTING", value: true });

    // Map form row keys → ingredient indices (position in the ingredients array)
    const rowKeyToIndex = new Map<number, number>();
    ingredientRowKeys.forEach((rowKey, idx) => {
      rowKeyToIndex.set(rowKey, idx);
    });

    // Build steps with ingredient_indices instead of ingredient_ids
    const stepsToSave = steps
      .filter((s) => s.instruction.trim() !== "")
      .map((s, idx) => ({
        step_number: idx + 1,
        instruction: s.instruction.trim(),
        ingredient_indices: s.rowKeys
          .map((k) => rowKeyToIndex.get(k))
          .filter((i): i is number => i !== undefined),
      }));

    try {
      let savedRecipe: Recipe;

      if (state.editingRecipe) {
        savedRecipe = await updateRecipeWithIngredients(
          supabase,
          state.editingRecipe.id,
          name,
          ingredientInputs,
          stepsToSave
        );
      } else {
        savedRecipe = await createRecipeWithIngredients(
          supabase,
          name,
          ingredientInputs,
          stepsToSave
        );
      }

      dispatch({
        type: "SAVE_SUCCESS",
        recipe: savedRecipe,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
    } catch {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  }

  async function handleDelete(id: string) {
    dispatch({ type: "SET_SUBMITTING", value: true });
    try {
      await deleteRecipe(supabase, id);
      dispatch({ type: "SET_SUBMITTING", value: false });
      dispatch({ type: "DELETE_SUCCESS", id });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
    } catch {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  }

  return (
    <PageLayout
      title="Recipes"
      backUrl="/"
      backLabel="Home"
      actions={
        <Button
          variant="primary"
          leftIcon="plus"
          onClick={() => dispatch({ type: "OPEN_ADD" })}
        >
          Add Recipe
        </Button>
      }
    >
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
              onDelete={() => dispatch({ type: "CONFIRM_DELETE", recipe })}
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

      <Dialog
        open={state.deletingRecipe !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CANCEL_DELETE" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;
              {state.deletingRecipe?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "CANCEL_DELETE" })}
              disabled={state.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={state.isSubmitting}
              onClick={() =>
                state.deletingRecipe && handleDelete(state.deletingRecipe.id)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

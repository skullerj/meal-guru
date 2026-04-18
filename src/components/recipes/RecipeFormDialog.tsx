import { useRef, useState } from "react";
import type { Ingredient, Recipe } from "@/data/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/shared/Button";
import IngredientRow, { type IngredientInput } from "./IngredientRow";

interface Props {
  mode: "add" | "edit";
  recipe?: Recipe;
  allIngredients: Ingredient[];
  isSubmitting: boolean;
  onSave: (data: { name: string; ingredients: IngredientInput[] }) => void;
  onClose: () => void;
}

interface KeyedRow {
  id: number;
  data: IngredientInput;
}

function buildInitialRows(counter: { current: number }, recipe?: Recipe): KeyedRow[] {
  const inputs: IngredientInput[] =
    recipe && recipe.ingredients.length > 0
      ? recipe.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          amount: ri.amount,
          unit: ri.ingredient.unit,
        }))
      : [{ name: "", amount: 1, unit: "unit" as const }];

  return inputs.map((data) => ({ id: counter.current++, data }));
}

export default function RecipeFormDialog({
  mode,
  recipe,
  allIngredients,
  isSubmitting,
  onSave,
  onClose,
}: Props) {
  const counter = useRef(0);
  const [recipeName, setRecipeName] = useState(recipe?.name ?? "");
  const [rows, setRows] = useState<KeyedRow[]>(() =>
    buildInitialRows(counter, recipe)
  );

  function handleRowChange(index: number, value: IngredientInput) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, data: value } : r))
    );
  }

  function handleRowRemove(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddRow() {
    const id = counter.current++;
    setRows((prev) => [
      ...prev,
      { id, data: { name: "", amount: 1, unit: "unit" as const } },
    ]);
  }

  function handleSubmit() {
    onSave({
      name: recipeName,
      ingredients: rows
        .map((r) => r.data)
        .filter((r) => r.name.trim() !== ""),
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Recipe" : "Edit Recipe"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="recipe-name"
              className="text-sm font-medium text-foreground"
            >
              Recipe name
            </label>
            <input
              id="recipe-name"
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g. Chicken stir-fry"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Ingredients
            </span>
            {rows.map((row, i) => (
              <IngredientRow
                key={row.id}
                index={i}
                value={row.data}
                allIngredients={allIngredients}
                onChange={handleRowChange}
                onRemove={handleRowRemove}
              />
            ))}

            <Button
              variant="ghost"
              size="sm"
              leftIcon="plus"
              onClick={handleAddRow}
              className="self-start"
            >
              Add ingredient
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

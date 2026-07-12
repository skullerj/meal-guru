import { useRef, useState } from "react";
import Button from "@/components/shared/Button";
import IconButton from "@/components/shared/IconButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ingredient, Recipe, RecipeStep } from "@/data/types";
import type { IngredientInput } from "@/lib/database";
import IngredientRow from "./IngredientRow";

export interface StepDraft {
  step_number: number;
  instruction: string;
  /** KeyedRow.id values for ingredients linked to this step */
  rowKeys: number[];
}

export interface SaveData {
  name: string;
  ingredients: IngredientInput[];
  /** parallel to ingredients — the KeyedRow.id for each ingredient row */
  ingredientRowKeys: number[];
  steps: StepDraft[];
}

interface Props {
  mode: "add" | "edit";
  recipe?: Recipe;
  allIngredients: Ingredient[];
  isSubmitting: boolean;
  onSave: (data: SaveData) => void;
  onClose: () => void;
}

interface KeyedRow {
  id: number;
  data: IngredientInput;
}

function buildInitialRows(
  counter: { current: number },
  recipe?: Recipe
): KeyedRow[] {
  const inputs: IngredientInput[] =
    recipe && recipe.ingredients.length > 0
      ? recipe.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          amount: ri.amount,
          unit: ri.ingredient.unit,
          ingredient_id: ri.ingredient.id,
        }))
      : [{ name: "", amount: 1, unit: "unit" as const }];

  return inputs.map((data) => ({ id: counter.current++, data }));
}

function buildInitialSteps(
  recipe: Recipe | undefined,
  rows: KeyedRow[]
): StepDraft[] {
  if (!recipe?.steps || recipe.steps.length === 0) return [];
  // Map recipe_ingredient.id → KeyedRow.id using the order of recipe.ingredients
  const riIdToRowKey = new Map<string, number>();
  recipe.ingredients.forEach((ri, idx) => {
    if (rows[idx]) riIdToRowKey.set(ri.id, rows[idx].id);
  });
  return recipe.steps.map((step: RecipeStep) => ({
    step_number: step.step_number,
    instruction: step.instruction,
    rowKeys: step.ingredient_ids
      .map((riId) => riIdToRowKey.get(riId))
      .filter((k): k is number => k !== undefined),
  }));
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
  const [steps, setSteps] = useState<StepDraft[]>(() => {
    // rows state is not yet available here — we need to build rows first
    const initialRows = buildInitialRows({ current: 0 }, recipe);
    return buildInitialSteps(recipe, initialRows);
  });

  function handleRowChange(index: number, value: IngredientInput) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, data: value } : r))
    );
  }

  function handleRowRemove(index: number) {
    const removedKey = rows[index]?.id;
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (removedKey !== undefined) {
      // Remove the deleted row key from all steps
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          rowKeys: s.rowKeys.filter((k) => k !== removedKey),
        }))
      );
    }
  }

  function handleAddRow() {
    const id = counter.current++;
    setRows((prev) => [
      ...prev,
      { id, data: { name: "", amount: 1, unit: "unit" as const } },
    ]);
  }

  function handleAddStep() {
    const nextNumber =
      steps.length > 0 ? Math.max(...steps.map((s) => s.step_number)) + 1 : 1;
    setSteps((prev) => [
      ...prev,
      { step_number: nextNumber, instruction: "", rowKeys: [] },
    ]);
  }

  function handleStepInstructionChange(index: number, instruction: string) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, instruction } : s))
    );
  }

  function handleStepIngredientToggle(stepIndex: number, rowKey: number) {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== stepIndex) return s;
        const already = s.rowKeys.includes(rowKey);
        return {
          ...s,
          rowKeys: already
            ? s.rowKeys.filter((k) => k !== rowKey)
            : [...s.rowKeys, rowKey],
        };
      })
    );
  }

  function handleRemoveStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const nonEmptyRows = rows.filter((r) => r.data.name.trim() !== "");
    onSave({
      name: recipeName,
      ingredients: nonEmptyRows.map((r) => r.data),
      ingredientRowKeys: nonEmptyRows.map((r) => r.id),
      steps,
    });
  }

  // Named rows that have a name — used for step ingredient selectors
  const namedRows = rows.filter((r) => r.data.name.trim() !== "");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Recipe" : "Edit Recipe"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 overflow-y-auto flex-1 min-h-0">
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
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-3">
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

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Steps</span>
            {steps.map((step, stepIndex) => (
              <div
                key={step.step_number}
                className="flex flex-col gap-2 border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Step {stepIndex + 1}
                  </span>
                  <IconButton
                    icon="trash"
                    variant="danger"
                    size="sm"
                    aria-label={`Remove step ${stepIndex + 1}`}
                    onClick={() => handleRemoveStep(stepIndex)}
                  />
                </div>
                <textarea
                  value={step.instruction}
                  onChange={(e) =>
                    handleStepInstructionChange(stepIndex, e.target.value)
                  }
                  placeholder="Describe what to do in this step..."
                  rows={2}
                  autoComplete="off"
                  className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {namedRows.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Ingredients used in this step:
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {namedRows.map((row) => (
                        <label
                          key={row.id}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={step.rowKeys.includes(row.id)}
                            onChange={() =>
                              handleStepIngredientToggle(stepIndex, row.id)
                            }
                            className="rounded border-border"
                          />
                          <span>{row.data.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              leftIcon="plus"
              onClick={handleAddStep}
              className="self-start"
            >
              Add step
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

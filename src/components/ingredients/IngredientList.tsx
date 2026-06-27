import { useState } from "react";
import IconButton from "@/components/shared/IconButton";
import type { Category, Ingredient, Unit } from "@/data/types";
import { CATEGORIES, UNITS } from "@/data/types";
import { deleteIngredient, updateIngredient } from "@/lib/database";
import { queryKeys } from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

interface IngredientListProps {
  ingredients: Ingredient[];
}

interface EditState {
  id: string;
  name: string;
  unit: Unit;
  category: Category;
}

const CATEGORY_BADGE: Record<NonNullable<Category>, string> = {
  produce: "bg-green-100 text-green-800",
  bakery: "bg-amber-100 text-amber-800",
  dairy: "bg-blue-100 text-blue-800",
  meat: "bg-red-100 text-red-800",
  canned: "bg-orange-100 text-orange-800",
  condiments: "bg-purple-100 text-purple-800",
  oils: "bg-lime-100 text-lime-800",
  spices: "bg-yellow-100 text-yellow-800",
  grains: "bg-stone-100 text-stone-800",
  frozen: "bg-cyan-100 text-cyan-800",
};

const CATEGORY_LABELS: Record<NonNullable<Category>, string> = {
  produce: "Produce",
  bakery: "Bakery",
  dairy: "Dairy",
  meat: "Meat",
  canned: "Canned Goods",
  condiments: "Condiments",
  oils: "Oils",
  spices: "Spices",
  grains: "Grains & Pasta",
  frozen: "Frozen",
};

export default function IngredientList({
  ingredients: initial,
}: IngredientListProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initial);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function startEdit(ingredient: Ingredient) {
    setEditing({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      category: ingredient.category,
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateIngredient(supabase, editing.id, {
        name: editing.name,
        unit: editing.unit,
        category: editing.category,
      });
      setIngredients((prev) =>
        prev.map((i) => (i.id === editing.id ? updated : i))
      );
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save ingredient");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ingredient? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteIngredient(supabase, id);
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete ingredient");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-lg border border-border">
      <ul className="divide-y divide-border/60">
        {ingredients.map((ingredient) => {
          const isEditing = editing?.id === ingredient.id;
          const isDeleting = deleting === ingredient.id;

          return (
            <li
              key={ingredient.id}
              className={cn(
                "px-4 py-3 transition-colors",
                isEditing ? "bg-accent/30" : "hover:bg-muted/30"
              )}
            >
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      autoComplete="off"
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing(
                          (prev) => prev && { ...prev, name: e.target.value }
                        )
                      }
                    />
                    <select
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.category ?? ""}
                      onChange={(e) =>
                        setEditing(
                          (prev) =>
                            prev && {
                              ...prev,
                              category: (e.target.value as Category) || null,
                            }
                        )
                      }
                    >
                      <option value="">— none —</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c] ?? c}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.unit}
                      onChange={(e) =>
                        setEditing(
                          (prev) =>
                            prev && { ...prev, unit: e.target.value as Unit }
                        )
                      }
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      icon="check"
                      aria-label="Save"
                      variant="primary"
                      size="sm"
                      loading={saving}
                      onClick={saveEdit}
                    />
                    <IconButton
                      icon="x"
                      aria-label="Cancel"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={cancelEdit}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm text-foreground font-medium">
                      {ingredient.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {ingredient.category ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            CATEGORY_BADGE[ingredient.category] ??
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {CATEGORY_LABELS[ingredient.category] ??
                            ingredient.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {ingredient.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton
                      icon="edit"
                      aria-label="Edit"
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting || deleting !== null}
                      onClick={() => startEdit(ingredient)}
                    />
                    <IconButton
                      icon="trash"
                      aria-label="Delete"
                      variant="danger"
                      size="sm"
                      loading={isDeleting}
                      disabled={deleting !== null && !isDeleting}
                      onClick={() => handleDelete(ingredient.id)}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {ingredients.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          No ingredients found.
        </p>
      )}
    </div>
  );
}

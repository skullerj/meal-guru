import { useState } from "react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/shared/IconButton";
import { CATEGORIES, UNITS } from "@/data/types";
import type { Category, Ingredient, Unit } from "@/data/types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

interface EditState {
  id: string;
  name: string;
  unit: Unit;
  category: Category;
}

const CATEGORY_BADGE: Record<string, string> = {
  produce: "bg-green-100 text-green-800",
  tins: "bg-orange-100 text-orange-800",
  dairy: "bg-blue-100 text-blue-800",
  meat: "bg-red-100 text-red-800",
  pantry: "bg-yellow-100 text-yellow-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  tins: "Tins",
  dairy: "Dairy",
  meat: "Meat",
  pantry: "Pantry",
};

export default function IngredientList({ ingredients: initial }: IngredientListProps) {
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
      const res = await fetch("/api/ingredients/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name: editing.name,
          unit: editing.unit,
          category: editing.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to save ingredient");
        return;
      }
      setIngredients((prev) =>
        prev.map((i) => (i.id === editing.id ? (data as Ingredient) : i))
      );
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ingredient? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/ingredients/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to delete ingredient");
        return;
      }
      setIngredients((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => {
            const isEditing = editing?.id === ingredient.id;
            const isDeleting = deleting === ingredient.id;

            return (
              <tr
                key={ingredient.id}
                className={cn(
                  "border-b border-border/60 last:border-0 transition-colors",
                  isEditing ? "bg-accent/30" : "hover:bg-muted/30"
                )}
              >
                {/* Name */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      autoComplete="off"
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing((prev) => prev && { ...prev, name: e.target.value })
                      }
                    />
                  ) : (
                    <span className="text-foreground font-medium">{ingredient.name}</span>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      className="rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.category ?? ""}
                      onChange={(e) =>
                        setEditing((prev) =>
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
                  ) : ingredient.category ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        CATEGORY_BADGE[ingredient.category] ?? "bg-muted text-muted-foreground"
                      )}
                    >
                      {CATEGORY_LABELS[ingredient.category] ?? ingredient.category}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>

                {/* Unit */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      className="rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editing.unit}
                      onChange={(e) =>
                        setEditing((prev) =>
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
                  ) : (
                    <span className="text-muted-foreground">{ingredient.unit}</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {ingredients.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          No ingredients found.
        </p>
      )}
    </div>
  );
}

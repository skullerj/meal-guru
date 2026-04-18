import type { Ingredient, Unit } from "@/data/types";
import IconButton from "@/components/shared/IconButton";

export interface IngredientInput {
  name: string;
  amount: number;
  unit: Unit;
}

const UNITS: Unit[] = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "unit",
];

interface Props {
  index: number;
  value: IngredientInput;
  allIngredients: Ingredient[];
  onChange: (index: number, value: IngredientInput) => void;
  onRemove: (index: number) => void;
}

export default function IngredientRow({
  index,
  value,
  allIngredients,
  onChange,
  onRemove,
}: Props) {
  const listId = `ingredient-suggestions-${index}`;

  return (
    <div className="flex items-center gap-2">
      <datalist id={listId}>
        {allIngredients.map((ing) => (
          <option key={ing.id} value={ing.name} />
        ))}
      </datalist>

      <input
        type="text"
        list={listId}
        value={value.name}
        onChange={(e) => onChange(index, { ...value, name: e.target.value })}
        placeholder="Ingredient name"
        className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <input
        type="number"
        min="0.01"
        step="0.01"
        value={value.amount}
        onChange={(e) =>
          onChange(index, { ...value, amount: Number(e.target.value) })
        }
        className="w-20 border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <select
        value={value.unit}
        onChange={(e) =>
          onChange(index, { ...value, unit: e.target.value as Unit })
        }
        className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <IconButton
        icon="trash"
        variant="danger"
        size="sm"
        aria-label="Remove ingredient"
        onClick={() => onRemove(index)}
      />
    </div>
  );
}

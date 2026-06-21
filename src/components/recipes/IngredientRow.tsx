import { useState } from "react";
import Icon from "@/components/shared/Icon";
import IconButton from "@/components/shared/IconButton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category, Ingredient, Unit } from "@/data/types";
import { CATEGORIES, UNITS } from "@/data/types";
import type { IngredientInput } from "@/lib/database";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
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

interface IngredientRowProps {
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
}: IngredientRowProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isExisting = Boolean(value.ingredient_id);

  const filtered = search.trim()
    ? allIngredients.filter((ing) =>
        ing.name.toLowerCase().includes(search.toLowerCase())
      )
    : allIngredients;

  const exactMatch = allIngredients.some(
    (ing) => ing.name.toLowerCase() === search.trim().toLowerCase()
  );

  function selectExisting(ing: Ingredient) {
    onChange(index, {
      ...value,
      name: ing.name,
      unit: ing.unit,
      ingredient_id: ing.id,
    });
    setSearch("");
    setOpen(false);
  }

  function createNew(name: string) {
    onChange(index, {
      ...value,
      name,
      ingredient_id: undefined,
    });
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex-1 flex items-center justify-between border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring h-[30px]",
              value.name ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className="truncate">{value.name || "Ingredient name"}</span>
            <Icon
              name="chevron-right"
              size="xs"
              className="ml-1 shrink-0 opacity-50 rotate-90"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search ingredients..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No ingredients found.</CommandEmpty>
              {filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((ing) => (
                    <CommandItem
                      key={ing.id}
                      value={ing.name}
                      onSelect={() => selectExisting(ing)}
                    >
                      <span className="flex-1">{ing.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {ing.unit}
                      </span>
                      {value.ingredient_id === ing.id && (
                        <Icon name="check" size="xs" className="ml-1" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {search.trim() && !exactMatch && (
                <CommandGroup>
                  <CommandItem
                    value={`create:${search.trim()}`}
                    onSelect={() => createNew(search.trim())}
                  >
                    <Icon name="plus" size="xs" className="mr-1" />
                    Create "{search.trim()}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <input
        type="number"
        min="0.01"
        step="0.01"
        value={value.amount}
        autoComplete="off"
        onChange={(e) =>
          onChange(index, { ...value, amount: Number(e.target.value) })
        }
        className="w-20 border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <select
        value={value.unit}
        disabled={isExisting}
        onChange={(e) =>
          onChange(index, { ...value, unit: e.target.value as Unit })
        }
        className={cn(
          "border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          isExisting && "opacity-50 cursor-not-allowed"
        )}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <select
        value={value.category ?? ""}
        disabled={isExisting}
        onChange={(e) =>
          onChange(index, {
            ...value,
            category: (e.target.value as Category) || null,
          })
        }
        className={cn(
          "border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          isExisting && "opacity-50 cursor-not-allowed"
        )}
      >
        <option value="">Category</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c] ?? c}
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

import { useState } from "react";
import type { Ingredient } from "../../lib/database";
import Button from "../shared/Button";
import SearchIngredientInput from "../shared/SearchIngredientInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface AddIngredientDialogProps {
  availableIngredients: Omit<Ingredient, "amount">[];
  onAddIngredient: (ingredient: Omit<Ingredient, "amount">, amount: number) => void;
  trigger: React.ReactNode;
}

export default function AddIngredientDialog({
  availableIngredients,
  onAddIngredient,
  trigger,
}: AddIngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Omit<Ingredient, "amount"> | null>(null);
  const [ingredientName, setIngredientName] = useState("");
  const [amount, setAmount] = useState<number>(1);

  const handleIngredientSelect = (ingredient: Omit<Ingredient, "amount">) => {
    setSelectedIngredient(ingredient);
    setIngredientName(ingredient.name);
  };

  const handleIngredientNameChange = (name: string) => {
    setIngredientName(name);
    setSelectedIngredient(null);
  };

  const handleAddIngredient = () => {
    if (selectedIngredient && amount > 0) {
      onAddIngredient(selectedIngredient, amount);
      // Reset form
      setSelectedIngredient(null);
      setIngredientName("");
      setAmount(1);
      setOpen(false);
    }
  };

  const canAdd = selectedIngredient && amount > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Extra Ingredient</DialogTitle>
          <DialogDescription>
            Add an ingredient from your database to your shopping list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Ingredient Selection */}
          <div className="grid gap-2">
            <SearchIngredientInput
              value={ingredientName}
              availableIngredients={availableIngredients}
              selectedIngredient={selectedIngredient}
              onIngredientChange={handleIngredientNameChange}
              onIngredientSelect={handleIngredientSelect}
              placeholder="Search for an ingredient..."
              label="Ingredient"
              required
              showExistingBadge={false}
            />
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                id="amount"
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
              {selectedIngredient && (
                <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                  {selectedIngredient.unit}
                </span>
              )}
            </div>
          </div>

          {/* Selected Ingredient Info */}
          {selectedIngredient && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="text-sm font-medium text-blue-900">
                {selectedIngredient.name}
              </div>
              <div className="text-xs text-blue-700">
                Unit: {selectedIngredient.unit} |
                Shelf item: {selectedIngredient.shelf ? "Yes" : "No"} |
                Price: £{selectedIngredient.source.price.toFixed(2)} per {selectedIngredient.source.amount} {selectedIngredient.unit}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddIngredient}
            disabled={!canAdd}
          >
            Add Ingredient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
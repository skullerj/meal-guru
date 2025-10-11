import { useState } from "react";
import { actions } from "astro:actions";
import type { Ingredient } from "../../lib/database";
import type { UnitType } from "../../data/recipes";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import IngredientForm from "./IngredientForm";

interface AddIngredientDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (ingredient: Ingredient) => void;
}

export default function AddIngredientDialog({
	isOpen,
	onClose,
	onSuccess,
}: AddIngredientDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFormSubmit = async (ingredientData: {
		name: string;
		unit: UnitType;
		shelf: boolean;
		source: { url: string; price: number; amount: number };
	}) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await actions.createIngredient(ingredientData);

			if (result.error) {
				throw new Error(result.error.message);
			}

			if (result.data?.ingredient) {
				onSuccess(result.data.ingredient as Ingredient);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create ingredient"
			);
			console.error("Error creating ingredient:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Ingredient</DialogTitle>
					<DialogDescription>
						Create a new ingredient to use in your recipes.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				<IngredientForm
					onSubmit={handleFormSubmit}
					onCancel={onClose}
					submitLabel="Add Ingredient"
					isLoading={isLoading}
				/>
			</DialogContent>
		</Dialog>
	);
}

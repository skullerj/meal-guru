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

interface EditIngredientDialogProps {
	isOpen: boolean;
	ingredient: Ingredient | null;
	onClose: () => void;
	onSuccess: (ingredient: Ingredient) => void;
}

export default function EditIngredientDialog({
	isOpen,
	ingredient,
	onClose,
	onSuccess,
}: EditIngredientDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFormSubmit = async (ingredientData: {
		name: string;
		unit: UnitType;
		shelf: boolean;
		source: { url: string; price: number; amount: number };
	}) => {
		if (!ingredient) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await actions.updateIngredient({
				id: ingredient.id,
				...ingredientData,
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			if (result.data?.ingredient) {
				onSuccess(result.data.ingredient as Ingredient);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update ingredient"
			);
			console.error("Error updating ingredient:", err);
		} finally {
			setIsLoading(false);
		}
	};

	if (!ingredient) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Ingredient</DialogTitle>
					<DialogDescription>
						Update the ingredient information.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				<IngredientForm
					initialData={ingredient}
					onSubmit={handleFormSubmit}
					onCancel={onClose}
					submitLabel="Update Ingredient"
					isLoading={isLoading}
				/>
			</DialogContent>
		</Dialog>
	);
}

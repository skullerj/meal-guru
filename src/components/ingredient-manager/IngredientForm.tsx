import { useEffect, useState } from "react";
import type { Ingredient } from "../../lib/database";
import type { UnitType } from "../../data/recipes";
import Button from "../shared/Button";

interface IngredientFormProps {
	initialData?: Ingredient | null;
	onSubmit: (ingredientData: {
		name: string;
		unit: UnitType;
		shelf: boolean;
		source: { url: string; price: number; amount: number };
	}) => void;
	onCancel: () => void;
	submitLabel?: string;
	isLoading?: boolean;
}

const UNITS: UnitType[] = [
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

export default function IngredientForm({
	initialData,
	onSubmit,
	onCancel,
	submitLabel = "Submit",
	isLoading = false,
}: IngredientFormProps) {
	const [name, setName] = useState("");
	const [unit, setUnit] = useState<UnitType>("g");
	const [shelf, setShelf] = useState(false);
	const [sourceUrl, setSourceUrl] = useState("");
	const [sourcePrice, setSourcePrice] = useState("");
	const [sourceAmount, setSourceAmount] = useState("");

	useEffect(() => {
		if (initialData) {
			setName(initialData.name);
			setUnit(initialData.unit);
			setShelf(initialData.shelf);
			setSourceUrl(initialData.source.url);
			setSourcePrice(initialData.source.price.toString());
			setSourceAmount(initialData.source.amount.toString());
		} else {
			setName("");
			setUnit("g");
			setShelf(false);
			setSourceUrl("");
			setSourcePrice("");
			setSourceAmount("");
		}
	}, [initialData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSubmit({
			name,
			unit,
			shelf,
			source: {
				url: sourceUrl,
				price: Number.parseFloat(sourcePrice) || 0,
				amount: Number.parseFloat(sourceAmount) || 0,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-4">
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Name *
					</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="unit"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Unit *
					</label>
					<select
						id="unit"
						value={unit}
						onChange={(e) => setUnit(e.target.value as UnitType)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					>
						{UNITS.map((u) => (
							<option key={u} value={u}>
								{u}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center">
					<input
						id="shelf"
						type="checkbox"
						checked={shelf}
						onChange={(e) => setShelf(e.target.checked)}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label htmlFor="shelf" className="ml-2 block text-sm text-gray-700">
						Shelf item (already in pantry)
					</label>
				</div>

				<div className="border-t pt-4">
					<h4 className="text-sm font-medium text-gray-700 mb-3">
						Source Information (Optional)
					</h4>

					<div className="space-y-3">
						<div>
							<label
								htmlFor="sourceUrl"
								className="block text-sm text-gray-600 mb-1"
							>
								URL
							</label>
							<input
								id="sourceUrl"
								type="url"
								value={sourceUrl}
								onChange={(e) => setSourceUrl(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="https://example.com/product"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="sourcePrice"
									className="block text-sm text-gray-600 mb-1"
								>
									Price (£)
								</label>
								<input
									id="sourcePrice"
									type="number"
									step="0.01"
									min="0"
									value={sourcePrice}
									onChange={(e) => setSourcePrice(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="0.00"
								/>
							</div>

							<div>
								<label
									htmlFor="sourceAmount"
									className="block text-sm text-gray-600 mb-1"
								>
									Amount ({unit})
								</label>
								<input
									id="sourceAmount"
									type="number"
									step="0.01"
									min="0"
									value={sourceAmount}
									onChange={(e) => setSourceAmount(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="0"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-6 flex justify-end gap-3">
				<Button
					type="button"
					variant="secondary"
					onClick={onCancel}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="primary"
					disabled={!name.trim() || isLoading}
					loading={isLoading}
				>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}

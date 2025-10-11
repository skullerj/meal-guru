import type { Ingredient } from "../../lib/database";
import Icon from "../shared/Icon";
import IconButton from "../shared/IconButton";

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
}

export default function IngredientList({
  ingredients,
  onEdit,
  onDelete,
}: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Icon name="package" size="xl" className="mx-auto mb-4" />
        <p>No ingredients found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shelf
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {ingredient.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ingredient.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ingredient.shelf ? (
                  <Icon name="check-circle" size="sm" color="green" />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ingredient.source.url ? (
                  <a
                    href={ingredient.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    £{ingredient.source.price.toFixed(2)} (
                    {ingredient.source.amount}
                    {ingredient.unit})
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <IconButton
                    icon="edit"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ingredient)}
                    aria-label="Edit ingredient"
                  />
                  <IconButton
                    icon="delete"
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(ingredient.id)}
                    aria-label="Delete ingredient"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

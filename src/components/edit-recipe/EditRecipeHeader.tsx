import Button from "../shared/Button";
import Icon from "../shared/Icon";

interface EditRecipeHeaderProps {
  recipeName: string;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  onRecipeNameChange: (name: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function EditRecipeHeader({
  recipeName,
  hasUnsavedChanges,
  isLoading,
  onRecipeNameChange,
  onSave,
  onReset,
}: EditRecipeHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-6">
      <div className="flex justify-between items-end gap-2">
        {/* Recipe Name */}
        <div className="flex-1 max-w-lg">
          <label
            htmlFor="recipe-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipe Name
          </label>
          <input
            id="recipe-name"
            type="text"
            value={recipeName}
            onChange={(e) => onRecipeNameChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
            placeholder="Enter recipe name..."
            disabled={isLoading}
          />
        </div>
        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center text-sm text-amber-600 align-center">
            <Icon
              name="warning"
              size="xs"
              className="mr-2"
              aria-label="Warning icon"
            />
            You have unsaved changes
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <a
            href={`/`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Icon
              name="arrow-left"
              size="xs"
              className="mr-2"
              aria-label="Back arrow"
            />
            Go Back
          </a>

          {/* Reset Button */}
          {hasUnsavedChanges && (
            <Button
              variant="secondary"
              onClick={onReset}
              disabled={isLoading}
              leftIcon="reset"
              size="sm"
            >
              Reset Changes
            </Button>
          )}

          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            loading={isLoading}
            leftIcon="save"
            size="sm"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

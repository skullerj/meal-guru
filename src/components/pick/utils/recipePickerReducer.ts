export interface RecipePickerState {
  selectedIds: string[];
  /** Number of selection changes so far — drives the reorder animation. */
  version: number;
}

export type RecipePickerAction = { type: "TOGGLE_RECIPE"; id: string };

export function recipePickerReducer(
  state: RecipePickerState,
  action: RecipePickerAction
): RecipePickerState {
  switch (action.type) {
    case "TOGGLE_RECIPE": {
      const isSelected = state.selectedIds.includes(action.id);
      const selectedIds = isSelected
        ? state.selectedIds.filter((id) => id !== action.id)
        : [...state.selectedIds, action.id];
      return { selectedIds, version: state.version + 1 };
    }
    default:
      return state;
  }
}

export function createInitialState(): RecipePickerState {
  return { selectedIds: [], version: 0 };
}

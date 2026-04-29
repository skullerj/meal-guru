export const TEST_RECIPE_NAME = "Test Pasta";
export const TEST_RECIPE_NAME_2 = "Test Chicken Soup";
export const TEST_RECIPE_NAME_3 = "Test Rice Bowl";

export const TEST_INGREDIENTS = [
  { name: "Spaghetti", unit: "g" as const, category: "pantry" as const },
  { name: "Tomato sauce", unit: "ml" as const, category: "tins" as const },
];

// All recipe names created during the E2E test suite — kept here so
// global-setup can wipe them before each run to ensure a clean state.
export const TEST_CREATED_RECIPES = [
  TEST_RECIPE_NAME,
  TEST_RECIPE_NAME_2,
  TEST_RECIPE_NAME_3,
  "Quick Omelette",
  "Test Pasta Updated",
  "Category Test Recipe",
];

// All ingredient names created during the E2E test suite.
export const TEST_CREATED_INGREDIENTS = ["Eggs", "TestCategoryIng"];

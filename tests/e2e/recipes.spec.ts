import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME } from "../fixtures/data";

test.describe.serial("Recipe CRUD", () => {
  test("shows seeded recipe on the list page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByText(TEST_RECIPE_NAME)).toBeVisible();
  });

  test("adds a new recipe with one ingredient", async ({ page }) => {
    await page.goto("/recipes");

    await page.getByRole("button", { name: "Add Recipe" }).click();
    await page.locator("#recipe-name").fill("Quick Omelette");

    // Open the ingredient picker for the first (empty) row
    await page.getByRole("button", { name: "Ingredient name" }).click();
    await page.getByPlaceholder("Search ingredients...").fill("Eggs");
    await page.getByText('Create "Eggs"').click();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Quick Omelette")).toBeVisible();
  });

  test("edits a recipe name", async ({ page }) => {
    await page.goto("/recipes");

    const card = page
      .getByTestId("recipe-card")
      .filter({ hasText: TEST_RECIPE_NAME });
    await card.getByLabel("Edit recipe").click();

    await page.locator("#recipe-name").clear();
    await page.locator("#recipe-name").fill("Test Pasta Updated");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Test Pasta Updated")).toBeVisible();
  });

  test("deletes a recipe", async ({ page }) => {
    await page.goto("/recipes");

    const card = page
      .getByTestId("recipe-card")
      .filter({ hasText: "Quick Omelette" });
    await expect(card).toBeVisible();
    await card.getByLabel("Delete recipe").click();

    await expect(page.getByText("Quick Omelette")).not.toBeVisible();
  });
});

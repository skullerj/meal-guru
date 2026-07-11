import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME } from "../fixtures/data";

test.describe
  .serial("Recipe CRUD", () => {
    test("shows seeded recipe on the list page", async ({ page }) => {
      await page.goto("/app/recipes");
      await expect(
        page.getByRole("heading", { name: TEST_RECIPE_NAME, exact: true })
      ).toBeVisible();
    });

    test("adds a new recipe with one ingredient", async ({ page }) => {
      await page.goto("/app/recipes");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Add Recipe" }).click();
      await page.locator("#recipe-name").fill("Quick Omelette");

      // Open the ingredient picker for the first (empty) row
      await page.getByRole("button", { name: "Ingredient name" }).click();
      await page.getByPlaceholder("Search ingredients...").fill("Eggs");
      await page.getByText('Create "Eggs"').click();

      // Select a category for the new ingredient (unit is first combobox, category is second)
      const ingredientRow = page
        .getByRole("dialog")
        .locator(".flex.items-center.gap-2")
        .first();
      await ingredientRow.getByRole("combobox").nth(1).selectOption("dairy");

      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Quick Omelette")).toBeVisible();
    });

    test("edits a recipe name", async ({ page }) => {
      await page.goto("/app/recipes");
      await page.waitForLoadState("networkidle");

      const card = page
        .getByTestId("recipe-card")
        .filter({ hasText: TEST_RECIPE_NAME });
      await card.getByRole("button", { name: "Edit recipe" }).click();

      await page.locator("#recipe-name").clear();
      await page.locator("#recipe-name").fill("Test Pasta Updated");

      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Test Pasta Updated")).toBeVisible();
    });

    test("cancel delete keeps the recipe", async ({ page }) => {
      await page.goto("/app/recipes");
      await page.waitForLoadState("networkidle");

      const card = page
        .getByTestId("recipe-card")
        .filter({ hasText: "Quick Omelette" });
      await expect(card).toBeVisible();
      await card.getByRole("button", { name: "Delete recipe" }).click();

      await expect(
        page.getByRole("heading", { name: "Delete recipe" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();

      await expect(card).toBeVisible();
    });

    test("deletes a recipe after confirmation", async ({ page }) => {
      await page.goto("/app/recipes");
      await page.waitForLoadState("networkidle");

      const card = page
        .getByTestId("recipe-card")
        .filter({ hasText: "Quick Omelette" });
      await expect(card).toBeVisible();
      await card.getByRole("button", { name: "Delete recipe" }).click();

      await expect(
        page.getByRole("heading", { name: "Delete recipe" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Delete" }).click();

      await expect(card).not.toBeVisible();
    });
  });

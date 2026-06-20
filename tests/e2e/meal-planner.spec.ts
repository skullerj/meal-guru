import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME } from "../fixtures/data";

test.describe
  .serial("Meal Planner", () => {
    test("shows seeded recipe on the pick page", async ({ page }) => {
      await page.goto("/pick");
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
      ).toBeVisible();
    });

    test("selecting a recipe shows its ingredients in the shopping list", async ({
      page,
    }) => {
      await page.goto("/pick");
      await page.waitForLoadState("networkidle");

      const shoppingList = page.locator("aside");

      // Shopping list is empty before selection
      await expect(
        shoppingList.getByText("Select recipes to see your shopping list")
      ).toBeVisible();

      // Click the recipe card to select it
      await page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .click();

      // Ingredients should now appear in the shopping list
      await expect(
        shoppingList.getByText("Spaghetti", { exact: true })
      ).toBeVisible();
      await expect(
        shoppingList.getByText("Tomato sauce", { exact: true })
      ).toBeVisible();
    });

    test("selecting a recipe shows category headings in the shopping list", async ({
      page,
    }) => {
      await page.goto("/pick");
      await page.waitForLoadState("networkidle");

      const shoppingList = page.locator("aside");

      await page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .click();

      // Tomato sauce is always in "tins"; Spaghetti may be in "pantry" or
      // "produce" depending on whether the ingredients edit test ran first
      await expect(
        shoppingList.getByText("Tins", { exact: true })
      ).toBeVisible();
      // Should have at least 2 distinct category headings (one per ingredient category)
      const headings = shoppingList.locator("h3");
      expect(await headings.count()).toBeGreaterThanOrEqual(2);
    });

    test("deselecting a recipe removes its ingredients from the shopping list", async ({
      page,
    }) => {
      await page.goto("/pick");
      await page.waitForLoadState("networkidle");

      const shoppingList = page.locator("aside");
      const recipeButton = page.getByRole("button", {
        name: new RegExp(TEST_RECIPE_NAME),
      });

      // Select the recipe
      await recipeButton.click();
      await expect(
        shoppingList.getByText("Spaghetti", { exact: true })
      ).toBeVisible();

      // Deselect the recipe by clicking again
      await recipeButton.click();

      // Shopping list should be empty again
      await expect(
        shoppingList.getByText("Select recipes to see your shopping list")
      ).toBeVisible();
      await expect(
        shoppingList.getByText("Spaghetti", { exact: true })
      ).not.toBeVisible();
      await expect(
        shoppingList.getByText("Tomato sauce", { exact: true })
      ).not.toBeVisible();
    });
  });

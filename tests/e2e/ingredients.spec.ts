import { expect, test } from "@playwright/test";
import { TEST_INGREDIENTS } from "../fixtures/data";

test.describe
  .serial("Ingredient management", () => {
    test("shows seeded ingredient on the list page", async ({ page }) => {
      await page.goto("/ingredients");
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(TEST_INGREDIENTS[0].name)).toBeVisible();
    });

    test("edits an ingredient category", async ({ page }) => {
      await page.goto("/ingredients");
      await page.waitForLoadState("networkidle");

      // Find the row containing the Spaghetti ingredient
      const row = page
        .getByRole("row")
        .filter({ hasText: TEST_INGREDIENTS[0].name });
      await row.getByRole("button", { name: "Edit" }).click();

      // The category select is now visible in edit mode; change it to "produce"
      await row.getByRole("combobox").first().selectOption("produce");

      await row.getByRole("button", { name: "Save" }).click();

      // After save the row exits edit mode and shows the Produce badge
      await expect(row.getByText("Produce")).toBeVisible();
    });

    test("creates an ingredient with category via recipe form", async ({
      page,
    }) => {
      await page.goto("/recipes");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Add Recipe" }).click();
      await page.locator("#recipe-name").fill("Category Test Recipe");

      // Open the ingredient picker for the first empty row
      await page.getByRole("button", { name: "Ingredient name" }).click();
      await page
        .getByPlaceholder("Search ingredients...")
        .fill("TestCategoryIng");
      await page.getByText('Create "TestCategoryIng"').click();

      // Select category for the new (non-existing) ingredient row
      // The category select is the second combobox in the row (after unit select)
      const ingredientRow = page.locator(".flex.items-center.gap-2").first();
      const selects = ingredientRow.getByRole("combobox");
      // unit select is first, category select is second
      await selects.nth(1).selectOption("pantry");

      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.getByText("Category Test Recipe")).toBeVisible();
    });
  });

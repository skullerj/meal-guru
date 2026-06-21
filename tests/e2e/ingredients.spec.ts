import { expect, test } from "@playwright/test";
import { TEST_INGREDIENTS } from "../fixtures/data";

test.describe
  .serial("Ingredient management", () => {
    test("shows seeded ingredient on the list page", async ({ page }) => {
      await page.goto("/ingredients");
      await page.waitForLoadState("networkidle");

      await expect(
        page.locator("span", { hasText: TEST_INGREDIENTS[0].name })
      ).toBeVisible();
    });

    test("edits an ingredient category", async ({ page }) => {
      await page.goto("/ingredients");
      await page.waitForLoadState("networkidle");

      // Find the Spaghetti row's Edit button via its cell text
      const row = page.getByRole("row").filter({
        has: page.getByRole("cell", { name: TEST_INGREDIENTS[0].name }),
      });
      await row.getByRole("button", { name: "Edit" }).click();

      // Wait for edit mode — combobox appears
      const categoryCombobox = row.getByRole("combobox").first();
      await expect(categoryCombobox).toBeVisible({ timeout: 10000 });

      // Change category to produce
      await categoryCombobox.selectOption("produce");

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
      const ingredientRow = page
        .getByRole("dialog")
        .locator(".flex.items-center.gap-2")
        .first();
      const selects = ingredientRow.getByRole("combobox");
      // unit select is first, category select is second
      await selects.nth(1).selectOption("pantry");

      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.getByText("Category Test Recipe")).toBeVisible();
    });
  });

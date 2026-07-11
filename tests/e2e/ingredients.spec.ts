import { expect, test } from "@playwright/test";
import { TEST_INGREDIENTS } from "../fixtures/data";

test.describe
  .serial("Ingredient management", () => {
    test("shows seeded ingredient on the list page", async ({ page }) => {
      await page.goto("/app/ingredients");
      await page.waitForLoadState("networkidle");

      await expect(
        page.locator("span", { hasText: TEST_INGREDIENTS[0].name })
      ).toBeVisible();
    });

    test("edits an ingredient category", async ({ page }) => {
      await page.goto("/app/ingredients");
      await page.waitForLoadState("networkidle");

      // Find the list item containing the ingredient name (view mode — span visible)
      const item = page.getByRole("listitem").filter({
        has: page.locator("span", { hasText: TEST_INGREDIENTS[0].name }),
      });
      await item.getByRole("button", { name: "Edit" }).click();

      // After clicking Edit the span becomes an input, so re-locate via the input value
      const editingItem = page.getByRole("listitem").filter({
        has: page.locator(`input[value="${TEST_INGREDIENTS[0].name}"]`),
      });

      // Wait for edit mode — combobox appears
      const categoryCombobox = editingItem.getByRole("combobox").first();
      await expect(categoryCombobox).toBeVisible({ timeout: 10000 });

      // Change category to produce
      await categoryCombobox.selectOption("produce");

      await editingItem.getByRole("button", { name: "Save" }).click();

      // After save the item exits edit mode and shows the Produce badge
      await expect(item.getByText("Produce")).toBeVisible();
    });

    test("creates an ingredient with category via recipe form", async ({
      page,
    }) => {
      await page.goto("/app/recipes");
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
      await selects.nth(1).selectOption("grains");

      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.getByText("Category Test Recipe")).toBeVisible();
    });
  });

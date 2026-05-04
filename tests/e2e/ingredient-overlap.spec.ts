import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME, TEST_RECIPE_NAME_2 } from "../fixtures/data";

test.describe("Ingredient overlap signal", () => {
  test("shared ingredient shows overlap badge, unique ingredient does not", async ({
    page,
  }) => {
    await page.goto("/pick");
    await page.waitForLoadState("networkidle");

    const shoppingList = page.locator("aside");

    // Select the first recipe (has Spaghetti + Tomato sauce)
    await page
      .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME, "i") })
      .first()
      .click();

    // Select the second recipe (has Tomato sauce + Chicken breast)
    await page
      .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME_2) })
      .click();

    // Tomato sauce is shared between both recipes — should show ×2 badge
    const tomatoRow = shoppingList
      .locator("li")
      .filter({ hasText: "Tomato sauce" });
    await expect(tomatoRow.getByText("×2")).toBeVisible();

    // Spaghetti is only in one recipe — should NOT show a badge
    const spaghettiRow = shoppingList
      .locator("li")
      .filter({ hasText: "Spaghetti" });
    await expect(spaghettiRow.getByText(/×\d/)).not.toBeVisible();

    // Chicken breast is only in one recipe — should NOT show a badge
    const chickenRow = shoppingList
      .locator("li")
      .filter({ hasText: "Chicken breast" });
    await expect(chickenRow.getByText(/×\d/)).not.toBeVisible();
  });
});

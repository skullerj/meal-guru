import { expect, test } from "@playwright/test";
import {
  TEST_RECIPE_NAME,
  TEST_RECIPE_NAME_2,
  TEST_RECIPE_NAME_3,
} from "../fixtures/data";

test.describe("Ingredient overlap signal", () => {
  test("pairing line shows shared ingredients and flags recipes with none", async ({
    page,
  }) => {
    await page.goto("/app/pick");
    await page.waitForLoadState("networkidle");

    // No pairing lines before anything is selected
    await expect(page.getByText("nothing shared")).toHaveCount(0);

    // Select the first recipe (Spaghetti + Tomato sauce)
    await page
      .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
      .first()
      .click();

    // The second recipe shares Tomato sauce
    const sharedCard = page
      .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME_2) })
      .first();
    await expect(sharedCard).toContainText("tomato sauce");

    // The third recipe has no ingredients, so nothing overlaps
    const unsharedCard = page
      .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME_3) })
      .first();
    await expect(unsharedCard).toContainText("nothing shared");
  });
});

import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME, TEST_RECIPE_NAME_3 } from "../fixtures/data";

test.describe("Cooking view", () => {
  test("shows overview screen with recipe name and ingredients", async ({
    page,
  }) => {
    const recipeId = process.env.TEST_RECIPE_ID;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");

    // Overview screen
    await expect(
      page.getByRole("heading", { name: TEST_RECIPE_NAME })
    ).toBeVisible();
    await expect(page.getByText("2 ingredients")).toBeVisible();
    await expect(page.getByText("2 steps")).toBeVisible();

    // All ingredients listed
    await expect(page.getByText("200g Spaghetti")).toBeVisible();
    await expect(page.getByText("150ml Tomato sauce")).toBeVisible();

    // Start cooking button
    await expect(
      page.getByRole("button", { name: "Start cooking" })
    ).toBeVisible();
  });

  test("navigates through steps with prev/next", async ({ page }) => {
    const recipeId = process.env.TEST_RECIPE_ID;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");

    // Click start cooking
    await page.getByRole("button", { name: "Start cooking" }).click();

    // Step 1
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
    await expect(
      page.locator("p", {
        hasText: "Boil the spaghetti in salted water for 10 minutes",
      })
    ).toBeVisible();
    // Step 1 ingredient: Spaghetti
    await expect(page.getByText("200g Spaghetti")).toBeVisible();

    // Previous goes back to overview on step 1
    const prevButton = page.getByRole("button", { name: "Previous" });
    await expect(prevButton).toBeEnabled();

    // Go to step 2
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(
      page.locator("p", {
        hasText: "Heat the tomato sauce and mix with the drained pasta",
      })
    ).toBeVisible();

    // Step 2 ingredients: Tomato sauce + Spaghetti
    await expect(page.getByText("150ml Tomato sauce")).toBeVisible();

    // Last step shows Done instead of Next
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).not.toBeVisible();

    // Go back to step 1
    await page.getByRole("button", { name: "Previous" }).click();
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
  });

  test("shows empty state for recipe without steps", async ({ page }) => {
    // TEST_RECIPE_NAME_3 ("Test Rice Bowl") has no steps seeded
    const recipeId = process.env.TEST_RECIPE_ID_3;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No cooking instructions yet")).toBeVisible();
  });

  test("recipe card links to cooking view when steps exist", async ({
    page,
  }) => {
    await page.goto("/app/recipes");
    await page.waitForLoadState("networkidle");

    const card = page
      .getByTestId("recipe-card")
      .filter({ hasText: TEST_RECIPE_NAME });
    const cookLink = card.getByRole("link", { name: "Cook recipe" });
    await expect(cookLink).toBeVisible();
    await cookLink.click();

    await expect(
      page.getByRole("heading", { name: TEST_RECIPE_NAME })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start cooking" })
    ).toBeVisible();
  });

  test("recipe card does not show cook link when no steps", async ({
    page,
  }) => {
    await page.goto("/app/recipes");
    await page.waitForLoadState("networkidle");

    const card = page
      .getByTestId("recipe-card")
      .filter({ hasText: TEST_RECIPE_NAME_3 });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("link", { name: "Cook recipe" })
    ).not.toBeVisible();
  });
});

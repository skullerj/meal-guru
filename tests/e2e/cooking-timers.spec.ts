import { expect, test } from "@playwright/test";

test.describe("Cooking step timers", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any leftover timer state
    await page.goto("/app");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() =>
      localStorage.removeItem("meal-guru-cooking-timers")
    );
  });

  // Helper to navigate to step 1
  async function goToStep1(page: import("@playwright/test").Page) {
    const recipeId = process.env.TEST_RECIPE_ID;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Start cooking" }).click();
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
  }

  test("shows timer button on steps with durations", async ({ page }) => {
    await goToStep1(page);
    // Step 1 mentions "10 minutes" so a timer button should appear
    await expect(page.getByRole("button", { name: /10 min/ })).toBeVisible();
  });

  test("does not show timer button on steps without durations", async ({
    page,
  }) => {
    await goToStep1(page);
    // Navigate to step 2 (no duration)
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    // No timer button should appear (only Previous and Done buttons should be there)
    await expect(
      page.getByRole("button", { name: /min|sec|hour/ })
    ).not.toBeVisible();
  });

  test("starts a timer and shows countdown", async ({ page }) => {
    await goToStep1(page);
    // Click the timer button
    await page.getByRole("button", { name: /10 min/ }).click();
    // Timer countdown should appear - look for the time display and controls
    // The countdown starts at 10:00 or 09:59
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
    // Pause button should appear
    await expect(
      page.getByRole("button", { name: "Pause timer" })
    ).toBeVisible();
  });

  test("timer button shows Running state after starting", async ({ page }) => {
    await goToStep1(page);
    await page.getByRole("button", { name: /10 min/ }).click();
    // The timer button should now be disabled and show "Running"
    await expect(page.getByRole("button", { name: /Running/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Running/ })).toBeDisabled();
  });

  test("pause and resume timer", async ({ page }) => {
    await goToStep1(page);
    await page.getByRole("button", { name: /10 min/ }).click();

    // Pause
    await page.getByRole("button", { name: "Pause timer" }).click();
    // After pausing, the Resume button should appear
    await expect(
      page.getByRole("button", { name: "Resume timer" })
    ).toBeVisible();
    // Timer button should show "Paused"
    await expect(page.getByRole("button", { name: /Paused/ })).toBeVisible();

    // Resume
    await page.getByRole("button", { name: "Resume timer" }).click();
    await expect(
      page.getByRole("button", { name: "Pause timer" })
    ).toBeVisible();
  });

  test("reset timer returns to original duration", async ({ page }) => {
    await goToStep1(page);
    await page.getByRole("button", { name: /10 min/ }).click();

    // Wait a moment so the timer decrements
    await page.waitForTimeout(1500);

    // Reset
    await page.getByRole("button", { name: "Reset timer" }).click();
    // After reset, timer should show 10:00 and the start button should appear
    await expect(page.getByText("10:00")).toBeVisible();
  });

  test("dismiss timer removes it", async ({ page }) => {
    await goToStep1(page);
    await page.getByRole("button", { name: /10 min/ }).click();

    // Dismiss
    await page.getByRole("button", { name: "Dismiss timer" }).click();
    // Timer countdown should be gone
    await expect(
      page.getByRole("button", { name: "Pause timer" })
    ).not.toBeVisible();
    // The timer start button should be back to its original state
    await expect(page.getByRole("button", { name: /10 min/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /10 min/ })).toBeEnabled();
  });

  test("floating summary shows timer when navigating to another step", async ({
    page,
  }) => {
    await goToStep1(page);
    // Start a timer on step 1
    await page.getByRole("button", { name: /10 min/ }).click();

    // Navigate to step 2
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();

    // The floating summary should show the step 1 timer
    await expect(page.getByText(/Step 1:/)).toBeVisible();
  });

  test("Done button clears all timers", async ({ page }) => {
    await goToStep1(page);
    // Start a timer
    await page.getByRole("button", { name: /10 min/ }).click();

    // Navigate to last step
    await page.getByRole("button", { name: "Next" }).click();

    // Click Done
    await page.getByRole("button", { name: "Done" }).click();

    // Navigate back to the recipe cooking view
    const recipeId = process.env.TEST_RECIPE_ID;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Start cooking" }).click();

    // No floating summary should be visible (no timers)
    await expect(page.getByText(/Step 1:/)).not.toBeVisible();
    // Timer button should be in its original state (not "Running")
    await expect(page.getByRole("button", { name: /10 min/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /10 min/ })).toBeEnabled();
  });

  test("timer persists across page reload", async ({ page }) => {
    await goToStep1(page);
    // Start a timer
    await page.getByRole("button", { name: /10 min/ }).click();
    await expect(
      page.getByRole("button", { name: "Pause timer" })
    ).toBeVisible();

    // Reload the page
    const recipeId = process.env.TEST_RECIPE_ID;
    await page.goto(`/app/recipe/${recipeId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Start cooking" }).click();

    // Timer should still be active (shows Running or countdown)
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
    // Timer button should still show Running state
    await expect(page.getByRole("button", { name: /Running/ })).toBeVisible();
  });
});

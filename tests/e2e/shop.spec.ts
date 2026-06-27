import { expect, test } from "@playwright/test";

test.describe
  .serial("Persistent weekly shop", () => {
    let shopUrl: string;
    let newShopUrl: string;

    test("Start the week creates a shop and navigates to /shop/[id]", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Start the week" }).click();

      // Should navigate to /shop/<uuid>
      await page.waitForURL(/\/shop\/[0-9a-f-]+/);
      await page.waitForLoadState("networkidle");

      // Save the URL for subsequent tests
      shopUrl = page.url();

      // Should show the shopping list heading
      await expect(
        page.getByRole("heading", { name: "Your shopping list" })
      ).toBeVisible();
    });

    test("refreshing the page loads the same shop", async ({ page }) => {
      // Navigate to the same shop URL from previous test
      await page.goto(new URL(shopUrl).pathname);
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("heading", { name: "Your shopping list" })
      ).toBeVisible();
    });

    test("Start the week again returns the same shop (idempotent within the week)", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Go to shopping list" }).click();
      await page.waitForURL(/\/shop\/[0-9a-f-]+/);

      // Should be the same shop URL as before
      expect(page.url()).toBe(shopUrl);
    });

    test("Start new week creates a different shop", async ({ page }) => {
      await page.goto(new URL(shopUrl).pathname);
      await page.waitForLoadState("networkidle");

      const oldPath = new URL(shopUrl).pathname;

      await page.getByRole("button", { name: "Start new week" }).click();

      // Wait until the URL changes away from the current shop
      await page.waitForFunction(
        (path) => window.location.pathname !== path,
        oldPath
      );
      await page.waitForLoadState("networkidle");

      // The new URL should be different from the original
      expect(page.url()).not.toBe(shopUrl);
      newShopUrl = page.url();

      await expect(
        page.getByRole("heading", { name: "Your shopping list" })
      ).toBeVisible();
    });

    test("checking an ingredient persists after reload", async ({ page }) => {
      // Each serial test gets a fresh page — navigate to the shop created by "Start new week"
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Get the first checkbox and remember its text so we can relocate it after click
      const firstCheckbox = page.getByRole("checkbox").first();
      await expect(firstCheckbox).toBeVisible();
      const itemText = (
        await firstCheckbox.locator("span.flex-1").textContent()
      )?.trim();
      await firstCheckbox.click();

      // Re-locate by text and verify it's checked via aria-checked
      const clickedItem = page.getByRole("checkbox", {
        name: new RegExp(itemText ?? ""),
      });
      await expect(clickedItem).toBeChecked();

      // Wait a moment for the toggle to persist
      await page.waitForTimeout(500);

      // Reload the page
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Find the item with the same text — it should still be checked
      const reloadedItem = page.getByRole("checkbox", {
        name: new RegExp(itemText ?? ""),
      });
      await expect(reloadedItem).toBeChecked();
    });

    test("unchecking an ingredient persists after reload", async ({ page }) => {
      // Navigate to the shop with the checked item
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Find the checked item and remember its text
      const checkedItem = page.getByRole("checkbox", { checked: true }).first();
      await expect(checkedItem).toBeVisible();
      const itemText = (
        await checkedItem.locator("span.flex-1").textContent()
      )?.trim();
      await checkedItem.click();

      // Re-locate by text and verify it's unchecked
      const clickedItem = page.getByRole("checkbox", {
        name: new RegExp(itemText ?? ""),
      });
      await expect(clickedItem).not.toBeChecked();

      // Wait for persist
      await page.waitForTimeout(500);

      // Reload
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Item should still be unchecked
      const reloadedItem = page.getByRole("checkbox", {
        name: new RegExp(itemText ?? ""),
      });
      await expect(reloadedItem).not.toBeChecked();
    });

    test("Done shopping transitions to cooking mode", async ({ page }) => {
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Should be in shopping mode
      await expect(
        page.getByRole("heading", { name: "Your shopping list" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Done shopping" })
      ).toBeVisible();

      // Transition to cooking mode
      await page.getByRole("button", { name: "Done shopping" }).click();

      // Verify cooking mode
      await expect(
        page.getByRole("heading", { name: "Time to cook!" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Done shopping" })
      ).not.toBeVisible();

      // Verify recipe cards are shown
      const recipeLinks = page.locator('a[href^="/recipe/"]');
      await expect(recipeLinks.first()).toBeVisible();
    });

    test("cooking mode persists after reload", async ({ page }) => {
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Should still be in cooking mode
      await expect(
        page.getByRole("heading", { name: "Time to cook!" })
      ).toBeVisible();

      // Recipe cards should be visible
      const recipeLinks = page.locator('a[href^="/recipe/"]');
      await expect(recipeLinks.first()).toBeVisible();

      // Done shopping button should not be present
      await expect(
        page.getByRole("button", { name: "Done shopping" })
      ).not.toBeVisible();
    });
  });

import { expect, test } from "@playwright/test";

test.describe
  .serial("Persistent weekly shop", () => {
    let shopUrl: string;

    test("Shop Now creates a shop and navigates to /shop/[id]", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Shop Now" }).click();

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

    test("Shop Now again returns the same shop (idempotent within the week)", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Shop Now" }).click();
      await page.waitForURL(/\/shop\/[0-9a-f-]+/);

      // Should be the same shop URL as before
      expect(page.url()).toBe(shopUrl);
    });

    test("Start new week creates a different shop", async ({ page }) => {
      await page.goto(new URL(shopUrl).pathname);
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Start new week" }).click();

      // Should navigate to a NEW shop URL
      await page.waitForURL(/\/shop\/[0-9a-f-]+/);
      await page.waitForLoadState("networkidle");

      // The new URL should be different from the original
      expect(page.url()).not.toBe(shopUrl);

      await expect(
        page.getByRole("heading", { name: "Your shopping list" })
      ).toBeVisible();
    });

    test("checking an ingredient persists after reload", async ({ page }) => {
      // We're on the shop page from the previous test — get the current URL
      const currentShopUrl = page.url();

      // Find the first ingredient item and click it to check
      const firstItem = page.locator("li").first();
      const itemText = await firstItem.locator("span.flex-1").textContent();
      await firstItem.click();

      // Verify it's checked (green circle appears)
      await expect(firstItem.locator(".bg-green-600")).toBeVisible();

      // Wait a moment for the toggle to persist
      await page.waitForTimeout(500);

      // Reload the page
      await page.goto(new URL(currentShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Find the item with the same text — it should still be checked
      const reloadedItem = page.locator("li", {
        hasText: itemText?.trim(),
      });
      await expect(reloadedItem.locator(".bg-green-600")).toBeVisible();
    });

    test("unchecking an ingredient persists after reload", async ({ page }) => {
      const currentShopUrl = page.url();

      // Find the checked item (has green circle) and click to uncheck
      const checkedItem = page
        .locator("li")
        .filter({ has: page.locator(".bg-green-600") })
        .first();
      const itemText = await checkedItem.locator("span.flex-1").textContent();
      await checkedItem.click();

      // Verify it's unchecked (no green circle)
      await expect(checkedItem.locator(".bg-green-600")).not.toBeVisible();

      // Wait for persist
      await page.waitForTimeout(500);

      // Reload
      await page.goto(new URL(currentShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Item should still be unchecked
      const reloadedItem = page.locator("li", {
        hasText: itemText?.trim(),
      });
      await expect(reloadedItem.locator(".bg-green-600")).not.toBeVisible();
    });
  });

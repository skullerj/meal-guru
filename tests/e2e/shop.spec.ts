import { expect, test } from "@playwright/test";

test.describe
  .serial("Persistent weekly shop", () => {
    let shopUrl: string;
    let newShopUrl: string;

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

      // Scope to the shopping list container to avoid matching nav <li> elements
      const list = page.locator(".rounded-lg ul").first();
      await expect(list.locator("li").first()).toBeVisible();
      const firstItem = list.locator("li").first();
      const itemText = await firstItem.locator("span.flex-1").textContent();
      await firstItem.click();

      // Verify it's checked (green circle appears)
      await expect(firstItem.locator(".bg-success")).toBeVisible();

      // Wait a moment for the toggle to persist
      await page.waitForTimeout(500);

      // Reload the page
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Find the item with the same text — it should still be checked
      const reloadedItem = page.locator(".rounded-lg li", {
        hasText: itemText?.trim(),
      });
      await expect(reloadedItem.locator(".bg-success")).toBeVisible();
    });

    test("unchecking an ingredient persists after reload", async ({ page }) => {
      // Navigate to the shop with the checked item
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Find the checked item (has green circle) and click to uncheck
      const checkedItem = page
        .locator(".rounded-lg li")
        .filter({ has: page.locator(".bg-success") })
        .first();
      await expect(checkedItem).toBeVisible();
      const itemText = await checkedItem.locator("span.flex-1").textContent();
      await checkedItem.click();

      // Verify it's unchecked (no green circle)
      await expect(checkedItem.locator(".bg-success")).not.toBeVisible();

      // Wait for persist
      await page.waitForTimeout(500);

      // Reload
      await page.goto(new URL(newShopUrl).pathname);
      await page.waitForLoadState("networkidle");

      // Item should still be unchecked
      const reloadedItem = page.locator(".rounded-lg li", {
        hasText: itemText?.trim(),
      });
      await expect(reloadedItem.locator(".bg-success")).not.toBeVisible();
    });
  });

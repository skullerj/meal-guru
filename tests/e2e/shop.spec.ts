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
  });

import { expect, test } from "@playwright/test";

test.describe("Mobile layout polish", () => {
  test("nav bar stays visible after scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto("/app/recipes");
    await page.waitForLoadState("networkidle");

    // Nav should be visible initially
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Nav should still be visible (sticky)
    await expect(nav).toBeVisible();

    // Verify the nav is in the viewport (top position should be near 0)
    const navBox = await nav.boundingBox();
    expect(navBox).toBeTruthy();
    expect(navBox?.y).toBeLessThanOrEqual(1);
  });

  test("recipe dialog header and footer are both visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto("/app/recipes");
    await page.waitForLoadState("networkidle");

    // Open add recipe dialog
    await page.getByRole("button", { name: "Add Recipe" }).click();

    // Both header (with title) and footer (with buttons) should be visible
    await expect(
      page.getByRole("heading", { name: "Add Recipe" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });
});

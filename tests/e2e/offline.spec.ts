import { expect, test } from "@playwright/test";

test.describe("Offline support", () => {
  test("offline indicator appears when disconnected and hides on reconnect", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should not show offline banner when online
    await expect(page.getByText("You're offline")).not.toBeVisible();

    // Go offline and fire the browser event
    await page.context().setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Offline banner should appear
    await expect(page.getByText("You're offline")).toBeVisible();

    // Go back online and fire the browser event
    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));

    // Banner should disappear
    await expect(page.getByText("You're offline")).not.toBeVisible();
  });

  test("client-side navigation works while offline", async ({ page }) => {
    // Load the app and visit multiple pages to warm the React Query cache
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();

    // Visit ingredients page too
    await page.getByRole("link", { name: "Ingredients" }).click();
    await page.waitForURL("/ingredients");
    await page.waitForLoadState("networkidle");

    // Go offline
    await page.context().setOffline(true);

    // Navigate to recipes via nav link — this is client-side routing, no server needed
    const recipesNavLink = page.locator("nav").getByRole("link", {
      name: "Recipes",
      exact: true,
    });
    await recipesNavLink.click();
    await expect(page).toHaveURL("/recipes");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();

    // Navigate home
    await page.locator("nav").getByRole("link", { name: "Meal Guru" }).click();
    await expect(page).toHaveURL("/");

    await page.context().setOffline(false);
  });

  test("previously fetched recipes are visible offline", async ({ page }) => {
    // Load recipes page to populate React Query cache
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");

    // Verify at least one recipe is visible and remember its name
    const firstRecipeHeading = page.getByRole("heading", { level: 3 }).first();
    await expect(firstRecipeHeading).toBeVisible();
    const recipeName = await firstRecipeHeading.textContent();

    // Go offline
    await page.context().setOffline(true);

    // Navigate away via nav
    await page.locator("nav").getByRole("link", { name: "Meal Guru" }).click();
    await expect(page).toHaveURL("/");

    // Navigate back to recipes
    await page
      .locator("nav")
      .getByRole("link", {
        name: "Recipes",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL("/recipes");

    // The same recipe should still be visible from cached data
    await expect(
      page.getByRole("heading", { name: recipeName! })
    ).toBeVisible();

    await page.context().setOffline(false);
  });

  test("web manifest is served with correct fields", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBe(true);

    const manifest = await response.json();
    expect(manifest.name).toBe("Meal Guru");
    expect(manifest.short_name).toBe("Meal Guru");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });
});

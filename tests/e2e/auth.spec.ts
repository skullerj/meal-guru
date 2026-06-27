import { expect, test } from "@playwright/test";
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from "../fixtures/data";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "Meal Guru" })
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("signs in with valid credentials and redirects to home", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/", { timeout: 10000 });
    await expect(page).toHaveURL("/");
  });

  test("session persists after reload", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/", { timeout: 10000 });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
  });

  test("logs out and redirects to login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/", { timeout: 10000 });

    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("toggles between sign in and sign up modes", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Should start in sign in mode
    const form = page.locator("form");
    await expect(form.getByRole("button", { name: "Sign in" })).toBeVisible();

    // Click "Sign up" link to switch modes
    await page.locator("p").getByRole("button", { name: "Sign up" }).click();

    // The submit button should now say "Sign up"
    await expect(form.getByRole("button", { name: "Sign up" })).toBeVisible();
    await expect(page.getByText("Already have an account?")).toBeVisible();

    // Click "Sign in" link to go back
    await page.locator("p").getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Don't have an account?")).toBeVisible();
  });

  test("redirects authenticated user from login to home", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Try to navigate to /login — should redirect to /
    await page.goto("/login");
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });
});

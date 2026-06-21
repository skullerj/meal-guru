import { expect, test as setup } from "@playwright/test";
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from "../fixtures/data";

const authFile = "tests/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(TEST_USER_EMAIL);
  await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/", { timeout: 10000 });
  await expect(page).toHaveURL("/");

  await page.context().storageState({ path: authFile });
});

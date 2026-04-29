import { expect, test } from "@playwright/test";

test.describe
  .serial("Shop commit flow", () => {
    function shopUrl() {
      const id1 = process.env.TEST_RECIPE_ID;
      const id2 = process.env.TEST_RECIPE_ID_2;
      if (!id1 || !id2) {
        throw new Error(
          "TEST_RECIPE_ID / TEST_RECIPE_ID_2 not set — check global-setup.ts"
        );
      }
      return `/shop?r=${id1}&r=${id2}`;
    }

    test("commit button is visible on /shop", async ({ page }) => {
      await page.goto(shopUrl());
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("button", { name: "Commit to this week" })
      ).toBeVisible();
    });

    test("clicking commit shows confirmation message", async ({ page }) => {
      await page.goto(shopUrl());
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Commit to this week" }).click();
      await page.waitForLoadState("networkidle");

      await expect(page.getByText("Committed!")).toBeVisible();
    });

    test("after committing, home page shows skipping message", async ({
      page,
    }) => {
      // Commit has already been done in the previous test (serial order).
      // Navigate home and confirm the exclusion UI appears.
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(/Skipping/)).toBeVisible();
    });
  });

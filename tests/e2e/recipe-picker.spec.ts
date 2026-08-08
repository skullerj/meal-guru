import { expect, test } from "@playwright/test";
import { TEST_RECIPE_NAME, TEST_RECIPE_NAME_2 } from "../fixtures/data";

test.describe
  .serial("Recipe picker", () => {
    test("shows seeded recipe on the pick page", async ({ page }) => {
      await page.goto("/app/pick");
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) }).first()
      ).toBeVisible();
    });

    test("start the week is disabled with nothing selected", async ({
      page,
    }) => {
      await page.goto("/app/pick");
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("button", { name: "Start the week" })
      ).toBeDisabled();
      await expect(page.getByText("0 recipes")).toBeVisible();
    });

    test("selecting a recipe pins it under Your week", async ({ page }) => {
      await page.goto("/app/pick");
      await page.waitForLoadState("networkidle");

      const yourWeekHeading = page.getByRole("heading", { name: "Your week" });
      await expect(yourWeekHeading).toBeHidden();

      const card = page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .first();
      await card.click();

      await expect(yourWeekHeading).toBeVisible();
      await expect(card).toHaveAttribute("aria-pressed", "true");

      const yourWeekSection = page
        .locator("section")
        .filter({ has: yourWeekHeading });
      await expect(
        yourWeekSection.getByRole("button", {
          name: new RegExp(TEST_RECIPE_NAME),
        })
      ).toBeVisible();
    });

    test("footer count updates as recipes are selected", async ({ page }) => {
      await page.goto("/app/pick");
      await page.waitForLoadState("networkidle");

      const startButton = page.getByRole("button", { name: "Start the week" });
      await expect(startButton).toBeDisabled();

      await page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .first()
        .click();

      await expect(page.getByText("1 recipe", { exact: true })).toBeVisible();
      await expect(startButton).toBeEnabled();

      await page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME_2) })
        .first()
        .click();

      // Both seeded recipes use Tomato sauce
      await expect(
        page.getByText("2 recipes · 1 shared item", { exact: true })
      ).toBeVisible();
    });

    test("deselecting a recipe empties Your week", async ({ page }) => {
      await page.goto("/app/pick");
      await page.waitForLoadState("networkidle");

      const card = page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .first();

      await card.click();
      await expect(
        page.getByRole("heading", { name: "Your week" })
      ).toBeVisible();

      await page
        .getByRole("button", { name: new RegExp(TEST_RECIPE_NAME) })
        .first()
        .click();

      await expect(
        page.getByRole("heading", { name: "Your week" })
      ).toBeHidden();
      await expect(
        page.getByRole("button", { name: "Start the week" })
      ).toBeDisabled();
    });
  });

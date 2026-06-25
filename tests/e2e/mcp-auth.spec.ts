import { expect, test } from "@playwright/test";
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from "../fixtures/data";

test.describe("Protected Resource Metadata endpoint", () => {
  test("returns JSON with resource, authorization_servers, and scopes_supported", async ({
    request,
  }) => {
    const response = await request.get("/.well-known/oauth-protected-resource");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();

    expect(body).toHaveProperty("resource");
    expect(body).toHaveProperty("authorization_servers");
    expect(body).toHaveProperty("scopes_supported");

    expect(body.resource).toMatch(/\/api\/mcp$/);
    expect(body.authorization_servers).toBeInstanceOf(Array);
    expect(body.authorization_servers.length).toBeGreaterThan(0);
  });
});

test.describe("MCP endpoint requires authentication", () => {
  test("returns 401 without Authorization header", async ({ request }) => {
    const response = await request.post("/api/mcp", {
      headers: { "Content-Type": "application/json" },
      data: {},
    });

    expect(response.status()).toBe(401);

    const wwwAuth = response.headers()["www-authenticate"];
    expect(wwwAuth).toBeDefined();
    expect(wwwAuth).toContain("resource_metadata");

    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  test("returns 401 with invalid Bearer token", async ({ request }) => {
    const response = await request.post("/api/mcp", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid-token-here",
      },
      data: {},
    });

    expect(response.status()).toBe(401);

    const wwwAuth = response.headers()["www-authenticate"];
    expect(wwwAuth).toBeDefined();
    expect(wwwAuth).toContain('error="invalid_token"');

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });
});

test.describe("Login returnTo redirect", () => {
  test("redirects to /login with returnTo when visiting consent page unauthenticated", async ({
    page,
  }) => {
    // Navigate to consent page while not logged in
    await page.goto("/oauth/consent?authorization_id=test");
    await page.waitForLoadState("networkidle");

    // Should redirect to /login with returnTo param
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");

    const returnTo = url.searchParams.get("returnTo");
    expect(returnTo).toBeDefined();
    expect(returnTo).toContain("/oauth/consent");
    expect(returnTo).toContain("authorization_id=test");
  });
});

test.describe("Consent page requires authorization_id", () => {
  test("redirects to home when authorization_id is missing", async ({
    page,
  }) => {
    // Log in first
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/", { timeout: 10000 });

    // Navigate to consent page without authorization_id
    await page.goto("/oauth/consent");
    await page.waitForLoadState("networkidle");

    // Should redirect to home
    await expect(page).toHaveURL("/");
  });
});

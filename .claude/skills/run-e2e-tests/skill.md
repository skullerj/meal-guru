# /run-e2e-tests skill

Run the Playwright E2E test suite or generate new tests for a recently implemented feature.

## Prerequisites

A `.env.test` file must exist at the project root with:
```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here  # Secret key (not the publishable one)
```

On first use, install the Playwright browser:
```bash
npx playwright install chromium
```

## Running the test suite

```bash
npm run test:e2e
```

On failure, open the HTML report:
```bash
npm run test:e2e:report
```

For interactive debugging with the Playwright UI:
```bash
npm run test:e2e:ui
```

## Generating tests for a new feature

When asked to generate tests for a new feature:

1. Read the feature's component file(s) under `src/components/`
2. Read the corresponding action file under `src/actions/` (if any)
3. Identify the user flows: what the user does, what they see, what changes in the DB
4. Add a new `test.describe.serial` block to the relevant spec file in `tests/e2e/`
   - If no spec file exists for this area, create `tests/e2e/<feature>.spec.ts`
   - Follow the patterns in `tests/e2e/recipes.spec.ts`
5. If the new tests create recipes or ingredients, add their names to `TEST_CREATED_RECIPES` / `TEST_CREATED_INGREDIENTS` in `tests/fixtures/data.ts` so global-setup cleans them up before each run
6. If the new tests need seed data, update `tests/fixtures/data.ts` and add setup logic to `tests/setup/global-setup.ts`

## Test file locations

- Tests: `tests/e2e/*.spec.ts`
- Fixtures (test data constants): `tests/fixtures/data.ts`
- Global setup (DB seeding + cleanup): `tests/setup/global-setup.ts`
- Config: `playwright.config.ts`

## Conventions

- **Wait for hydration**: Always call `await page.waitForLoadState('networkidle')` after `page.goto()` before interacting with React-managed elements (Astro uses `client:load`).
- **Prefer `getByRole`**: Use `getByRole('button', { name: '...' })` instead of `getByLabel` — Lucide icons render `aria-label` on the SVG, causing strict mode violations. Use `getByRole('heading', { name: '...' })` instead of `getByText` to avoid matching the same string in unrelated elements.
- **Cleanup is mandatory**: Every piece of data created by tests must be cleaned up in global-setup. Add names to the constants in `tests/fixtures/data.ts` — never hard-code them in `global-setup.ts` directly.

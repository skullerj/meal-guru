# /run-e2e-tests skill

Run the Playwright E2E test suite or generate new tests for a recently implemented feature.

## Prerequisites

Local Supabase must be running. Start it with:
```bash
npm run db:start
```

The `.env.test` file must exist at the project root. If it doesn't, copy `.env.test.example` and fill in the keys from `npx supabase status`.

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
5. If the new tests need seed data, update `tests/fixtures/data.ts` and add setup logic to `tests/setup/global-setup.ts`

## Test file locations

- Tests: `tests/e2e/*.spec.ts`
- Fixtures (test data constants): `tests/fixtures/data.ts`
- Global setup (DB seeding): `tests/setup/global-setup.ts`
- Config: `playwright.config.ts`

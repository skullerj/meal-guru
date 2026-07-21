# Meal Guru

## Table of Contents

1. [Agent Delegation Rules](#1-agent-delegation-rules)
2. [Project Overview](#2-project-overview)
3. [Quick Reference](#3-quick-reference)
4. [Architecture](#4-architecture)
   - [App Structure](#41-app-structure)
   - [Data Layer](#42-data-layer)
   - [State Management](#43-state-management)
   - [Component Patterns](#44-component-patterns)
   - [Data Fetching (Suspense)](#45-data-fetching-suspense)
5. [Backend API Reference](#5-backend-api-reference)
6. [UI](#6-ui)
7. [Testing](#7-testing)
8. [Project Structure](#8-project-structure)
9. [Domain Knowledge](#9-domain-knowledge)

---

## 1. Agent Delegation Rules

**IMPORTANT — these rules override default behavior and must always be followed:**

- For any UI change, feature implementation, component work, or layout modification: **always delegate to the `astro-web-dev` agent** via the Agent tool. Never implement these directly.
- For any backend logic, Astro actions, or database functions: **always delegate to the `astro-backend-dev` agent** via the Agent tool. Never implement these directly.

Only handle research, planning, file reading, or coordination yourself. Implementation goes through the agents.

---

## 2. Project Overview

Meal Guru helps people efficiently plan and prepare meals for the week through batch cooking — saving time and money while eliminating the frustration of wandering around supermarkets. The goal is to reduce the mental strain of meal planning by picking the right recipes for the week automatically.

**Target User**: People who want to cook for multiple days at once (batch cooking) and streamline their grocery shopping and meal preparation process.

### Tech Stack

- **Framework**: Astro 5.12.8 with Netlify adapter for SSR
- **Language**: TypeScript
- **Frontend**: React (interactive islands) + TanStack Router (SPA under `/app`)
- **Database**: Supabase (PostgreSQL) with RLS
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Data Fetching**: React Query (@tanstack/react-query) + IndexedDB persistence
- **AI Integration**: Anthropic Claude API for recipe parsing
- **PWA**: Workbox service worker via @vite-pwa/astro
- **Linter/Formatter**: Biome
- **Git Hooks**: Lefthook
- **Package Manager**: npm

---

## 3. Quick Reference

### Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Lint code
npm run format           # Format code
npm run test:e2e         # Run E2E tests (requires .env.test)
npm run test:e2e:report  # Open Playwright HTML report
npm run test:e2e:ui      # Interactive Playwright UI
npx astro check          # Type checking
```

### Environment Setup

`.env` (project root):
```bash
ANTHROPIC_API_KEY=your_key
PUBLIC_SUPABASE_URL=your_url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
```

`.env.test` (for E2E tests):
```bash
PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
```

**Setup Required**: Run SQL scripts in `database-schema.sql` and `migrate-data.sql` in Supabase SQL Editor.

### Conventions

- **Commits**: Prefix with `fix:`, `feat:`, or `chore:` — e.g., `feat: add new button to reset selection`
- **Linting**: Biome for linting and formatting. Lefthook runs `npx biome check --write` on staged files pre-commit. **Never add `biome-ignore` comments** — report unresolvable issues instead
- **Keep CLAUDE.md up to date** when adding new libraries or changing architecture

---

## 4. Architecture

### 4.1 App Structure

The app is an **Astro + React SPA hybrid**. Astro handles SSR, static pages, and API routes. A single catch-all page (`src/pages/app/[...path].astro`) serves the React SPA with `client:only="react"`. All interactive routes live under `/app/`.

**Routing**: TanStack Router (`src/components/app/router.tsx`) defines the route tree with `basepath: '/app'`. Route components inline data-fetching via React Query hooks. `App.tsx` is the SPA entry point (QueryClientProvider + RouterProvider). `AppLayout.tsx` provides the nav bar for authenticated routes.

**Auth**: Supabase Auth via `@supabase/ssr`. The router's `beforeLoad` guard checks `supabase.auth.getUser()` and redirects unauthenticated users to `/app/login?returnTo=<path>`. When offline, it falls back to `supabase.auth.getSession()` (cached in localStorage). Server middleware (`src/middleware.ts`) only protects `/oauth/*` routes and serves the `/.well-known/oauth-protected-resource` PRM metadata.

**Navigation rules**:
- All internal navigation uses TanStack Router: `<Link>` for links, `useNavigate()` for programmatic navigation
- Never use `<a href>` for internal routes or `window.location.href` for in-app navigation
- Exceptions: OAuth/API redirects (e.g., `ConsentForm.tsx`, server-route fallback in `LoginForm.tsx`) which require full page loads

**Server routes** (`/api/*`, `/oauth/*`) are separate Astro pages outside the SPA. The MCP endpoint (`/api/mcp`) validates Bearer tokens against Supabase Auth and creates a user-scoped client (RLS-aware).

### 4.2 Data Layer

All data lives in Supabase (PostgreSQL) with Row-Level Security. The app uses two client modules:

| Client | File | Usage |
|--------|------|-------|
| Browser | `src/lib/supabase-browser.ts` | Singleton for React components — all reads and mutations |
| Server (auth-aware) | `src/lib/supabase.ts` → `createSupabaseServerClient()` | Astro pages, API routes |
| Server (admin) | `src/lib/supabase.ts` → `createServiceRoleClient()` | MCP endpoint, admin ops |

**React Query** is the caching and synchronization layer:
- Singleton `QueryClient` in `src/lib/query-client.ts` (5-min stale time, 24-hr gc time, `refetchOnWindowFocus: false`)
- Query hooks in `src/lib/queries.ts` with a `queryKeys` factory
- Mutation hooks in `src/lib/mutations.ts` — each mutation calls `queryClient.invalidateQueries()` on success
- All mutations use `networkMode: "offlineFirst"` — they queue locally and retry when online

**Offline support** is achieved through three layers:
1. **IndexedDB persistence** (`src/lib/idb-persister.ts`): The React Query cache is persisted via `PersistQueryClientProvider` in `App.tsx` with 24-hr max age. On startup, cached data is restored before any network requests
2. **Service worker** (`src/sw.ts`): Workbox precaches static assets and uses `NetworkFirst` (3s timeout) for navigation routes under `/app/`. Falls back to cached app shell when offline
3. **Offline-first mutations**: Queued locally, auto-retry on reconnect. `useOnlineStatus()` hook (`src/lib/use-online-status.ts`) powers the `OfflineIndicator` component in `AppLayout`

**All mutations go directly from React components to Supabase via the browser client** — no Astro actions layer. Only `parse-recipe` and MCP stay server-side.

### 4.3 State Management

The app uses three tiers of state, chosen by complexity:

| Signal | Use | Example |
|--------|-----|---------|
| Data from Supabase | React Query hook | `ShopPage` reads from `useShopSuspense()` |
| Multiple actions affect each other's state | `useReducer` | `MealPlanner` toggle recomputes shopping list |
| Single toggle / index / flag | `useState` | `CookingView` step index |

**Key rules:**
- **Parent owns state, children get callback props** — never pass `dispatch` to child components. See `MealPlanner.tsx` → `RecipeGrid` (passes `onToggle`, not dispatch)
- **Derived state**: Compute in the reducer or with `useMemo` — don't store it separately. See `mealPlannerReducer.ts` where `groups` is recomputed from `selectedIds` on every toggle
- **Utility functions**: Pure business logic lives in `utils/` files next to the component (e.g., `mealPlannerUtils.ts` for `aggregateIngredients()`)

**Reference examples:**
- React Query as primary state: `ShopPage.tsx` — almost no local state, reads and derives everything
- Reducer with derived state: `mealPlannerReducer.ts` — single action, recalculates on dispatch
- Multiple useState: `IngredientList.tsx` — independent states for editing/saving/deleting
- Minimal useState: `CookingView.tsx` — single index, everything else derived

### 4.4 Component Patterns

Components follow a parent/child separation with pure children:

```
components/feature-name/
├── ParentComponent.tsx          # Owns state (reducer or useState), passes callbacks
├── ChildComponent.tsx           # Pure: receives data + callbacks as props
├── AnotherChild.tsx             # Pure: UI rendering only
└── utils/
    ├── featureUtils.ts          # Pure business logic (transforms, calculations, validation)
    └── featureReducer.ts        # Reducer + action types (if using useReducer)
```

**Pure child components**:
- Receive data as props, call callbacks for interactions
- No direct state management dependency — work with any parent
- Local `useState` only for transient UI (dropdowns, animations)

**Business logic separation**: All transforms, calculations, and validation live in `utils/` files as pure functions. They're testable in isolation and reusable across components. See `mealPlannerUtils.ts` (`aggregateIngredients`) used by both the reducer and `ShopPage`.

### 4.5 Data Fetching (Suspense)

Pages use `useSuspenseQuery` so each component fetches its own data and controls its own loading state:

```
Route component (router.tsx)
  └─ ErrorBoundary + Suspense fallback={<PageSkeleton />}
       └─ PageComponent                    ← calls useSuspenseQuery, data always defined
            └─ Suspense fallback={<SectionSkeleton />}
                 └─ SectionDataWrapper     ← calls useSuspenseQuery for section-specific data
                      └─ PresentationComponent  ← receives data as props
```

**Rules:**
1. Components fetch their own data via `useSuspenseQuery` hooks (named `use*Suspense` in `queries.ts`). Data is guaranteed defined — no `isLoading` checks
2. Each data boundary gets its own `<Suspense>` with a skeleton fallback for progressive loading
3. `ErrorBoundary` wraps each Suspense boundary. Use `key={id}` so it resets on route param changes
4. Suspense hooks share cache with regular `useQuery` hooks via identical `queryKeys`
5. **Prefetch to avoid waterfalls**: When a child suspends after its parent, prefetch the child's data in the route component via `queryClient.prefetchQuery()` in a `useEffect`

**Reuse across contexts**: If a component is used in both Suspense and non-Suspense contexts, create a thin wrapper that calls `useSuspenseQuery` and passes data to the pure component. See `ShopShoppingList.tsx` → `ShoppingList.tsx`.

**Skeletons**: Each page/section gets a skeleton matching its layout using `animate-pulse`, `bg-muted`, `rounded`.

---

## 5. Backend API Reference

All functions in `src/lib/database.ts` accept `supabase: SupabaseClient` as their first parameter. Callers create a client via `createSupabaseServerClient()` or `createServiceRoleClient()` from `src/lib/supabase`, or use the browser client for React components.

| Function | Description |
|----------|-------------|
| `getRecipes(supabase)` | Fetch all recipes with nested ingredients |
| `getRecipe(supabase, id)` | Fetch a single recipe by UUID |
| `createRecipe(supabase, name)` | Insert a new recipe row |
| `updateRecipe(supabase, id, name)` | Update recipe name |
| `deleteRecipe(supabase, id)` | Delete a recipe (cascades to recipe_ingredients) |
| `getIngredients(supabase)` | Fetch all ingredients ordered by name |
| `upsertIngredient(supabase, ingredient)` | Insert or update ingredient by name |
| `updateIngredient(supabase, id, data)` | Update ingredient name, unit, and category by UUID |
| `deleteIngredient(supabase, id)` | Delete an ingredient; throws if referenced by any recipe |
| `setRecipeIngredients(supabase, recipeId, ingredients)` | Replace all ingredients for a recipe |
| `createRecipeWithIngredients(supabase, name, ingredients, steps?)` | Create recipe + set ingredients + optionally save steps |
| `updateRecipeWithIngredients(supabase, id, name, ingredients, steps?)` | Update recipe + replace ingredients + optionally save steps |
| `getRecentRecipeIds(supabase, withinDays?)` | Distinct recipe UUIDs from shops within last N days (default 14) |
| `commitShop(supabase, recipeIds)` | Insert shop, link recipes, populate `shop_ingredients`; returns `{ id }` |
| `getWeekMonday(date?)` | ISO date string of Monday for the given date's week (pure function) |
| `getActiveShopForWeek(supabase, weekOf?)` | Active shop for a given week; returns `ShopSummary \| null` |
| `getShopWithRecipes(supabase, id)` | Shop by ID with full Recipe[] data; returns `ShopWithRecipes \| null` |
| `createShop(supabase, recipeIds, weekOf?)` | Create shop with `week_of` and `active=true`, link recipes, populate ingredients |
| `deactivateShopsForWeek(supabase, weekOf)` | Set `active = false` on all active shops for the given week |
| `recommendRecipeIds(supabase, count?, excludeDays?)` | Random recipe IDs excluding recently cooked; falls back to all |
| `getRecipeSteps(supabase, recipeId)` | Steps for a recipe ordered by step_number |
| `setRecipeSteps(supabase, recipeId, steps)` | Replace all steps atomically (delete + insert) |
| `populateShopIngredients(supabase, shopId, recipes)` | Aggregate ingredients across recipes into `shop_ingredients` |
| `getShopIngredients(supabase, shopId)` | All `shop_ingredients` for a shop, ordered by name |
| `toggleShopIngredient(supabase, id, checked)` | Set `checked` on a `shop_ingredients` row |
| `updateShopStatus(supabase, id, status)` | Update shop status (`"shopping"` or `"cooking"`) |

---

## 6. UI

### shadcn/ui

Configuration (`components.json`): Style: New York, Base Color: Neutral, Icon Library: Lucide React, Path Aliases: `@/components`, `@/lib`, `@/ui`, CSS Variables enabled.

Use the `cn()` utility (`src/lib/utils.ts`) for conditional className merging — combines `clsx` + `tailwind-merge`.

**Installed components**: Dialog (`src/components/ui/dialog.tsx`) — Radix UI dialog primitives with full keyboard/focus management.

### Shared Components

Centralized in `src/components/shared/`:

| Component | Description |
|-----------|-------------|
| `Button.tsx` | Styled button with variants (primary, secondary, success, danger, card) and sizes |
| `Icon.tsx` | Centralized Lucide icon component |
| `IconButton.tsx` | Interactive icon-only button with variants |
| `PageLayout.tsx` | Page wrapper: `max-w-lg` container, `px-6 py-8` padding, optional back link, h1, subtitle, action buttons |
| `LoadingSkeleton.tsx` | Pulsing placeholder skeleton for loading states |
| `ErrorBoundary.tsx` | Generic React error boundary (default export) |

---

## 7. Testing

The project uses Playwright for E2E tests against the hosted Supabase instance.

### Setup

Create `.env.test` as shown in [Quick Reference](#3-quick-reference). The service role key is needed because `global-setup.ts` seeds and cleans test data with elevated permissions.

Install the Playwright browser on first use: `npx playwright install chromium`

### Test Structure

```
tests/
├── e2e/              # Playwright spec files (one per feature area)
├── fixtures/
│   └── data.ts       # All test data constants — recipe names, ingredient names, seed data
└── setup/
    └── global-setup.ts  # Runs before every test run: wipes then re-seeds test data
```

### Playwright Projects

- **`setup`**: Authenticates the test user and saves session to `tests/.auth/user.json`
- **`chromium`**: Runs most tests with stored auth state (logged in). Ignores `auth.spec.ts` and `mcp-auth.spec.ts`
- **`chromium-auth`**: Runs `auth.spec.ts` and `mcp-auth.spec.ts` without stored auth state (logged out)

When adding a new test file that needs logged-out browser state, add it to both the `testIgnore` array of `chromium` and the `testMatch` array of `chromium-auth` in `playwright.config.ts`.

### Conventions

- **Cleanup in global-setup**: Any recipe or ingredient name created by a test must be listed in `TEST_CREATED_RECIPES` / `TEST_CREATED_INGREDIENTS` in `tests/fixtures/data.ts` so `global-setup.ts` can wipe it before the next run
- **Wait for React hydration**: Always call `await page.waitForLoadState('networkidle')` after `page.goto()` before interacting with React-managed buttons
- **Prefer `getByRole`**: Use `getByRole('button', { name: '...' })` over `getByLabel`/`getByText` (Lucide icons render `aria-label` on SVGs causing double matches)
- **API-only tests**: Use Playwright's `request` fixture for direct HTTP requests

### Deliberately Untested

Some behaviour depends on browser/device capabilities that Playwright cannot observe. **Do not add E2E tests for these** — a test here can only assert that our own UI state changed, which restates the implementation and adds a flaky test without verifying the actual behaviour.

| Feature | Why it isn't tested |
|---------|---------------------|
| **Screen wake lock** (`src/lib/use-wake-lock.ts`, toggle in `CookingView`) | Whether the screen actually stays awake is invisible to the browser automation API. Headless Chromium exposes `navigator.wakeLock` but frequently rejects the request; the hook catches that and resets to off, so a "click then assert pressed" test is inherently flaky. Verify by hand on a real phone instead. |

If you find yourself tempted to cover one of these, the answer is no — check this table before writing the spec.

---

## 8. Project Structure

```
/
├── public/                          # Static assets (favicon, PWA icons)
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── app/                     # SPA root: App.tsx, AppLayout.tsx, router.tsx
│   │   ├── meal-planner/            # Recipe picker + shopping list aggregation
│   │   │   └── utils/               # mealPlannerUtils.ts, mealPlannerReducer.ts
│   │   ├── add-recipe/              # PDF upload + AI parsing multi-step form
│   │   │   └── utils/               # addRecipeUtils.ts, addRecipeReducer.ts
│   │   ├── recipes/                 # Recipe CRUD list
│   │   ├── ingredients/             # Ingredient CRUD table
│   │   ├── home/                    # Context-aware home page
│   │   ├── shop/                    # Weekly shop: shopping ↔ cooking modes
│   │   ├── recipe/                  # Step-by-step cooking view + timers
│   │   ├── auth/                    # Login/signup form
│   │   ├── oauth/                   # OAuth consent screen
│   │   ├── shared/                  # Reusable components (Button, Icon, PageLayout, etc.)
│   │   └── ui/                      # shadcn/ui components (Dialog)
│   ├── data/
│   │   └── recipes.ts               # TypeScript interfaces only
│   ├── lib/
│   │   ├── supabase.ts              # Server Supabase clients
│   │   ├── supabase-browser.ts      # Browser Supabase client (singleton)
│   │   ├── database.ts              # Database access functions
│   │   ├── query-client.ts          # React Query QueryClient config
│   │   ├── queries.ts               # React Query hooks + queryKeys
│   │   ├── mutations.ts             # React Query mutation hooks
│   │   ├── idb-persister.ts         # IndexedDB cache persistence
│   │   ├── use-online-status.ts     # Online/offline detection hook
│   │   ├── parse-duration.ts        # Regex parser for time durations in text
│   │   ├── use-cooking-timers.ts    # Cooking timer context + hook (localStorage, audio alerts)
│   │   ├── use-wake-lock.ts         # Screen Wake Lock hook (localStorage, re-acquires on visibilitychange)
│   │   └── utils.ts                 # cn() className utility
│   ├── sw.ts                        # Workbox service worker
│   ├── middleware.ts                # Protects /oauth/*, serves PRM metadata
│   ├── layouts/
│   │   └── Layout.astro             # Used only by oauth/consent.astro
│   ├── pages/
│   │   ├── index.astro              # Static landing page (prerendered)
│   │   ├── app/[...path].astro      # SPA catch-all
│   │   ├── api/                     # parse-recipe, MCP endpoint, auth signout
│   │   └── oauth/consent.astro      # OAuth consent page (SSR)
│   └── styles/global.css
├── tests/                           # E2E tests (see Testing section)
├── astro.config.mjs
├── biome.json
├── components.json                  # shadcn/ui config
├── lefthook.yml
├── package.json
└── tsconfig.json
```

---

## 9. Domain Knowledge

- **Standardized Units**: `'g'`, `'kg'`, `'ml'`, `'l'`, `'tsp'`, `'tbsp'`, `'cup'`, `'oz'`, `'lb'`, `'unit'`
- **Ingredient Categories**: `'produce'`, `'meat'`, `'dairy'`, `'bakery'`, `'canned'`, `'condiments'`, `'spices'`, `'grains'`, `'oils'`, `'frozen'` (the old values `'tins'` and `'pantry'` are deprecated in the DB enum but no longer used)
- **TypeScript interfaces**: Defined in `src/data/recipes.ts`
- Tailwind CSS configured via Vite plugin with global CSS import

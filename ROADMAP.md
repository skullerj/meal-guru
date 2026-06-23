# Meal Guru — Roadmap

**Vision:** Get someone to their shopping list in under 30 seconds with no decisions required.

**Core scenario:** It's Monday, you're near the supermarket, you forgot to plan. You open the app, tap one button, get a shopping list, and walk in. The planning UI (manual recipe picker) is a power-user escape hatch — not the primary flow.

Old code is preserved on the `archive/v1` branch for reference.

---

## Completed (v1)

Features 0–15 shipped. Summary:

0. Archive old code (`archive/v1` branch)
1. Design system foundation (shadcn/ui, shared components, typeface)
2. Recipe CRUD (`/recipes`, add/edit/delete, Supabase tables)
3. Weekly meal picker — power-user mode (recipe grid, aggregated ingredients, categories)
4. Recipe library seeded (13 recipes)
5. "Shop Now" — auto-pick flow (one-tap → random recipes → shopping list)
6. Shopping mode — consumption view (checkboxes, mobile-optimised)
7. Ingredient management (`/ingredients`, inline edit, delete guard, MCP tools)
8. Recency memory (exclude recently cooked from auto-pick)
9. Persistent weekly shop (`/shop/[id]`, recommend API, "Start new week")
10. Ingredient overlap signal (shared-ingredient badges in manual picker)
11. Recipe step instructions with ingredient links (ordered steps, per-step ingredient refs, MCP tools)
12. Recipe cooking view (mobile-first step-by-step `/recipe/[id]`, per-step ingredients, links from shop + recipe list)
13. Persisted shopping checks (`shop_ingredients` table, snapshot on shop creation, optimistic toggle)
14. Shop cooking mode ("Done shopping" → recipe cards with cooking view links, persisted status)
15. Supermarket-aisle ingredient categories (expanded from 5 to 10 categories matching store sections)

---

## Backlog

### ✅ 14. Shop cooking mode
After finishing shopping, switch the shop page to show recipes to cook instead of the ingredient list.

- [x] Add `status` column to `shops` table (default `'shopping'`, transitions to `'cooking'`)
- [x] "Done shopping" button on shop page that sets status to `'cooking'`
- [x] When status is `'cooking'`, render recipe cards with links to `/recipe/[id]` instead of the ingredient checklist
- [x] E2E tests

**Verification:** Open a shop, click "Done shopping", confirm the page now shows recipe cards linking to cooking views. Reload and confirm the cooking mode persists.

---

### ✅ 15. Supermarket-aisle ingredient categories
Expand the category system to mirror real supermarket sections so the shopping list reads like a store walkthrough.

**Current categories:** `produce`, `tins`, `dairy`, `meat`, `pantry`

**New categories:**
| Category | Replaces | Examples |
|----------|----------|---------|
| `produce` | `produce` | onions, garlic, tomatoes, fresh herbs |
| `meat` | `meat` | chicken, beef, pork, fish |
| `dairy` | `dairy` | milk, cheese, eggs, butter |
| `bakery` | *(new)* | bread, tortillas, rolls |
| `canned` | `tins` | tinned tomatoes, beans, coconut milk |
| `condiments` | *(new)* | soy sauce, mustard, ketchup, vinegar |
| `spices` | *(new, from pantry)* | cumin, paprika, salt, pepper |
| `grains` | *(new, from pantry)* | pasta, rice, flour, oats |
| `oils` | *(new)* | olive oil, vegetable oil, sesame oil |
| `frozen` | *(new)* | frozen peas, frozen berries |

Null categories continue to display as "Other" in the shopping list (no explicit "other" value).

- [x] DB migration: alter `category_type` enum — add `bakery`, `canned`, `condiments`, `spices`, `grains`, `oils`, `frozen`; rename `tins` → `canned`, split `pantry` into `grains`/`spices`
- [x] Update `CATEGORIES` array, `CATEGORY_LABELS`, `CATEGORY_BADGE` maps, and `CATEGORY_ORDER` in TypeScript
- [x] Migrate existing ingredient data to new categories (move spice-like pantry items to `spices`, oil-like to `oils`, etc.)
- [x] Update shopping list group ordering to match a logical store walk (produce → bakery → dairy → meat → canned → condiments → oils → spices → grains → frozen → other)
- [x] E2E tests

**Verification:** Open the ingredients page and confirm the new category options appear in the dropdown. Create a shop and confirm the shopping list groups ingredients by the new categories in the correct order.

---

## Direct Supabase + Auth Initiative

Goal: Replace server-side Astro actions with direct Supabase calls from the frontend, enabled by proper authentication and Row-Level Security. Reduces unnecessary server resource usage and adds multi-user support.

---

### ✅ 16. Supabase Auth setup
Add email/password authentication using `@supabase/ssr`. No OAuth redirects — email/password only for PWA compatibility (works natively in installed web apps without leaving the app shell).

- [x] Install `@supabase/ssr` and configure browser + server Supabase clients
- [x] Create login/signup page with email/password form
- [x] Add auth session handling (cookie-based via `@supabase/ssr`)
- [x] Protect routes: redirect unauthenticated users to login
- [x] Add logout functionality
- [x] E2E tests

**Verification:** Open the app logged out — confirm redirect to login. Sign up with email/password, confirm redirect to home. Reload and confirm session persists. Log out and confirm redirect back to login.

---

### ✅ 17. Add user_id and Row-Level Security
Add `user_id` columns to all data tables and enable RLS so each user can only access their own data. Supabase RLS policies automatically filter rows based on `auth.uid()`, so no application-level filtering code is needed.

- [x] DB migration: add `user_id` (UUID, FK to `auth.users`) column to `recipes`, `ingredients`, `shops` tables (cascade to junction tables via existing FKs)
- [x] Create RLS policies for SELECT, INSERT, UPDATE, DELETE on all tables (recipes, ingredients, shops, recipe_ingredients, recipe_steps, step_ingredients, shop_recipes, shop_ingredients)
- [x] Enable RLS on all tables
- [x] Update MCP server (`src/pages/api/mcp.ts`) to use service role key (bypasses RLS)
- [x] Backfill migration script: set `user_id` on all existing rows to a provided UUID (run manually after user account creation)
- [x] E2E tests

**Verification:** Log in as user A, create a recipe. Log in as user B, confirm user A's recipe is not visible. Confirm MCP tools still work (service role key bypasses RLS).

---

### ✅ 18. Move mutations to frontend
Replace Astro actions with direct Supabase calls from React components. The browser Supabase client (with auth session) + RLS policies make this safe — mutations go directly to Supabase without a server round-trip.

- [x] Create `useSupabase` hook (or context) for React components to access the browser client
- [x] Move recipe CRUD operations to direct Supabase calls from React
- [x] Move ingredient CRUD operations to direct Supabase calls from React
- [x] Move shop operations (toggleIngredient, finishShopping, getOrCreateWeeklyShop, startNewWeek) to direct Supabase calls
- [x] Keep `parse-recipe` API route server-side (needs Anthropic API key)
- [x] Remove redundant Astro actions and `src/actions/` files
- [x] E2E tests

**Verification:** Create, edit, and delete a recipe — confirm operations work without server round-trips (check Network tab: calls go directly to Supabase, not to Astro action endpoints). Toggle shopping list checks and confirm they persist.

---

### ✅ 19. Switch to hybrid rendering
Change Astro output from `server` to `hybrid` so pages are static by default and only opt into SSR where needed. Reduces server resource usage since most pages can be prerendered.

- [x] Change `output: 'server'` to `output: 'hybrid'` in `astro.config.mjs`
- [x] Add `export const prerender = false` to pages that need SSR (parse-recipe API, MCP server, auth callback if any)
- [x] Verify all static pages build correctly
- [x] E2E tests

**Verification:** Run `npm run build` — confirm most pages are prerendered (shown in build output). Run `npm run preview` and confirm all flows still work.

---

## Supabase Data Model

**Active tables:**

- `ingredients` (+ `category` column)
- `recipes`
- `recipe_ingredients`
- `shops` — cooking history (one record per committed week)
- `shop_recipes` — which recipes were in each week
- `recipe_steps` — ordered instructions per recipe
- `step_ingredients` — junction: which recipe ingredients each step uses
- `shop_ingredients` — snapshot of aggregated ingredients per shop with checked state

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

### ✅ 20. MCP OAuth 2.1 authentication
Protect the MCP endpoint with OAuth 2.1 using Supabase's built-in OAuth authorization server. MCP clients (like Claude Desktop) authenticate via the standard OAuth 2.1 authorization code flow with PKCE.

- [x] Serve Protected Resource Metadata at `/.well-known/oauth-protected-resource` (handled in middleware)
- [x] Add Bearer token validation to `/api/mcp` — creates user-scoped Supabase client (RLS enforced)
- [x] Return 401 with `WWW-Authenticate` header for unauthenticated MCP requests
- [x] Build OAuth consent page at `/oauth/consent` using `supabase.auth.oauth.*` methods
- [x] Add `returnTo` query param support in login redirect flow
- [x] E2E tests

**Supabase dashboard setup (manual):**
1. Authentication → OAuth Server → Enable
2. Set Authorization URL Path to `/oauth/consent`
3. Enable Dynamic Client Registration
4. Verify asymmetric signing (RS256) is configured

**Verification:** Send an unauthenticated request to `/api/mcp` — confirm 401 with `WWW-Authenticate` header. Fetch `/.well-known/oauth-protected-resource` — confirm JSON with Supabase auth server URL. Configure Claude Desktop MCP with the server URL — confirm OAuth flow opens browser for consent.

---

## PWA / Offline Initiative

Goal: Make the app work fully offline when installed as a PWA. Requires client-side routing (no server round-trips for page navigation) and a service worker for caching and offline data persistence.

---

### ✅ 21. SPA migration — client-side routing
Convert from Astro file-based routing to TanStack Router. A single Astro catch-all page serves the React app shell; all navigation happens client-side with no server round-trips.

**Architecture after migration:**

Server routes (Astro pages):
- `/api/parse-recipe` — API (needs Anthropic key)
- `/api/mcp` — MCP endpoint (Bearer token auth)
- `/oauth/consent` — server-rendered, middleware-protected
- `/.well-known/oauth-protected-resource` — served by middleware

SPA routes (catch-all Astro page → React app with TanStack Router):
- `/` — home (context-aware)
- `/login` — login/signup form (redirects to `/` if already authenticated)
- `/pick` — manual recipe picker
- `/recipes` — recipe CRUD list
- `/ingredients` — ingredient management
- `/shop/:id` — persistent weekly shop
- `/recipe/:id` — step-by-step cooking view

**OAuth + SPA login interaction:** When an unauthenticated user hits `/oauth/consent`, the server middleware redirects to `/login?returnTo=/oauth/consent?...`. The SPA loads, shows the login form. After login, `returnTo` navigation uses `window.location.href` (full page nav), landing on the server-rendered consent page with a valid session.

- [x] Install TanStack Router and configure with code-based routing
- [x] Create `App.tsx` root component with TanStack Router, single QueryProvider, and route tree
- [x] Create React `AppLayout` component (nav bar, sign-out via `supabase.auth.signOut()`) replacing `Layout.astro`
- [x] Create `AuthGuard` component — checks Supabase browser session, redirects to `/login` route if unauthenticated
- [x] Migrate `CookingView` to client-side data fetching (currently server-fetched via `getRecipe` in frontmatter)
- [x] Migrate `RecipeList` to use React Query hooks (currently receives server-fetched props)
- [x] Convert shop redirect shim (`/shop` → `/shop/:id`) to client-side route handler
- [x] Move `LoginForm` into SPA as an unprotected route with `returnTo` query param support
- [x] Create catch-all Astro page (`[...path].astro`) as the single SPA entry point
- [x] Simplify middleware: only protect `/oauth/*`, serve PRM metadata, pass through everything else
- [x] Replace all `window.location.href` calls with TanStack Router navigation (except `returnTo` redirects to server routes)
- [x] Remove old Astro page files (keep `/api/*` and `/oauth/consent`)
- [x] E2E tests

**Verification:** Navigate between all pages — confirm no full-page reloads (check Network tab: no document requests after initial load). Log out and log back in — confirm redirect works. Test OAuth flow: hit `/oauth/consent` unauthenticated → login → consent page loads. Run `npx astro check` for type safety.

---

### 🔲 22. PWA offline support
Add service worker and offline-first data strategy so the installed app works without an internet connection.

- [ ] Add `vite-plugin-pwa` (Workbox) and configure service worker generation
- [ ] Cache app shell (HTML, JS, CSS, fonts) with precaching for offline access
- [ ] Persist React Query cache to IndexedDB so previously fetched data is available offline
- [ ] Add offline mutation queue — queue Supabase writes when offline, sync when back online
- [ ] Show offline indicator in the UI when the app detects no connectivity
- [ ] Update `site.webmanifest` for full installability (icons, display: standalone, start_url, etc.)
- [ ] E2E tests for offline scenarios

**Verification:** Install the app (Add to Home Screen / Install). Turn off network (airplane mode). Open the app — confirm it loads and shows cached data. Navigate between pages — confirm client-side routing works. Toggle a shopping list item — confirm it queues. Reconnect — confirm queued mutations sync.

---

### 🔲 23. Cooking step timers
Show inline timer buttons on cooking steps that mention a duration (e.g., "simmer for 15 minutes", "bake 25 min"). Tapping the button starts a countdown right in the cooking view — no need to leave the app for a separate timer.

Timers persist to `localStorage` so they survive step-to-step navigation and page refreshes. Multiple timers can run simultaneously (e.g., oven timer on step 3 while prepping step 4), with a floating summary of all active timers visible from any step.

- [ ] Parse step instruction text for time mentions (regex for patterns like "X minutes", "X min", "X hours", "X seconds") and extract duration in seconds
- [ ] Build `Timer` component — countdown display with start/pause/reset controls, visual alert (flashing/color change) and audio alert (Web Audio API beep) when timer reaches zero
- [ ] Integrate timer button into `CookingView` steps — show a timer button on steps with a detected duration; tapping it creates a timer pre-filled with that duration
- [ ] Persist active timers to `localStorage` — timers continue running across step navigation and page reloads; clear timers when the user finishes the recipe or navigates away from cooking
- [ ] Support multiple simultaneous timers — show a floating summary of all running timers (step number + remaining time) visible from any step, with tap-to-dismiss when complete
- [ ] E2E tests

**Verification:** Open a recipe cooking view with steps that mention times (e.g., "cook for 10 minutes"). Confirm a timer button appears on those steps. Start a timer, navigate to another step — confirm the timer keeps counting down and appears in the floating summary. Refresh the page — confirm the timer persists and continues. Let a timer reach zero — confirm visual and audio alerts fire.

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

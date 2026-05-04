# Meal Guru — Roadmap

**Vision:** Get someone to their shopping list in under 30 seconds with no decisions required.

**Core scenario:** It's Monday, you're near the supermarket, you forgot to plan. You open the app, tap one button, get a shopping list, and walk in. The planning UI (manual recipe picker) is a power-user escape hatch — not the primary flow.

Old code is preserved on the `archive/v1` branch for reference.

---

## Feature List (in order)

### ✅ 0. Archive old code
- [x] Create `archive/v1` branch with all v1 code

### ✅ 1. Design system foundation
- [x] shadcn/ui (New York style) installed and configured
- [x] CSS custom properties defined in `global.css` (colors, spacing)
- [x] Shared components: `Button`, `IconButton`, `Icon` with clean, consistent styling
- [x] Typeface chosen and applied

### ✅ 2. Recipe list (CRUD)
- [x] `/recipes` page — list all recipes
- [x] Add recipe form: name + ingredients (name, amount, unit)
- [x] Edit recipe
- [x] Delete recipe
- [x] Data: `recipes`, `ingredients`, `recipe_ingredients` tables in Supabase

### ✅ 3. Weekly meal picker (power-user mode)
- [x] Recipe grid with toggle selection
- [x] Aggregated ingredient list (grouped by category)
- [x] `category` column added to `ingredients` table

### ✅ 4. Recipe library seeded
- [x] 13 recipes added to the database (sufficient for random selection to feel useful)

### ✅ 5. "Shop Now" — auto-pick flow (primary flow)
The main entry point. One tap → app picks recipes → shopping list. No decisions.

- [x] "Shop Now" button on the home screen — prominent, above the fold
- [x] Auto-selects 2 recipes at random from the library
- [x] Takes the user directly to the shopping list (skips the manual picker)
- [x] "Change recipes" link at the top of the list drops into the existing manual picker (escape hatch)
- [x] Shopping list: ingredients aggregated across selected recipes, grouped by category

**Verification:** Tap "Shop Now" → get a list in under 3 seconds → list shows all ingredients grouped by category.

### ✅ 6. Shopping mode — consumption view
The in-store experience. Fast, scannable, zero configuration required.

- [x] Checkbox per ingredient — tap to mark as bought
- [x] Checked items move to the bottom (or are visually struck through)
- [x] Layout optimised for mobile: large tap targets, high contrast
- [x] "Done" button to complete/dismiss the shop

**Verification:** Load the list on a phone → can check off items one-handed while walking through the supermarket.

### ✅ 7. Ingredient management — view and edit ingredient library
Fix ingredients that got imported with wrong categories or units.

- [x] `/ingredients` page — list all ingredients (name, category, unit)
- [x] Inline edit: name, category, unit per ingredient
- [x] Delete ingredient (only if not referenced by any recipe)
- [x] MCP tools: `update_ingredient`, `delete_ingredient` exposed via `/api/mcp`

**Verification:** Navigate to `/ingredients` → find an ingredient with category "other" → update its category → save → category reflects in the shopping list.

### ✅ 8. Recency memory — avoid repeating recipes
Prevents the app from suggesting the same thing two weeks in a row.

- [x] "Commit to this week" creates a shop record (`shops` + `shop_recipes`)
- [x] Auto-pick excludes recipes cooked in the last 2 weeks
- [x] Shop history is the only data stored — no ratings, no preferences

**Verification:** Commit a shop → next "Shop Now" does not suggest the same recipes.

### ✅ 9. Persistent weekly shop — API-driven recommendations
The shop becomes a durable record, not a transient page. "Shop Now" returns to the current week's shop if one exists; only generates a new one when the user explicitly asks.

- [x] `POST /api/recommend` — API endpoint that returns recommended recipe IDs (excludes recently cooked, random selection logic lives server-side)
- [x] Clicking "Shop Now" checks for an existing shop this week; if found, navigates to it instead of generating a new one
- [x] When no shop exists for the current week, calls the recommend API, creates a shop record with the returned recipes, then navigates to it
- [x] `/shop/[id]` — shop detail page that loads a specific shop record (recipes + aggregated ingredients)
- [x] "Start new week" action at the top of the shop page — creates a fresh shop (new recommend call + new record), replacing the current week's active shop
- [x] Remove the implicit "commit" step — the shop is persisted on creation, not after the fact
- [x] MCP tool: `recommend_recipes` exposed via `/api/mcp` so any agent can trigger a recommendation

**Verification:** Tap "Shop Now" → shop record is created → refresh the page → same shop loads. Tap "Start new week" → new recipes appear → old shop is replaced.

### 🔲 10. Ingredient overlap signal (power-user enhancement)
Visible hint in the manual picker that two selected recipes share ingredients.

- [ ] Shared ingredients show a badge ("used in 2 recipes") in the aggregated list
- [ ] Makes the waste-reduction benefit visible when picking combinations manually

---

## Supabase Data Model

**Tables to keep:**
- `ingredients` (+ `category` column)
- `recipes`
- `recipe_ingredients`
- `shops` — cooking history (one record per committed week)
- `shop_recipes` — which recipes were in each week

**Tables to drop:**
- `shop_ingredients`
- `recipe_instructions`

---

## What's Explicitly Out of Scope

- PDF recipe import
- Store pack size / excess quantity tracking (revisit after feature 7)
- Multi-store support
- User authentication / multi-user
- Shopping history analytics
- Step-by-step recipe instructions
- Preference settings, dietary filters, or ratings

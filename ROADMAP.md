# Meal Guru — Roadmap

**Vision:** Get someone to their shopping list in under 30 seconds with no decisions required.

**Core scenario:** It's Monday, you're near the supermarket, you forgot to plan. You open the app, tap one button, get a shopping list, and walk in. The planning UI (manual recipe picker) is a power-user escape hatch — not the primary flow.

Old code is preserved on the `archive/v1` branch for reference.

---

## Completed (v1)

Features 0–13 shipped. Summary:

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

---

## Backlog

### 14. Shop cooking mode
After finishing shopping, switch the shop page to show recipes to cook instead of the ingredient list.

- [ ] Add `status` column to `shops` table (default `'shopping'`, transitions to `'cooking'`)
- [ ] "Done shopping" button on shop page that sets status to `'cooking'`
- [ ] When status is `'cooking'`, render recipe cards with links to `/recipe/[id]` instead of the ingredient checklist
- [ ] E2E tests

**Verification:** Open a shop, click "Done shopping", confirm the page now shows recipe cards linking to cooking views. Reload and confirm the cooking mode persists.

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

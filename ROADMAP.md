# Meal Guru — Roadmap

**Vision:** Get someone to their shopping list in under 30 seconds with no decisions required.

**Core scenario:** It's Monday, you're near the supermarket, you forgot to plan. You open the app, tap one button, get a shopping list, and walk in. The planning UI (manual recipe picker) is a power-user escape hatch — not the primary flow.

Old code is preserved on the `archive/v1` branch for reference.

---

## Completed (v1)

Features 0–10 shipped. Summary:

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

---

## Backlog

### 11. Recipe step instructions with ingredient links

Allow recipes to have ordered step-by-step instructions. Each step can optionally reference which of the recipe's ingredients are needed for that step — helping the cook know what to prepare and when. Steps are optional: existing recipes without instructions continue to work.

- [ ] DB migration: add `recipe_steps` table (recipe_id, step_number, instruction)
- [ ] DB migration: add `step_ingredients` junction table (step_id, recipe_ingredient_id)
- [ ] Backend: add database functions (get/set/delete steps per recipe)
- [ ] MCP: expose step management tools (add_step, update_step, delete_step, list_steps)
- [ ] UI: add steps section to the recipe editor (add-recipe flow)
- [ ] UI: display steps with their linked ingredients on the recipe page

**Verification:** Add a step to an existing recipe via MCP; verify step + ingredient links are stored and returned. Add a recipe with steps via the UI; verify steps display correctly. Confirm a recipe with no steps still works normally.

<!-- Template:
### N. Feature name
Short description of what and why.

- [ ] Task 1
- [ ] Task 2

**Verification:** How to confirm it works.
-->

---

## Supabase Data Model

**Active tables:**

- `ingredients` (+ `category` column)
- `recipes`
- `recipe_ingredients`
- `shops` — cooking history (one record per committed week)
- `shop_recipes` — which recipes were in each week

**Pending tables (planned):**

- `recipe_steps` — ordered instructions per recipe (replaces old dropped `recipe_instructions`)
- `step_ingredients` — junction: which recipe ingredients each step uses

**Dropped tables:**

- `shop_ingredients`

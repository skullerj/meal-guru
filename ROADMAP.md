# Meal Guru — Roadmap

**Core problem:** Tell me what to cook this week so I spend money wisely and waste as little food as possible.

Old code is preserved on the `archive/v1` branch for reference.

---

## Feature List (in order)

### ✅ 0. Archive old code
- [x] Create `archive/v1` branch with all v1 code

### 🔲 1. Design system foundation
- [ ] shadcn/ui (New York style) installed and configured
- [ ] CSS custom properties defined in `global.css` (colors, spacing)
- [ ] Shared components: `Button`, `IconButton`, `Icon` with clean, consistent styling
- [ ] Typeface chosen and applied

### 🔲 2. Recipe list (CRUD)
- [ ] `/recipes` page — list all recipes
- [ ] Add recipe form: name + ingredients (name, amount, unit)
- [ ] Edit recipe
- [ ] Delete recipe
- [ ] Data: `recipes`, `ingredients`, `recipe_ingredients` tables in Supabase

### 🔲 3. Weekly meal picker
- [ ] Recipe grid with toggle selection
- [ ] Aggregated ingredient list (grouped by category)
- [ ] `category` column added to `ingredients` table

### 🔲 4. Ingredient overlap signal
- [ ] Shared ingredients show a badge ("used in 2 recipes") in the aggregated list
- [ ] Makes waste-reduction visible when picking recipe combinations

### 🔲 5. Week suggestion ("Suggest my week" button)
- [ ] Button suggests 2 recipes based on:
  - Ingredient synergy (recipes sharing ingredients score higher)
  - Recency penalty (recently cooked recipes score lower)
- [ ] Suggestions pre-populate the meal picker
- [ ] "Commit to this week" button creates a shop record (`shops` + `shop_recipes`)
- [ ] Shop history drives next week's recency scoring

### 🔲 6. Shopping list output
- [ ] Ingredients grouped by category
- [ ] Checkbox per item (tick off while shopping)
- [ ] Total estimated cost displayed
- [ ] Clean, readable on a phone

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
- Ocado £40 threshold optimization
- Multi-store support
- User authentication / multi-user
- Shopping history analytics
- Step-by-step recipe instructions

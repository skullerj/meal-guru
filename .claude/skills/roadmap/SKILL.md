---
name: roadmap
description: This skill should be used when the user asks to "work on the roadmap", "start the next feature", "what's next", "show roadmap status", "implement feature N", "continue the roadmap", or wants to know what to build next in the meal-guru project. Manages ROADMAP.md and coordinates feature implementation by delegating work to specialized agents.
version: 1.0.0
---

# Meal Guru Roadmap Manager

Coordinates feature development for the meal-guru project by reading `ROADMAP.md`, identifying the next feature, breaking it into tasks, delegating to the right agents, and updating the roadmap as work completes.

## Workflow

### Step 1 — Read current roadmap state

Read `ROADMAP.md` at the project root. Parse the feature list:
- `✅` or `[x]` = complete
- `🔲` or `[ ]` = incomplete

Identify:
- Features that are fully done (all sub-tasks `[x]`)
- The **next feature** (first feature with any incomplete sub-task)
- Features queued after that

### Step 2 — Report status

Before implementing anything, show a brief status:

```
✅ Feature 0 — Archive old code
✅ Feature 1 — Design system foundation
🔲 Feature 2 — Recipe list (CRUD)  ← NEXT
🔲 Feature 3 — Weekly meal picker
🔲 Feature 4 — Ingredient overlap signal
🔲 Feature 5 — Week suggestion
🔲 Feature 6 — Shopping list output
```

If the user invoked this without a clear "start" intent (e.g., just `/roadmap`), stop here and ask if they want to begin the next feature.

### Step 3 — Plan the feature

Before delegating any implementation, read the ROADMAP.md feature description to understand:
- What screens/pages are needed
- What data model changes are required
- What components need to be built

Then read the key files that will be affected (check `src/pages/`, `src/components/`, `src/lib/database.ts`, `supabase/migrations/`).

Use the **Plan agent** for features that involve:
- New data model changes (new Supabase migration needed)
- Multiple new screens + components
- Complex state management decisions

Skip the Plan agent for simple, well-understood features (e.g., a single CRUD page with no new schema changes).

### Step 4 — Delegate implementation

Break the feature into independent chunks and assign each to the right agent. Run independent chunks **in parallel** (single message, multiple Agent tool calls).

See `references/agents.md` for agent selection guidance.

**Common delegation patterns:**

For a CRUD feature (e.g., Recipe list):
1. Supabase migration (if needed) → general-purpose agent
2. UI page + components → astro-web-dev agent
3. Database functions → general-purpose agent (can run parallel with UI)

For a complex feature (e.g., week suggestion algorithm):
1. Explore agent → understand existing patterns first
2. Plan agent → design the algorithm and component structure
3. astro-web-dev agent → UI implementation
4. general-purpose agent → algorithm/scoring logic

### Step 5 — Add E2E tests

**This step is mandatory for every feature, no exceptions.**

After implementation, delegate E2E test writing to the `astro-web-dev` agent. Tests must cover the golden path described in the feature's verification checklist plus any significant error or edge-case states.

Follow the conventions in `tests/` (read existing specs before writing):
- Add new spec file to `tests/e2e/<feature>.spec.ts`
- Register any test-created data names in `tests/fixtures/data.ts` for cleanup
- Update `tests/setup/global-setup.ts` to wipe any new tables the feature introduces
- Use `await page.waitForLoadState('networkidle')` after `page.goto()`
- Prefer `getByRole` over `getByText`/`getByLabel`

### Step 6 — XP Code Review

**This step is mandatory for every feature, no exceptions.**

After implementation and tests are written, launch an **xp-reviewer agent** to review the changes. This review runs in its own context as a separate agent so it has a fresh perspective on the code.

**How to run the review:**

1. Use the Agent tool to spawn a new agent. In the prompt, instruct it to:
   - Load the `xp-reviewer` skill by reading `.claude/skills/xp-reviewer/SKILL.md` and `.claude/skills/xp-reviewer/references/c2wiki-wisdom.md`
   - Run `git diff HEAD~1` (or the appropriate range covering all commits for this feature) to see the full changeset
   - Read any new or significantly modified files in full for context
   - Apply the XP review workflow from the skill: understand intent, apply the smell test, prioritize the top 3-5 issues, suggest concrete refactorings
   - Return a structured review with: what's good, issues found (with severity: "must fix" vs "consider"), and suggested refactorings

2. **Present the review to the user.** Do NOT auto-apply any changes. Show the review output and ask the user which issues (if any) they want to address.

3. **If the user approves changes**, delegate the fixes to the appropriate agent (`astro-web-dev` for UI, `astro-backend-dev` for backend). Then re-run the E2E tests to make sure nothing broke.

4. **If the user says "skip" or "looks good"**, proceed to Step 7.

### Step 7 — Update ROADMAP.md

After each sub-task completes, update the corresponding `[ ]` to `[x]` in ROADMAP.md.

When all sub-tasks for a feature are `[x]`, change the feature's `🔲` to `✅`.

Commit the ROADMAP.md update as part of the feature commit, not separately.

### Step 8 — Verify

After implementation, run the verification step listed for that feature in ROADMAP.md. This typically means:
- Starting the dev server: `npm run dev`
- Manually testing the golden path described in the feature's verification checklist
- Running `npx astro check` to confirm no type errors

If a browser test is needed, use the `mcp__claude-in-chrome__*` tools (load them first with ToolSearch).

---

## Feature-specific notes

### Feature 2 — Recipe list (CRUD)
- Manual entry only — no PDF import, no AI parsing
- Ingredient autocomplete should search the existing `ingredients` table
- When adding a new ingredient (not in library), create it in the `ingredients` table first, then link to the recipe
- Supabase migration needed: none (schema already has the needed tables from `20260417000000_initial_schema.sql`)
- Key page: `src/pages/recipes/index.astro`
- Key components to build: `RecipeList.tsx`, `AddRecipeForm.tsx`, `EditRecipeForm.tsx`

### Feature 3 — Weekly meal picker
- Supabase migration needed: the `category` column on `ingredients` — create a new migration file
- Key page: `src/pages/index.astro` (replace placeholder)
- Key component: `MealPlanner.tsx` with `RecipeGrid.tsx` and `ShoppingList.tsx`
- State: use `useReducer` pattern per CLAUDE.md guidelines

### Feature 4 — Ingredient overlap signal
- Builds on top of Feature 3's aggregated ingredient list
- No new pages or data model changes
- Add `recipeCount` to the aggregated ingredient type
- Show a badge when `recipeCount > 1`

### Feature 5 — Week suggestion
- Reads from `shops` and `shop_recipes` tables
- Algorithm: `score(A, B) = sharedIngredientCount(A, B) - recencyPenalty(A) - recencyPenalty(B)`
- Recency penalty: 3 (cooked this week), 2 (last week), 1 (2 weeks ago), 0 (older)
- A "week" = 7 days from shop `created_at`
- "Commit to this week" button creates a new `shops` record with linked `shop_recipes`

### Feature 6 — Shopping list output
- Polish existing list from Feature 3
- Add category grouping: produce → tins → dairy → meat → pantry → other
- Add checkboxes (local state, not persisted)
- Total cost: sum ingredient prices if source price data available (nullable — don't require it)

---

## Additional Resources

- **`references/agents.md`** — Which agent to use for which type of work, with prompting guidance

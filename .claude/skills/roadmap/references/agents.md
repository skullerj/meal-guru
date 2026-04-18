# Agent Selection Guide — Meal Guru

## Available Agent Types

### `astro-web-dev`
**Use for:** All UI implementation — Astro pages, React components, Tailwind CSS styling, layout changes.

**The go-to agent for:**
- Creating new pages (`src/pages/`)
- Building new React components (`src/components/`)
- Modifying existing UI
- Styling and layout work

**Prompting tips:**
- Always specify the file paths to create/modify
- Include the design constraints: shadcn/ui components, amber/stone palette, Inter font
- Reference existing components they should match in style (e.g., `src/components/shared/Button.tsx`)
- Mention that Biome is the linter (no biome-ignore comments)
- Tell them to use `src/components/shared/Button.tsx`, `Icon.tsx`, `IconButton.tsx`

**Example prompt structure:**
```
Implement [feature] in the meal-guru Astro project at /Users/juan/personal/meal-guru.

Create:
- src/pages/recipes/index.astro — recipe list page
- src/components/recipe-list/RecipeList.tsx — main component

Design: shadcn/ui, Tailwind, amber primary (#primary CSS var), Inter font.
Use Button from src/components/shared/Button.tsx, Icon from Icon.tsx.
Data: call getRecipes() from src/lib/database.ts.
Follow the useReducer pattern from CLAUDE.md for state management.
```

---

### `Explore`
**Use for:** Understanding existing code before implementing. Answering "what's already there?" questions.

**The go-to agent for:**
- Finding existing functions/utilities to reuse
- Understanding the current state of a component
- Checking what migrations already exist
- Tracing data flow

**Use BEFORE** Plan or implementation agents when the scope is uncertain.

---

### `Plan`
**Use for:** Designing implementation strategy for complex features.

**The go-to agent for:**
- Features touching multiple files/components
- New state management architecture
- Deciding between approaches

**Give it:**
- File paths of relevant existing code
- A description of what needs to be built
- The constraints (Astro + React, useReducer pattern, existing data model)

**Use Plan output** to write precise implementation prompts for `astro-web-dev`.

---

### `astro-backend-dev` (project agent — invoke via Agent tool with `subagent_type: "astro-backend-dev"` ... actually this is a project-level agent and cannot be invoked via the Agent tool. Use `general-purpose` for all backend work instead, with the same rules.)

### `general-purpose`
**Use for:** Everything that isn't UI — database functions, business logic, Supabase migrations, algorithms.

**The go-to agent for:**
- Writing/modifying `src/lib/database.ts`
- Creating Supabase migration SQL files
- Implementing scoring algorithms (suggestion feature)
- Utility functions in `src/lib/` or component `utils/` files

**Critical rule for backend work**: All `supabase.from()` calls must live in `src/lib/database.ts`. Action handlers in `src/actions/` only call exported database functions — never inline Supabase queries. Never define local helper functions inside action files that call Supabase; those helpers belong in `database.ts`.

**Example: Creating a migration**
```
In the meal-guru project at /Users/juan/personal/meal-guru, create a Supabase migration file.

File: supabase/migrations/20260417000001_add_category_to_ingredients.sql

Add a nullable `category` column to the `ingredients` table using the existing `category_type` enum
(values: 'produce', 'tins', 'dairy', 'meat', 'pantry'). Include an index on the new column.
```

---

## Parallelization Rules

Run agents **in parallel** (single message, multiple Agent calls) when their work is independent:
- UI component + database function for the same feature ✅
- Two unrelated UI pages ✅
- A migration + the TypeScript types for that migration ✅

Run agents **sequentially** when output of one feeds into the next:
- Explore first → then Plan → then implement ✅
- Plan first → then implement ✅
- Migration first → then UI that reads from new column ✅ (usually — unless UI just uses nullable field)

---

## Commit Conventions

All commits must use these prefixes per CLAUDE.md:
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, dependency updates

After each agent completes a feature or sub-task, verify the commit was made with the right prefix before marking the ROADMAP item as `[x]`.

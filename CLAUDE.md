# Meal Guru Project

## Agent Delegation Rules

**IMPORTANT — these rules override default behavior and must always be followed:**

- For any UI change, feature implementation, component work, or layout modification: **always delegate to the `astro-web-dev` agent** via the Agent tool. Never implement these directly.
- For any backend logic, Astro actions, or database functions: **always delegate to the `astro-backend-dev` agent** via the Agent tool. Never implement these directly.

Only handle research, planning, file reading, or coordination yourself. Implementation goes through the agents.

## Project Overview
Meal Guru is an Astro-based web application designed to reduce the mental strain of meal planning and preparation. The app helps people efficiently plan and prepare meals for the week through batch cooking, saving time and money while eliminating the frustration of wandering around supermarkets trying to find ingredients for recipes.

**Target User**: People who want to cook for multiple days at once (batch cooking) and streamline their grocery shopping and meal preparation process.

## Tech Stack
- **Framework**: Astro 5.12.8 with Netlify adapter for SSR
- **Language**: TypeScript
- **Frontend**: React for interactive components
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: npm
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)
- **Icons**: Lucide React
- **Linter/Formatter**: Biome
- **Git Hooks**: Lefthook
- **AI Integration**: Anthropic Claude API for recipe parsing
- **Data Fetching**: React Query (@tanstack/react-query) for client-side data fetching and caching

## Development Commands
```bash
# Install dependencies
npm install

# Start development server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Run Astro CLI commands
npm run astro ...

# Run E2E tests (requires .env.test — see Testing section)
npm run test:e2e

# Open Playwright HTML report after a failed run
npm run test:e2e:report

# Interactive Playwright UI for debugging
npm run test:e2e:ui
```

## Environment Configuration
Create a `.env` file in the project root with:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

To get an Anthropic API key:
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Add it to your `.env` file

To get Supabase credentials:
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > API to get your URL and anon key

## Testing

The project uses Playwright for E2E tests against the hosted Supabase instance.

### Setup

Create a `.env.test` file in the project root:
```bash
PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here  # Secret key (not the publishable one)
```

The service role key is needed because `global-setup.ts` seeds and cleans test data with elevated permissions.

Install the Playwright browser on first use:
```bash
npx playwright install chromium
```

### Test structure

```
tests/
├── e2e/              # Playwright spec files (one per feature area)
├── fixtures/
│   └── data.ts       # All test data constants — recipe names, ingredient names, seed data
└── setup/
    └── global-setup.ts  # Runs before every test run: wipes then re-seeds test data
```

### Playwright projects

The Playwright config defines three projects:
- **`setup`**: Authenticates the test user and saves session to `tests/.auth/user.json`
- **`chromium`**: Runs most tests with stored auth state (logged in). Ignores `auth.spec.ts` and `mcp-auth.spec.ts`
- **`chromium-auth`**: Runs `auth.spec.ts` and `mcp-auth.spec.ts` without stored auth state (logged out). Tests that need auth must log in manually within the test

When adding a new test file that needs logged-out browser state, add it to both the `testIgnore` array of `chromium` and the `testMatch` array of `chromium-auth` in `playwright.config.ts`.

### Conventions

- **Cleanup in global-setup**: Any recipe or ingredient name created by a test must be listed in `TEST_CREATED_RECIPES` / `TEST_CREATED_INGREDIENTS` in `tests/fixtures/data.ts` so `global-setup.ts` can wipe it before the next run.
- **Wait for React hydration**: Astro uses `client:load` for React islands — always call `await page.waitForLoadState('networkidle')` after `page.goto()` before interacting with React-managed buttons.
- **Prefer `getByRole` over `getByLabel`/`getByText`**: Lucide icons render `aria-label` on the SVG itself, so `getByLabel` matches both the button and the icon. Use `getByRole('button', { name: '...' })` instead. Similarly, use `getByRole('heading', { name: '...' })` instead of `getByText` to avoid matching the same text in hidden JSON/debug output.
- **API-only tests**: Use Playwright's `request` fixture for direct HTTP requests (e.g., testing API auth). These don't depend on browser auth state.

## Project Structure
```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── app/
│   │   │   ├── App.tsx                  # SPA root: QueryClientProvider + RouterProvider
│   │   │   ├── AppLayout.tsx            # Authenticated layout: nav bar (React <Link>) + <Outlet />
│   │   │   └── router.tsx               # TanStack Router route tree with auth guard, inline route components
│   │   ├── meal-planner/
│   │   │   ├── MealPlanner.tsx          # Main React component with 3-column layout
│   │   │   ├── ShoppingList.tsx         # Reusable shopping list with checkboxes, collapsible "Completed" section with entrance animations, and optional React Query cache invalidation (supports persisted checks via shopIngredients/shopId props)
│   │   │   ├── RecipeColumn.tsx         # Recipe selection column
│   │   │   ├── ShoppingColumn.tsx       # Aggregated ingredients column
│   │   │   ├── LeftToBuyColumn.tsx      # Items to buy column
│   │   │   ├── AddIngredientDialog.tsx  # Dialog for adding extra ingredients
│   │   │   └── utils/
│   │   │       ├── mealPlannerUtils.ts  # Price calculations & ingredient aggregation
│   │   │       └── mealPlannerReducer.ts # State management with useReducer
│   │   ├── add-recipe/
│   │   │   ├── AddRecipeForm.tsx        # Main React component for recipe creation
│   │   │   ├── PdfUploadStep.tsx        # Pure component for PDF upload
│   │   │   ├── RecipeEditStep.tsx       # Pure component for recipe editing
│   │   │   ├── IngredientInput.tsx      # Pure component with autocomplete
│   │   │   ├── JsonOutputStep.tsx       # Pure component for JSON output
│   │   │   └── utils/
│   │   │       ├── addRecipeUtils.ts    # Recipe form business logic
│   │   │       └── addRecipeReducer.ts  # Add recipe state management
│   │   ├── recipes/
│   │   │   └── RecipeList.tsx           # Recipe CRUD list (uses direct Supabase browser client, not Astro actions)
│   │   ├── ingredients/
│   │   │   └── IngredientList.tsx        # Ingredient CRUD table
│   │   ├── home/
│   │   │   └── HomePage.tsx             # Context-aware home page: no recipes, no shop, shopping, or cooking state
│   │   ├── shop/
│   │   │   └── ShopPage.tsx             # Shop page: shopping mode (checklist) ↔ cooking mode (recipe cards)
│   │   ├── recipe/
│   │   │   └── CookingView.tsx          # Mobile-first step-by-step cooking interface
│   │   ├── auth/
│   │   │   └── LoginForm.tsx            # Email/password login/signup form; supports returnTo query param redirect
│   │   ├── oauth/
│   │   │   └── ConsentForm.tsx          # OAuth consent screen (approve/deny authorization)
│   │   ├── shared/
│   │   │   ├── Button.tsx               # Reusable button component
│   │   │   ├── Icon.tsx                 # Centralized icon component (Lucide)
│   │   │   ├── IconButton.tsx           # Interactive icon button component
│   │   │   └── PageLayout.tsx           # Standardized page layout (max-w-lg, header, back link, actions)
│   │   └── ui/
│   │       └── dialog.tsx               # shadcn Dialog component (Radix UI)
│   ├── data/
│   │   └── recipes.ts               # TypeScript interfaces only
│   ├── lib/
│   │   ├── supabase.ts              # Server-only Supabase clients: createSupabaseServerClient (auth-aware), createServiceRoleClient (MCP/admin)
│   │   ├── supabase-browser.ts      # Browser-safe Supabase client for React components (singleton)
│   │   ├── database.ts              # Database access functions (all accept SupabaseClient as first param)
│   │   ├── query-client.ts          # Singleton React Query QueryClient instance
│   │   ├── queries.ts               # React Query hooks (useRecipes, useRecipe, useIngredients, useActiveShop, useShop, useShopIngredients) and queryKeys factory
│   │   └── utils.ts                 # Utility functions (cn for className merging)
│   ├── middleware.ts                 # Middleware: protects /oauth/* routes, serves /.well-known/oauth-protected-resource PRM
│   ├── layouts/
│   │   └── Layout.astro             # Used only by oauth/consent.astro
│   ├── pages/
│   │   ├── [...path].astro          # SPA catch-all: serves App component with client:only="react"
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── signout.ts       # POST endpoint: signs out user (legacy, used by Layout.astro)
│   │   │   ├── mcp.ts               # MCP endpoint with Bearer token auth
│   │   │   └── parse-recipe.ts      # AI recipe parsing API
│   │   └── oauth/
│   │       └── consent.astro        # OAuth consent page (SSR, middleware-protected)
│   └── styles/
│       └── global.css
├── .env (create this file)
├── astro.config.mjs
├── biome.json
├── components.json                  # shadcn/ui configuration
├── lefthook.yml
├── package.json
└── tsconfig.json
```

## Features Implemented
- **Recipe Data Structure**: TypeScript interfaces for recipes, ingredients, and instruction steps
- **Context-Aware Home Page** (`/`): React island that shows different content based on user state — onboarding (no recipes), start the week (no active shop), shopping list link (active shop in shopping mode), or cooking view link with start-new-week option (active shop in cooking mode). Uses `useRecipes` and `useActiveShop` React Query hooks
- **Manual Recipe Picker** (`/pick`): Interactive meal planning with recipe selection, ingredient aggregation, and shopping optimization
- **Persistent Weekly Shop** (`/shop/[id]`): Loads a persisted shop record with two modes — "shopping" (ingredient checklist) and "cooking" (recipe cards linking to `/recipe/[id]`). "Done shopping" transitions to cooking mode
- **Step-by-Step Cooking View** (`/recipe/[id]`): Mobile-first cooking interface showing one step at a time with per-step ingredient list, overview/intro screen, and Previous/Next/Done navigation
- **Recipe Import Tool** (`/add-recipe`): PDF upload with AI-powered parsing using Claude API
- **Supabase Integration**: Centralized database with ingredient library and standardized units
- **Interactive Features**: Complex state management, real-time price calculations, ingredient aggregation
- **Ingredient Management**: edit name/unit/category and delete (with referential integrity guard) via direct Supabase calls from React
- **Authentication**: Supabase Auth via `@supabase/ssr`. Auth guard in TanStack Router's `beforeLoad` checks `supabase.auth.getUser()` and redirects unauthenticated users to `/login?returnTo=<path>`. Sign-out via `supabase.auth.signOut()` in the AppLayout nav bar. Server middleware only protects `/oauth/*` routes
- **MCP OAuth**: The `/api/mcp` endpoint requires a `Bearer` token (Supabase access token) in the `Authorization` header. Invalid/missing tokens return 401 with `WWW-Authenticate` header pointing to the PRM endpoint. The middleware serves `/.well-known/oauth-protected-resource` with Protected Resource Metadata JSON (resource URL, Supabase auth server, supported scopes)
- **OAuth Consent** (`/oauth/consent`): SSR page for third-party OAuth authorization. Receives `authorization_id` query param, fetches authorization details from Supabase, and renders ConsentForm for user to approve/deny. LoginForm supports `returnTo` query param for post-login redirect back to consent page
- **SPA with Client-Side Routing**: Single-page app using TanStack Router (`src/components/app/`). A single Astro catch-all page (`[...path].astro`) serves the React app with `client:only="react"`. `App.tsx` provides `QueryClientProvider` + `RouterProvider`. Route components inline data-fetching via React Query hooks. Navigation uses TanStack Router `<Link>` and `useNavigate()` — no full-page reloads between SPA routes. Server routes (`/api/*`, `/oauth/*`) are separate Astro pages

## Data Structure
- **Recipes**: Complete recipes with ingredients stored in Supabase
- **Ingredients**: Master ingredient library with standardized units ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit')
- **Database**: PostgreSQL via Supabase with proper relationships and RLS security

## Backend API Reference

### `src/lib/database.ts` functions

All functions accept `supabase: SupabaseClient` as their first parameter. Callers create a server client via `createSupabaseServerClient()` (for Astro pages/actions/API routes) or `createServiceRoleClient()` (for admin/MCP operations) from `@/lib/supabase`.

| Function | Description |
|----------|-------------|
| `getRecipes(supabase)` | Fetch all recipes with nested ingredients |
| `getRecipe(supabase, id)` | Fetch a single recipe by UUID |
| `createRecipe(supabase, name)` | Insert a new recipe row |
| `updateRecipe(supabase, id, name)` | Update recipe name |
| `deleteRecipe(supabase, id)` | Delete a recipe (cascades to recipe_ingredients) |
| `getIngredients(supabase)` | Fetch all ingredients ordered by name |
| `upsertIngredient(supabase, ingredient)` | Insert or update ingredient by name (uses select+insert/update for composite unique constraint) |
| `updateIngredient(supabase, id, data)` | Update an ingredient's name, unit, and category by UUID |
| `deleteIngredient(supabase, id)` | Delete an ingredient; throws if referenced by any recipe |
| `setRecipeIngredients(supabase, recipeId, ingredients)` | Replace all ingredients for a recipe |
| `createRecipeWithIngredients(supabase, name, ingredients, steps?)` | Create recipe + set ingredients + optionally save steps atomically |
| `updateRecipeWithIngredients(supabase, id, name, ingredients, steps?)` | Update recipe + replace ingredients + optionally save steps atomically |
| `getRecentRecipeIds(supabase, withinDays?)` | Return distinct recipe UUIDs from shops created within the last N days (default 14) |
| `commitShop(supabase, recipeIds)` | Insert a new shop row, link recipe UUIDs, and populate `shop_ingredients` snapshot; returns `{ id }` |
| `getWeekMonday(date?)` | Returns ISO date string (YYYY-MM-DD) of the Monday of the given date's week (no supabase param — pure function) |
| `getActiveShopForWeek(supabase, weekOf?)` | Find the active shop for a given week (defaults to current week); returns `ShopSummary` or `null` |
| `getShopWithRecipes(supabase, id)` | Fetch a shop by ID with full nested Recipe[] data; returns `ShopWithRecipes` or `null` |
| `createShop(supabase, recipeIds, weekOf?)` | Create a new shop with `week_of` and `active=true`, link recipe IDs, and populate `shop_ingredients` snapshot; returns `{ id }` |
| `deactivateShopsForWeek(supabase, weekOf)` | Set `active = false` on all active shops for the given week |
| `recommendRecipeIds(supabase, count?, excludeDays?)` | Pick random recipe IDs excluding recently cooked ones; falls back to all if too few |
| `getRecipeSteps(supabase, recipeId)` | Fetch all steps for a recipe ordered by step_number, with ingredient_ids populated |
| `setRecipeSteps(supabase, recipeId, steps)` | Replace all steps for a recipe atomically (delete + insert); each step has step_number, instruction, ingredient_ids (recipe_ingredient.id values) |
| `populateShopIngredients(supabase, shopId, recipes)` | Aggregate ingredients across recipes and insert snapshot rows into `shop_ingredients` |
| `getShopIngredients(supabase, shopId)` | Fetch all `shop_ingredients` for a shop, ordered by name; returns `ShopIngredient[]` |
| `toggleShopIngredient(supabase, id, checked)` | Set the `checked` boolean on a specific `shop_ingredients` row |
| `updateShopStatus(supabase, id, status)` | Update the `status` column on a shop row (`"shopping"` or `"cooking"`) |

**Note:** Astro actions (`src/actions/`) were removed in Feature 18. All mutations now go directly from React components to Supabase via the browser client (`src/lib/supabase-browser.ts`).

## React Architecture Guidelines

### Component Architecture Patterns
All React components in this project follow clean architecture with clear separation of concerns:

#### Design Principles
- **Separation of Concerns**: Child components are pure and only handle UI rendering
- **Callback Props Pattern**: Components receive callback functions for user interactions
- **State Management Isolation**: Only parent components manage reducer/dispatch logic
- **Component Reusability**: Child components work with any state management approach

#### Component Interface Design
```typescript
// Clean prop interfaces - no direct state management dependency
interface ChildComponentProps {
  data: DataType[];
  selections: string[];
  onItemToggle: (id: string) => void;  // Callback-based interaction
  onAction?: (payload: ActionPayload) => void;  // Optional callbacks
}
```

#### Component Responsibility Allocation
```typescript
ParentComponent.tsx                // State management coordinator (useReducer)
├── ChildComponent.tsx            // Pure component: UI rendering only
├── AnotherChild.tsx              // Pure component: specific feature UI
└── ActionComponent.tsx           // Pure component: user interactions
```

### State Management Strategy

#### When to Use useReducer
Use `useReducer` over `useState` for:
- **Multi-step forms** with complex validation and interdependent fields
- **Complex state logic** with interdependent data transformations
- **Action-based workflows** where state changes need clear tracking
- **Computed/derived state** that needs consistent recalculation

**Benefits:**
- **Predictable State Updates**: Pure reducer functions ensure predictable state changes
- **Complex State Logic**: Handles interdependent state and computed values
- **Action-Based Updates**: Clear, debuggable state transitions
- **Performance**: Immutable updates prevent unnecessary re-renders
- **Testability**: Reducer functions are pure and easily testable

#### State Structure Pattern
```typescript
interface ComponentState {
  // Core state - user inputs/selections
  primarySelections: string[];
  userInputs: UserInputType[];

  // Computed state - derived from core state
  processedData: ProcessedType[];
  calculatedValues: CalculatedType[];

  // UI state - current step, loading, etc.
  currentStep: string;
  isLoading: boolean;
}
```

#### Action Design Pattern
```typescript
type ComponentAction =
  | { type: 'UPDATE_SELECTION'; id: string; value: any }
  | { type: 'PROCESS_DATA'; payload: ProcessPayload }
  | { type: 'RESET_FORM' }
  | { type: 'SET_STEP'; step: string };
```

#### State Recalculation Strategy
Use a centralized recalculation function in the reducer:
1. Extract core state from action
2. Process/transform data using utility functions
3. Calculate derived state
4. Return new state with both core and computed values

This ensures all derived state stays consistent and calculations are performed in one place.

### Business Logic Layer

#### Utility Functions Pattern
Always separate pure business logic into utility functions:

**Example utility functions:**
- **Data transformation functions**: Convert between formats, aggregate data
- **Calculation functions**: Compute derived values, prices, totals
- **Validation functions**: Form validation, data integrity checks
- **Filter/search functions**: Data filtering, searching, sorting logic

#### Utility Function Structure
```typescript
// componentUtils.ts
export function transformData(input: InputType[]): OutputType[] {
  // Pure function - no side effects
  return input.map(/* transformation logic */);
}

export function calculateValues(data: DataType[]): CalculatedType {
  // Business logic for calculations
  return /* calculation result */;
}

export function validateInput(input: InputType): ValidationResult {
  // Validation logic
  return { isValid: boolean, errors: string[] };
}
```

#### Business Rules Documentation
Document key business rules that drive utility functions:
1. **Data Processing Rules**: How data should be transformed/combined
2. **Calculation Rules**: Formulas and business logic for computed values
3. **Validation Rules**: What constitutes valid input/state
4. **UI Logic Rules**: When to show/hide elements, enable/disable actions

### React Component Creation Checklist

When creating new React components, follow this checklist:

#### 1. Determine State Management Approach
- **Simple state**: Use `useState` for independent state values
- **Complex state**: Use `useReducer` for multi-step forms, interdependent data, computed values
- **No state**: Pure components that only render props

#### 2. Design Component Interface
- **Define clear prop interfaces** with TypeScript
- **Use callback props** for user interactions (`onAction`, `onToggle`, etc.)
- **Avoid passing dispatch/setState** directly to child components
- **Keep components reusable** - no hard-coded business logic

#### 3. Separate Concerns
- **Astro pages**: Fetch data and pass to parent components
- **Parent components**: Handle state management and receive fetched data from the astro page rendering them
- **Child components**: Pure UI rendering and user interactions
- **Utility files**: Business logic, calculations, transformations

#### 4. Follow File Structure
```
components/
├── ParentComponent.tsx        # State management
├── ChildComponent.tsx         # Pure UI component
├── AnotherChild.tsx          # Pure UI component
└── utils/
    ├── parentComponentUtils.ts    # Business logic
    └── parentComponentReducer.ts  # State management (if using useReducer)
```

#### 5. Testing Considerations
- **Pure functions**: Easy to test utility functions
- **Component props**: Test component behavior with different prop combinations
- **State transitions**: Test reducer actions and state changes

### Integration Approach

#### Astro + React Hybrid
- **Astro**: Server-side rendering, routing, static pages
- **React Islands**: Interactive components with `client:load` directive
- **Netlify Adapter**: SSR support for production deployment

#### Data Flow
```
Supabase Database → getRecipes() → MealPlanner (useReducer) → Column Components → User Interactions → Dispatch Actions → State Updates → Re-render
```

This architecture provides:
- **Maintainability**: Clear component boundaries and responsibilities
- **Testability**: Pure functions and isolated state logic
- **Scalability**: Easy to add new features without affecting existing components
- **Performance**: Efficient re-renders through proper state structure

## UI Component Libraries

### shadcn/ui Integration
This project uses shadcn/ui for accessible, customizable UI components built on Radix UI primitives.

**Configuration** (`components.json`):
- **Style**: New York
- **Base Color**: Neutral
- **Icon Library**: Lucide React
- **Path Aliases**: `@/components`, `@/lib`, `@/ui`
- **CSS Variables**: Enabled for theme customization

**Utility Function** (`src/lib/utils.ts`):
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
The `cn()` function combines `clsx` and `tailwind-merge` for conditional className merging.

**Installed Components**:
- **Dialog** (`src/components/ui/dialog.tsx`): Modal dialog component for forms and overlays
  - Uses `@radix-ui/react-dialog` primitives
  - Includes: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription
  - Fully accessible with keyboard navigation and focus management

**Dependencies**:
- `@radix-ui/react-dialog`: Dialog primitives
- `@supabase/ssr`: Server-side auth (browser client, server client, cookie handling)
- `@tanstack/react-query`: Client-side data fetching, caching, and synchronization
- `@tanstack/react-router`: Client-side SPA routing with code-based route tree and auth guards
- `class-variance-authority`: Component variant styling
- `clsx`: Conditional className construction
- `tailwind-merge`: Smart Tailwind class merging
- `lucide-react`: Icon library

**Usage Pattern**:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
```

### Shared Components
Centralized reusable components in `src/components/shared/`:
- **Button.tsx**: Styled button with variants (primary, secondary, success, danger, card) and sizes
- **Icon.tsx**: Centralized icon component using Lucide React
- **IconButton.tsx**: Interactive icon-only button with variants
- **PageLayout.tsx**: Standardized page wrapper with `max-w-lg` container, consistent padding (`px-6 py-8`), optional back link, h1 title, optional subtitle, optional action buttons, and children slot. Used by RecipeList, CookingView, and ShopPage.
- **LoadingSkeleton.tsx**: Pulsing placeholder skeleton for loading states in React Query wrapper components.

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with React integration for interactive components
- **Database**: Supabase (PostgreSQL) with full schema for recipes, ingredients, and relationships
- **Auth**: `@supabase/ssr` with two client modules — `src/lib/supabase.ts` (server: `createSupabaseServerClient`, `createServiceRoleClient`) and `src/lib/supabase-browser.ts` (browser: singleton `supabase` export). Auth guard in TanStack Router's `beforeLoad` checks `supabase.auth.getUser()`. Middleware at `src/middleware.ts` only protects `/oauth/*` routes and serves `/.well-known/oauth-protected-resource` PRM metadata. The MCP endpoint (`/api/mcp`) validates `Bearer` tokens against Supabase Auth and creates a user-scoped client (RLS-aware) instead of using the service role
- **Mutations**: All CRUD operations go directly from React components to Supabase via the browser client — no Astro actions layer. Only `parse-recipe` and MCP stay server-side
- **Data Management**: Recipe data fetched from Supabase via React Query hooks (client-side), TypeScript interfaces in `/src/data/recipes.ts`
- **React Query**: Singleton `QueryClient` in `src/lib/query-client.ts`, hooks in `src/lib/queries.ts`. `QueryClientProvider` wraps the entire app at the root (`App.tsx`). After mutations, call `queryClient.invalidateQueries()` with the relevant `queryKeys` entry to keep caches fresh
- **SPA Router**: TanStack Router in `src/components/app/router.tsx` defines the full route tree with code-based routes. `App.tsx` is the SPA entry point (QueryClientProvider + RouterProvider). `AppLayout.tsx` provides the nav bar for authenticated routes. Auth guard uses `beforeLoad` to check `supabase.auth.getUser()`. A single catch-all Astro page (`[...path].astro`) serves the React app with `client:only="react"`. Route components inline data-fetching via React Query hooks
- **Navigation**: All internal navigation in React components uses TanStack Router (`Link` from `@tanstack/react-router` for links, `useNavigate` for programmatic navigation). Never use `<a href>` for internal routes or `window.location.href` for in-app navigation. The only exceptions are OAuth/API redirects (e.g. `ConsentForm.tsx`, and the server-route fallback in `LoginForm.tsx`) which require full page loads
- State management follows useReducer pattern with clean component separation
- Column components use callback props pattern for state management decoupling
- **Standardized Units**: Ingredient units restricted to: 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit'
- **Ingredient Categories**: 'produce', 'meat', 'dairy', 'bakery', 'canned', 'condiments', 'spices', 'grains', 'oils', 'frozen' (the old values 'tins' and 'pantry' are deprecated in the DB enum but no longer used)
- Tailwind CSS is configured via Vite plugin with global CSS import in Layout.astro
- **UI Components**: Use shadcn/ui components from `@/components/ui/` and shared components from `@/components/shared/`
- **Class Merging**: Use the `cn()` utility function for conditional className merging
- Current state: Full-featured meal planning interface with Supabase backend
- Uses Biome for linting and formatting
- Lefthook configured for pre-commit hooks (runs `npx biome check --write` on staged files with `stage_fixed: true`)
- Complex business logic separated into utility functions for reusability and testing
- **Setup Required**: Run SQL scripts in `database-schema.sql` and `migrate-data.sql` in Supabase SQL Editor

## Project Maintenance Reminders
- Always keep CLAUDE.md up to date when adding new libraries
- The objective of this app is to allow users to save time deciding what to cook for the week, by picking the right recipes for the week for them.
- Commits need to start with the following prefixes: fix, feat, chore depending on the category of the work. example: feat: add new button to reset selection
- For type checking use npx astro check
- Never add biome-ignore comments. If you encounter biome issues that can't be solved, without an ignore just report them at the end and let me handle them

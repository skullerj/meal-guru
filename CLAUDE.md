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
SUPABASE_URL=your_supabase_url_here
SUPABASE_PUB_KEY=your_supabase_publishable_key_here
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
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here  # Secret key (not the publishable one)
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

### Conventions

- **Cleanup in global-setup**: Any recipe or ingredient name created by a test must be listed in `TEST_CREATED_RECIPES` / `TEST_CREATED_INGREDIENTS` in `tests/fixtures/data.ts` so `global-setup.ts` can wipe it before the next run.
- **Wait for React hydration**: Astro uses `client:load` for React islands — always call `await page.waitForLoadState('networkidle')` after `page.goto()` before interacting with React-managed buttons.
- **Prefer `getByRole` over `getByLabel`/`getByText`**: Lucide icons render `aria-label` on the SVG itself, so `getByLabel` matches both the button and the icon. Use `getByRole('button', { name: '...' })` instead. Similarly, use `getByRole('heading', { name: '...' })` instead of `getByText` to avoid matching the same text in hidden JSON/debug output.

## Project Structure
```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── meal-planner/
│   │   │   ├── MealPlanner.tsx          # Main React component with 3-column layout
│   │   │   ├── ShoppingList.tsx         # Reusable shopping list with checkboxes
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
│   │   ├── recipe/
│   │   │   └── CookingView.tsx          # Mobile-first step-by-step cooking interface
│   │   ├── shared/
│   │   │   ├── Button.tsx               # Reusable button component
│   │   │   ├── Icon.tsx                 # Centralized icon component (Lucide)
│   │   │   └── IconButton.tsx           # Interactive icon button component
│   │   └── ui/
│   │       └── dialog.tsx               # shadcn Dialog component (Radix UI)
│   ├── data/
│   │   └── recipes.ts               # TypeScript interfaces only
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client configuration
│   │   ├── database.ts              # Database access functions
│   │   └── utils.ts                 # Utility functions (cn for className merging)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── api/
│   │   │   └── parse-recipe.ts
│   │   ├── add-recipe.astro
│   │   ├── index.astro              # Hero home page: "Shop Now" CTA + link to /pick
│   │   ├── pick.astro               # Manual recipe picker (MealPlanner)
│   │   ├── shop/
│   │   │   ├── index.astro          # Redirect shim: /shop?r=... → /shop/{id}
│   │   │   └── [id].astro           # Persistent weekly shop detail page
│   │   └── recipe/
│   │       └── [id].astro           # Step-by-step cooking view page
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
- **Hero Home Page** (`/`): "Shop Now" CTA calls `shops.getOrCreateWeeklyShop` action and navigates to `/shop/{id}`; secondary link to `/pick` for manual selection
- **Manual Recipe Picker** (`/pick`): Interactive meal planning with recipe selection, ingredient aggregation, and shopping optimization
- **Persistent Weekly Shop** (`/shop/[id]`): Loads a persisted shop record, renders aggregated category-grouped shopping list with "Start new week" button
- **Shop Redirect Shim** (`/shop`): Backward-compatible redirect — creates a shop from `?r=` query params and redirects to `/shop/{id}`
- **Step-by-Step Cooking View** (`/recipe/[id]`): Mobile-first cooking interface showing one step at a time with per-step ingredient list, overview/intro screen, and Previous/Next/Done navigation
- **Recipe Import Tool** (`/add-recipe`): PDF upload with AI-powered parsing using Claude API
- **Supabase Integration**: Centralized database with ingredient library and standardized units
- **Dynamic Routing**: Astro's `getStaticPaths` for recipe-specific pages
- **Interactive Features**: Complex state management, real-time price calculations, ingredient aggregation
- **Ingredient Management Actions**: `ingredients.update` (edit name/unit/category) and `ingredients.delete` (with referential integrity guard) in `src/actions/ingredients.ts`

## Data Structure
- **Recipes**: Complete recipes with ingredients stored in Supabase
- **Ingredients**: Master ingredient library with standardized units ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit')
- **Database**: PostgreSQL via Supabase with proper relationships and RLS security

## Backend API Reference

### `src/lib/database.ts` functions
| Function | Description |
|----------|-------------|
| `getRecipes()` | Fetch all recipes with nested ingredients |
| `getRecipe(id)` | Fetch a single recipe by UUID |
| `createRecipe(name)` | Insert a new recipe row |
| `updateRecipe(id, name)` | Update recipe name |
| `deleteRecipe(id)` | Delete a recipe (cascades to recipe_ingredients) |
| `getIngredients()` | Fetch all ingredients ordered by name |
| `upsertIngredient(ingredient)` | Insert or update ingredient by name |
| `updateIngredient(id, data)` | Update an ingredient's name, unit, and category by UUID |
| `deleteIngredient(id)` | Delete an ingredient; throws if referenced by any recipe |
| `setRecipeIngredients(recipeId, ingredients)` | Replace all ingredients for a recipe |
| `createRecipeWithIngredients(name, ingredients, steps?)` | Create recipe + set ingredients + optionally save steps atomically |
| `updateRecipeWithIngredients(id, name, ingredients, steps?)` | Update recipe + replace ingredients + optionally save steps atomically |
| `getRecentRecipeIds(withinDays?)` | Return distinct recipe UUIDs from shops created within the last N days (default 14) |
| `commitShop(recipeIds)` | Insert a new shop row and link the given recipe UUIDs to it; returns `{ id }` |
| `getWeekMonday(date?)` | Returns ISO date string (YYYY-MM-DD) of the Monday of the given date's week |
| `getActiveShopForWeek(weekOf?)` | Find the active shop for a given week (defaults to current week); returns `ShopSummary` or `null` |
| `getShopWithRecipes(id)` | Fetch a shop by ID with full nested Recipe[] data; returns `ShopWithRecipes` or `null` |
| `createShop(recipeIds, weekOf?)` | Create a new shop with `week_of` and `active=true`, link recipe IDs; returns `{ id }` |
| `deactivateShopsForWeek(weekOf)` | Set `active = false` on all active shops for the given week |
| `recommendRecipeIds(count?, excludeDays?)` | Pick random recipe IDs excluding recently cooked ones; falls back to all if too few |
| `getRecipeSteps(recipeId)` | Fetch all steps for a recipe ordered by step_number, with ingredient_ids populated |
| `setRecipeSteps(recipeId, steps)` | Replace all steps for a recipe atomically (delete + insert); each step has step_number, instruction, ingredient_ids (recipe_ingredient.id values) |

### `src/actions/` namespaces
| Namespace | Actions |
|-----------|---------|
| `recipes` | `create`, `update`, `delete` |
| `ingredients` | `update`, `delete` |
| `shops` | `commit`, `createFromIds`, `startNewWeek`, `getOrCreateWeeklyShop` |

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

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with React integration for interactive components
- **Database**: Supabase (PostgreSQL) with full schema for recipes, ingredients, and relationships
- **Data Management**: Recipe data fetched from Supabase, TypeScript interfaces in `/src/data/recipes.ts`
- State management follows useReducer pattern with clean component separation
- Column components use callback props pattern for state management decoupling
- **Standardized Units**: Ingredient units restricted to: 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit'
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

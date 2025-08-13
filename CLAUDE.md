# Meal Guru Project

## Project Overview
Meal Guru is an Astro-based web application designed to reduce the mental strain of meal planning and preparation. The app helps people efficiently plan and prepare meals for the week through batch cooking, saving time and money while eliminating the frustration of wandering around supermarkets trying to find ingredients for recipes.

**Target User**: People who want to cook for multiple days at once (batch cooking) and streamline their grocery shopping and meal preparation process.

## Tech Stack
- **Framework**: Astro 5.12.8 with Netlify adapter for SSR
- **Language**: TypeScript
- **Frontend**: React for interactive components
- **Package Manager**: npm
- **Styling**: Tailwind CSS
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
```

## Environment Configuration
Create a `.env` file in the project root with:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

To get an Anthropic API key:
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Add it to your `.env` file

## Project Structure
```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── MealPlanner.tsx          # Main React component with 3-column layout
│   │   ├── RecipeColumn.tsx         # Recipe selection column
│   │   ├── ShoppingColumn.tsx       # Aggregated ingredients column
│   │   ├── LeftToBuyColumn.tsx      # Items to buy column
│   │   └── utils/
│   │       ├── mealPlannerUtils.ts  # Price calculations & ingredient aggregation
│   │       └── mealPlannerReducer.ts # State management with useReducer
│   ├── data/
│   │   └── recipes.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── api/
│   │   │   └── parse-recipe.ts
│   │   ├── add-recipe.astro
│   │   ├── index.astro             # Now uses MealPlanner component
│   │   └── recipe/
│   │       ├── [id].astro
│   │       └── [id]/
│   │           └── cook.astro
│   └── styles/
│       └── global.css
├── .env (create this file)
├── astro.config.mjs
├── biome.json
├── lefthook.yml
├── package.json
└── tsconfig.json
```

## Features Implemented
- **Recipe Data Structure**: TypeScript interfaces for recipes, ingredients, and instruction steps
- **3-Column Meal Planning Interface** (`/`): Interactive meal planning with recipe selection, ingredient aggregation, and shopping optimization
- **Shopping List Page** (`/recipe/[id]`): Interactive ingredient checklist with shelf item identification
- **Cooking Page** (`/recipe/[id]/cook`): Step-by-step instructions with ingredient sidebar
- **Recipe Import Tool** (`/add-recipe`): PDF upload with AI-powered parsing using Claude API
- **Dynamic Routing**: Astro's `getStaticPaths` for recipe-specific pages
- **Interactive Features**: Complex state management, real-time price calculations, ingredient aggregation

## Data Structure
- **Recipes**: Complete recipes with ingredients and instructions
- **Ingredients**: Include ID, name, amount, unit, source (URL, price, amount), and shelf status
- **Instructions**: Each step linked to specific ingredient IDs for contextual cooking guidance

## Architecture & State Management

### Component Architecture
The 3-column meal planning interface follows a clean component architecture with clear separation of concerns:

#### Component Responsibility Allocation
```typescript
MealPlanner.tsx                    // State management coordinator
├── RecipeColumn.tsx               // Pure component: recipe selection UI
├── ShoppingColumn.tsx             // Pure component: ingredient aggregation UI  
└── LeftToBuyColumn.tsx           // Pure component: purchase list UI
```

**Design Principles:**
- **Separation of Concerns**: Column components are pure and only handle UI rendering
- **Callback Props Pattern**: Components receive `onRecipeToggle`, `onIngredientToggle` callbacks
- **State Management Isolation**: Only `MealPlanner` knows about the reducer/dispatch logic
- **Component Reusability**: Column components can work with any state management approach

#### Component Interface Design
```typescript
// Clean prop interfaces - no direct state management dependency
interface RecipeColumnProps {
  recipes: Recipe[];
  selectedRecipeIds: string[];
  onRecipeToggle: (recipeId: string) => void;  // Callback-based interaction
}

interface ShoppingColumnProps {
  aggregatedIngredients: AggregatedIngredient[];
  ownedIngredientIds: string[];
  onIngredientToggle: (ingredientId: string) => void;  // Callback-based interaction
}
```

### State Management Strategy

#### useReducer Pattern
Chose `useReducer` over `useState` for complex state management needs:

**Benefits:**
- **Predictable State Updates**: Pure reducer functions ensure predictable state changes
- **Complex State Logic**: Handles interdependent state (recipes → ingredients → prices)
- **Action-Based Updates**: Clear, debuggable state transitions
- **Performance**: Immutable updates prevent unnecessary re-renders
- **Testability**: Reducer functions are pure and easily testable

#### State Structure
```typescript
interface MealPlannerState {
  selectedRecipeIds: string[];           // User's recipe selections
  ownedIngredientIds: string[];          // Ingredients user already owns
  aggregatedIngredients: AggregatedIngredient[];  // Computed: combined ingredients
  remainingToBuy: AggregatedIngredient[];         // Computed: filtered for purchase
  totalPrice: number;                             // Computed: total cost
}
```

#### Action Design
```typescript
type MealPlannerAction =
  | { type: 'TOGGLE_RECIPE'; recipeId: string }
  | { type: 'TOGGLE_OWNED_INGREDIENT'; ingredientId: string }
  | { type: 'RESET_SELECTIONS' };
```

#### State Recalculation Strategy
The reducer uses a centralized `recalculateState` function that:
1. Aggregates ingredients from selected recipes
2. Filters out owned ingredients  
3. Calculates total prices
4. Returns computed state slice

This ensures all derived state stays consistent and calculations are performed in one place.

### Business Logic Layer

#### Utility Functions (`mealPlannerUtils.ts`)
Separated pure business logic into utility functions:

- **`aggregateIngredients()`**: Combines ingredients from multiple recipes
  - Non-shelf items: Quantities are summed (e.g., 200g + 150g onions = 350g)
  - Shelf items: No quantity aggregation (spices, oils don't combine)
- **`calculateIngredientCost()`**: Proportional cost calculation based on needed vs. source amounts
- **`calculateTotalPrice()`**: Sums up costs for remaining ingredients
- **`separateIngredientsByShelf()`**: Categorizes ingredients for different UI sections

#### Key Business Rules
1. **Ingredient Aggregation**: Only non-shelf ingredients combine quantities
2. **Cost Calculation**: Proportional to needed amount vs. source package size
3. **Price Target**: £40 minimum order with remaining amount calculation
4. **Shelf Logic**: Pantry items (oils, spices) vs. fresh ingredients handling

### Integration Approach

#### Astro + React Hybrid
- **Astro**: Server-side rendering, routing, static pages
- **React Islands**: Interactive components with `client:load` directive
- **Netlify Adapter**: SSR support for production deployment

#### Data Flow
```
recipes.ts → MealPlanner (useReducer) → Column Components → User Interactions → Dispatch Actions → State Updates → Re-render
```

This architecture provides:
- **Maintainability**: Clear component boundaries and responsibilities
- **Testability**: Pure functions and isolated state logic
- **Scalability**: Easy to add new features without affecting existing components
- **Performance**: Efficient re-renders through proper state structure

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with React integration for interactive components
- Astro configured with Netlify adapter for SSR support
- State management follows useReducer pattern with clean component separation
- Column components use callback props pattern for state management decoupling
- Tailwind CSS is configured via Vite plugin with global CSS import in Layout.astro
- Current state: Full-featured meal planning interface with 3-column layout
- No testing framework currently configured
- Uses Biome for linting and formatting
- Lefthook configured for pre-commit hooks (runs `npx biome check` on staged files)
- Recipe data stored in `/src/data/recipes.ts` with TypeScript interfaces
- Complex business logic separated into utility functions for reusability and testing

## Project Maintenance Reminders
- Always keep CLAUDE.md up to date when adding new libraries
- The objective of this app is to minimize waste when the user makes their shopping online using Ocado. For that, we first need to parse recipes and allow the user to input the current source information (url,amount and price) so we can compute the excess and use it to group the recipe with other recipes that might use that excess.
- Commits need to start with the following prefixes: fix, feat, chore depending on the category of the work. example: feat: add new button to reset selection
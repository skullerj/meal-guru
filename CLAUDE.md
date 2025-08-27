# Meal Guru Project

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
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
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
│   │   ├── AddRecipeForm.tsx        # Main React component for recipe creation
│   │   ├── PdfUploadStep.tsx        # Pure component for PDF upload
│   │   ├── RecipeEditStep.tsx       # Pure component for recipe editing
│   │   ├── IngredientInput.tsx      # Pure component with autocomplete
│   │   ├── JsonOutputStep.tsx       # Pure component for JSON output
│   │   └── utils/
│   │       ├── mealPlannerUtils.ts  # Price calculations & ingredient aggregation
│   │       ├── mealPlannerReducer.ts # State management with useReducer
│   │       ├── addRecipeUtils.ts    # Recipe form business logic
│   │       └── addRecipeReducer.ts  # Add recipe state management
│   ├── data/
│   │   └── recipes.ts               # TypeScript interfaces only
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client configuration
│   │   └── database.ts              # Database access functions
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── api/
│   │   │   └── parse-recipe.ts
│   │   ├── add-recipe.astro
│   │   ├── index.astro              # Uses MealPlanner with Supabase data
│   │   └── recipe/
│   │       └── [id].astro           # Shopping list page
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
- **Recipe Import Tool** (`/add-recipe`): PDF upload with AI-powered parsing using Claude API
- **Supabase Integration**: Centralized database with ingredient library and standardized units
- **Dynamic Routing**: Astro's `getStaticPaths` for recipe-specific pages
- **Interactive Features**: Complex state management, real-time price calculations, ingredient aggregation

## Data Structure
- **Recipes**: Complete recipes with ingredients and instructions stored in Supabase
- **Ingredients**: Master ingredient library with standardized units ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit')
- **Instructions**: Each step linked to specific ingredient IDs for contextual cooking guidance
- **Database**: PostgreSQL via Supabase with proper relationships and RLS security

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

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with React integration for interactive components
- **Database**: Supabase (PostgreSQL) with full schema for recipes, ingredients, and relationships
- **Data Management**: Recipe data fetched from Supabase, TypeScript interfaces in `/src/data/recipes.ts`
- State management follows useReducer pattern with clean component separation
- Column components use callback props pattern for state management decoupling
- **Standardized Units**: Ingredient units restricted to: 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit'
- Tailwind CSS is configured via Vite plugin with global CSS import in Layout.astro
- Current state: Full-featured meal planning interface with Supabase backend
- No testing framework currently configured
- Uses Biome for linting and formatting
- Lefthook configured for pre-commit hooks (runs `npx biome check` on staged files)
- Complex business logic separated into utility functions for reusability and testing
- **Setup Required**: Run SQL scripts in `database-schema.sql` and `migrate-data.sql` in Supabase SQL Editor

## Project Maintenance Reminders
- Always keep CLAUDE.md up to date when adding new libraries
- The objective of this app is to minimize waste when the user makes their shopping online using Ocado. For that, we first need to parse recipes and allow the user to input the current source information (url,amount and price) so we can compute the excess and use it to group the recipe with other recipes that might use that excess.
- Commits need to start with the following prefixes: fix, feat, chore depending on the category of the work. example: feat: add new button to reset selection

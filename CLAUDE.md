# Meal Guru Project

## Project Overview
Meal Guru is an Astro-based web application designed to reduce the mental strain of meal planning and preparation. The app helps people efficiently plan and prepare meals for the week through batch cooking, saving time and money while eliminating the frustration of wandering around supermarkets trying to find ingredients for recipes.

**Target User**: People who want to cook for multiple days at once (batch cooking) and streamline their grocery shopping and meal preparation process.

## Tech Stack
- **Framework**: Astro 5.12.8
- **Language**: TypeScript
- **Package Manager**: npm
- **Styling**: Tailwind CSS
- **Linter/Formatter**: Biome
- **Git Hooks**: Lefthook

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

## Project Structure
```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   │   └── recipes.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── recipe/
│   │       ├── [id].astro
│   │       └── [id]/
│   │           └── cook.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── biome.json
├── lefthook.yml
├── package.json
└── tsconfig.json
```

## Features Implemented
- **Recipe Data Structure**: TypeScript interfaces for recipes, ingredients, and instruction steps
- **Homepage**: Lists all recipes with navigation to buy/cook pages
- **Shopping List Page** (`/recipe/[id]`): Interactive ingredient checklist with shelf item identification
- **Cooking Page** (`/recipe/[id]/cook`): Step-by-step instructions with ingredient sidebar
- **Dynamic Routing**: Astro's `getStaticPaths` for recipe-specific pages
- **Interactive Features**: Checkbox state management, step completion tracking, ingredient linking

## Data Structure
- **Recipes**: 3 complete recipes (Spaghetti Carbonara, Chicken Stir Fry, Vegetable Soup)
- **Ingredients**: Include ID, name, amount, unit, URL, and shelf status (common household items)
- **Instructions**: Each step linked to specific ingredient IDs for contextual cooking guidance

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with TypeScript and Tailwind CSS
- Tailwind CSS is configured via Vite plugin with global CSS import in Layout.astro
- Current state: Functional barebones recipe website with shopping and cooking workflows
- No testing framework currently configured
- Uses Biome for linting and formatting
- Lefthook configured for pre-commit hooks (runs `npx biome check` on staged files)
- Recipe data stored in `/src/data/recipes.ts` with TypeScript interfaces
- Interactive client-side functionality for ingredient tracking and step progression

## Project Maintenance Reminders
- Always keep CLAUDE.md up to date when adding new libraries
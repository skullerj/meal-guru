# Meal Guru Project

## Project Overview
Meal Guru is an Astro-based web application designed to reduce the mental strain of meal planning and preparation. The app helps people efficiently plan and prepare meals for the week through batch cooking, saving time and money while eliminating the frustration of wandering around supermarkets trying to find ingredients for recipes.

**Target User**: People who want to cook for multiple days at once (batch cooking) and streamline their grocery shopping and meal preparation process.

## Tech Stack
- **Framework**: Astro 5.12.8
- **Language**: TypeScript
- **Package Manager**: npm
- **Linter/Formatter**: Biome

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
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── package.json
└── tsconfig.json
```

## Notes for Claude
- This is a meal planning and batch cooking application
- Uses Astro framework with TypeScript
- Current state: Basic project structure with minimal components
- No testing framework currently configured
- Uses Biome for linting and formatting
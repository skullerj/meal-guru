-- Meal Guru v2 — Initial Schema

-- Unit enum
CREATE TYPE unit_type AS ENUM (
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit'
);

-- Ingredient category enum
CREATE TYPE category_type AS ENUM (
  'produce', 'tins', 'dairy', 'meat', 'pantry'
);

-- Ingredients master list
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  unit unit_type NOT NULL,
  category category_type,
  shelf BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Recipes
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Recipe ingredients junction
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE(recipe_id, ingredient_id)
);

-- Shops — one record per committed week (cooking history)
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Which recipes were committed to in each shop
CREATE TABLE shop_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(shop_id, recipe_id)
);

-- Indexes
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_shop_recipes_shop_id ON shop_recipes(shop_id);
CREATE INDEX idx_shop_recipes_recipe_id ON shop_recipes(recipe_id);
CREATE INDEX idx_shops_created_at ON shops(created_at DESC);

-- RLS (public access for now — single user app)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON ingredients FOR ALL USING (true);
CREATE POLICY "public_access" ON recipes FOR ALL USING (true);
CREATE POLICY "public_access" ON recipe_ingredients FOR ALL USING (true);
CREATE POLICY "public_access" ON shops FOR ALL USING (true);
CREATE POLICY "public_access" ON shop_recipes FOR ALL USING (true);

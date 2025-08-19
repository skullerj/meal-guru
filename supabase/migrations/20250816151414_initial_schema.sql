-- Meal Guru Database Schema
-- Initial migration with JSONB source column

-- Create unit enum type
CREATE TYPE unit_type AS ENUM ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'unit');

-- Create ingredients table with JSONB source
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  unit unit_type NOT NULL,
  source JSONB NOT NULL,
  shelf BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create recipe_ingredients junction table
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

-- Create recipe_instructions table
CREATE TABLE recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction_text TEXT NOT NULL,
  ingredient_ids TEXT[] DEFAULT '{}',
  UNIQUE(recipe_id, step_number)
);

-- Create indexes for better performance
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);

-- Enable Row Level Security (RLS) for future user authentication
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (remove these when adding authentication)
CREATE POLICY "Allow public access to ingredients" ON ingredients FOR ALL USING (true);
CREATE POLICY "Allow public access to recipes" ON recipes FOR ALL USING (true);
CREATE POLICY "Allow public access to recipe_ingredients" ON recipe_ingredients FOR ALL USING (true);
CREATE POLICY "Allow public access to recipe_instructions" ON recipe_instructions FOR ALL USING (true);

-- Create shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL
);

-- Create shop_ingredients junction table
CREATE TABLE shop_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  order_index INTEGER NOT NULL,
  UNIQUE(shop_id, ingredient_id)
);

-- Create shop_recipes junction table
CREATE TABLE shop_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(shop_id, recipe_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_shop_ingredients_shop_id ON shop_ingredients(shop_id);
CREATE INDEX idx_shop_ingredients_ingredient_id ON shop_ingredients(ingredient_id);
CREATE INDEX idx_shop_recipes_shop_id ON shop_recipes(shop_id);
CREATE INDEX idx_shop_recipes_recipe_id ON shop_recipes(recipe_id);
CREATE INDEX idx_shops_created_at ON shops(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (until authentication is implemented)
CREATE POLICY "Allow public read access to shops" ON shops
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to shops" ON shops
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to shop_ingredients" ON shop_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to shop_ingredients" ON shop_ingredients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to shop_recipes" ON shop_recipes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to shop_recipes" ON shop_recipes
  FOR INSERT WITH CHECK (true);

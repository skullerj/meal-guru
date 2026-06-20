-- Feature 13: Persisted shopping checks

CREATE TABLE shop_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  unit unit_type NOT NULL,
  category category_type,
  name TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (shop_id, ingredient_id)
);

CREATE INDEX idx_shop_ingredients_shop_id ON shop_ingredients(shop_id);

ALTER TABLE shop_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON shop_ingredients FOR ALL USING (true);

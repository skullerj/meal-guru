-- Feature 8: Recency Memory

CREATE TABLE shops (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE shop_recipes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id    UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  recipe_id  UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE (shop_id, recipe_id)
);

CREATE INDEX idx_shop_recipes_shop_id   ON shop_recipes(shop_id);
CREATE INDEX idx_shop_recipes_recipe_id ON shop_recipes(recipe_id);
CREATE INDEX idx_shops_created_at ON shops(created_at);

ALTER TABLE shops        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON shops        FOR ALL USING (true);
CREATE POLICY "public_access" ON shop_recipes FOR ALL USING (true);

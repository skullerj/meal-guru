-- Feature 11: Recipe step instructions with ingredient links

CREATE TABLE recipe_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (recipe_id, step_number)
);

CREATE TABLE step_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES recipe_steps(id) ON DELETE CASCADE,
  recipe_ingredient_id UUID NOT NULL REFERENCES recipe_ingredients(id) ON DELETE CASCADE,
  UNIQUE (step_id, recipe_ingredient_id)
);

CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX idx_step_ingredients_step_id ON step_ingredients(step_id);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON recipe_steps FOR ALL USING (true);
CREATE POLICY "public_access" ON step_ingredients FOR ALL USING (true);

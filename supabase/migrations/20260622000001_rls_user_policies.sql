-- Feature 17: Replace public_access RLS policies with user-scoped policies

-- Drop all public_access policies
DROP POLICY "public_access" ON recipes;
DROP POLICY "public_access" ON ingredients;
DROP POLICY "public_access" ON recipe_ingredients;
DROP POLICY "public_access" ON shops;
DROP POLICY "public_access" ON shop_recipes;
DROP POLICY "public_access" ON recipe_steps;
DROP POLICY "public_access" ON step_ingredients;
DROP POLICY "public_access" ON shop_ingredients;

-- Recipes: user can only access their own
CREATE POLICY "users_own_recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ingredients: user can only access their own
CREATE POLICY "users_own_ingredients" ON ingredients
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Shops: user can only access their own
CREATE POLICY "users_own_shops" ON shops
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recipe ingredients: access if user owns the parent recipe
CREATE POLICY "users_own_recipe_ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
    )
  );

-- Recipe steps: access if user owns the parent recipe
CREATE POLICY "users_own_recipe_steps" ON recipe_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes WHERE recipes.id = recipe_steps.recipe_id AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes WHERE recipes.id = recipe_steps.recipe_id AND recipes.user_id = auth.uid()
    )
  );

-- Step ingredients: access if user owns the parent recipe (via recipe_steps → recipes)
CREATE POLICY "users_own_step_ingredients" ON step_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipe_steps
      JOIN recipes ON recipes.id = recipe_steps.recipe_id
      WHERE recipe_steps.id = step_ingredients.step_id AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_steps
      JOIN recipes ON recipes.id = recipe_steps.recipe_id
      WHERE recipe_steps.id = step_ingredients.step_id AND recipes.user_id = auth.uid()
    )
  );

-- Shop recipes: access if user owns the parent shop
CREATE POLICY "users_own_shop_recipes" ON shop_recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shops WHERE shops.id = shop_recipes.shop_id AND shops.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops WHERE shops.id = shop_recipes.shop_id AND shops.user_id = auth.uid()
    )
  );

-- Shop ingredients: access if user owns the parent shop
CREATE POLICY "users_own_shop_ingredients" ON shop_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shops WHERE shops.id = shop_ingredients.shop_id AND shops.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops WHERE shops.id = shop_ingredients.shop_id AND shops.user_id = auth.uid()
    )
  );

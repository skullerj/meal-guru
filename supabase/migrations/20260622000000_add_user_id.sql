-- Feature 17: Add user_id to parent tables for multi-user support

-- Add nullable user_id columns with default auth.uid() so inserts auto-populate
-- Nullable initially for backfill; will be made NOT NULL after backfill
ALTER TABLE recipes ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE ingredients ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE shops ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Replace global unique constraints with per-user unique constraints
ALTER TABLE recipes DROP CONSTRAINT recipes_name_key;
ALTER TABLE recipes ADD CONSTRAINT recipes_user_name_key UNIQUE (user_id, name);

ALTER TABLE ingredients DROP CONSTRAINT ingredients_name_key;
ALTER TABLE ingredients ADD CONSTRAINT ingredients_user_name_key UNIQUE (user_id, name);

-- Index for fast lookups by user
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_shops_user_id ON shops(user_id);

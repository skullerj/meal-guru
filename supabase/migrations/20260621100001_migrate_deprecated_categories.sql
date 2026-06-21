-- Migrate existing data away from deprecated category values (tins, pantry)
-- Must run AFTER 20260621100000_expand_categories.sql has committed,
-- because PostgreSQL cannot use new enum values in the same transaction.

-- ingredients table
UPDATE ingredients SET category = 'canned' WHERE category = 'tins';
UPDATE ingredients SET category = 'grains' WHERE category = 'pantry';

-- shop_ingredients table
UPDATE shop_ingredients SET category = 'canned' WHERE category = 'tins';
UPDATE shop_ingredients SET category = 'grains' WHERE category = 'pantry';

-- NOTE: 'tins' and 'pantry' are deprecated. Do not use them for new data.
-- They remain in the enum only because PostgreSQL cannot drop enum values
-- without recreating the type.

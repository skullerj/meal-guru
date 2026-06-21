-- Expand category_type enum with finer-grained grocery categories
--
-- New values: bakery, canned, condiments, spices, grains, oils, frozen
--
-- The old values 'tins' and 'pantry' are DEPRECATED but remain in the enum
-- because PostgreSQL does not support removing enum values. All existing data
-- is migrated away from them in the next migration (20260621100001):
--   tins   -> canned
--   pantry -> grains  (safer default; spice-like items can be recategorized manually)

ALTER TYPE category_type ADD VALUE 'bakery';
ALTER TYPE category_type ADD VALUE 'canned';
ALTER TYPE category_type ADD VALUE 'condiments';
ALTER TYPE category_type ADD VALUE 'spices';
ALTER TYPE category_type ADD VALUE 'grains';
ALTER TYPE category_type ADD VALUE 'oils';
ALTER TYPE category_type ADD VALUE 'frozen';

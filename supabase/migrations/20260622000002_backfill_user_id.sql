-- Feature 17: Backfill user_id and make NOT NULL
-- Run this AFTER creating your user account.
-- Replace the UUID below with your actual user ID.
--

-- Placeholder UUID — replace before running:
-- UPDATE recipes SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;
-- UPDATE ingredients SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;
-- UPDATE shops SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;

-- After backfill, make user_id NOT NULL:
-- ALTER TABLE recipes ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE ingredients ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE shops ALTER COLUMN user_id SET NOT NULL;

-- NOTE: This migration is intentionally left as comments.
-- It will be applied manually via the Supabase SQL Editor
-- after the user creates their account and provides their UUID.
-- For local development, the E2E test setup handles user_id assignment.

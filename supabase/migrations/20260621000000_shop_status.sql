-- Feature 14: Shop cooking mode
ALTER TABLE shops ADD COLUMN status TEXT NOT NULL DEFAULT 'shopping';

-- Backfill existing rows
UPDATE shops SET status = 'shopping';

-- Feature 9: Persistent Weekly Shop

-- Add week_of and active columns to shops
ALTER TABLE shops ADD COLUMN week_of DATE NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE))::date;
ALTER TABLE shops ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing rows
UPDATE shops SET week_of = (date_trunc('week', created_at))::date, active = true;

-- Index for fast week lookups
CREATE INDEX idx_shops_week_active ON shops(week_of, active) WHERE active = true;

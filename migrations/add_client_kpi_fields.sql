-- Migration: Add KPI tracking fields to clients table
-- Date: 2025-10-20
-- Description: Add source and expected deal value fields for dashboard KPI tracking

-- Add source column (required field with default)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'Other';

-- Add comment to source column
COMMENT ON COLUMN clients.source IS 'Lead source: Organic, Referral, Paid Ads, or Other';

-- Add expected deal value column (optional)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS expecteddealvalue NUMERIC(15, 2);

-- Add comment to expecteddealvalue column
COMMENT ON COLUMN clients.expecteddealvalue IS 'Estimated potential revenue from this client';

-- Create index on source for better query performance (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);

-- Update existing clients to have 'Other' as source (for safety, even though DEFAULT handles new rows)
UPDATE clients
SET source = 'Other'
WHERE source IS NULL OR source = '';

-- Verification query (optional - run this to verify the changes)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'clients' AND column_name IN ('source', 'expecteddealvalue');

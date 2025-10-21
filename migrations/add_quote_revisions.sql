-- Add revision tracking to quotes system
-- This allows tracking quote version history and status changes

-- Add version column to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Create quote_revisions table to track all quote exports and changes
CREATE TABLE IF NOT EXISTS quote_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quoteid UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL,
  exported_by TEXT,
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changes JSONB,
  notes TEXT,

  -- Ensure version numbers are tracked correctly
  UNIQUE(quoteid, version)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_revisions_quoteid ON quote_revisions(quoteid);
CREATE INDEX IF NOT EXISTS idx_quote_revisions_exported_at ON quote_revisions(exported_at);

-- Add comment for documentation
COMMENT ON TABLE quote_revisions IS 'Tracks all quote exports and revisions with version history';
COMMENT ON COLUMN quotes.version IS 'Current version number of the quote (increments with each export)';

-- Migration: Add Template Reference to Quotes Table
-- Phase 1A: Database Setup for PDF Template Editor System
-- This adds the templateid column to link quotes with PDF templates

-- Add templateid column to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS templateid UUID;

-- Add foreign key constraint to pdf_templates table
ALTER TABLE quotes
ADD CONSTRAINT fk_quotes_templateid
FOREIGN KEY (templateid)
REFERENCES pdf_templates(id)
ON DELETE SET NULL;

-- Add index for template lookups
CREATE INDEX IF NOT EXISTS idx_quotes_templateid ON quotes(templateid);

-- Add comment for documentation
COMMENT ON COLUMN quotes.templateid IS 'Reference to the PDF template used for this quote';

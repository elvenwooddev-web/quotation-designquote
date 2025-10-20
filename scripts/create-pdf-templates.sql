-- Migration: Create PDF Templates Table
-- Phase 1A: Database Setup for PDF Template Editor System
-- This creates the pdf_templates table with lowercase naming convention

-- Drop table if exists (for clean re-runs during development)
DROP TABLE IF EXISTS pdf_templates CASCADE;

-- Create pdf_templates table
CREATE TABLE pdf_templates (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template metadata
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'custom',

    -- Template flags
    isdefault BOOLEAN DEFAULT false,
    ispublic BOOLEAN DEFAULT false,

    -- Template content (stores full template configuration as JSON)
    template_json JSONB NOT NULL,

    -- Preview image (base64 encoded thumbnail)
    thumbnail TEXT,

    -- Audit fields
    createdby UUID REFERENCES users(id) ON DELETE SET NULL,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Versioning
    version INTEGER DEFAULT 1,

    -- Constraints
    CONSTRAINT pdf_templates_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT pdf_templates_category_not_empty CHECK (LENGTH(TRIM(category)) > 0),
    CONSTRAINT pdf_templates_version_positive CHECK (version > 0)
);

-- Add indexes for common query patterns
CREATE INDEX idx_pdf_templates_isdefault ON pdf_templates(isdefault) WHERE isdefault = true;
CREATE INDEX idx_pdf_templates_category ON pdf_templates(category);
CREATE INDEX idx_pdf_templates_createdby ON pdf_templates(createdby);
CREATE INDEX idx_pdf_templates_createdat ON pdf_templates(createdat DESC);

-- Add composite index for filtering by category and public status
CREATE INDEX idx_pdf_templates_category_ispublic ON pdf_templates(category, ispublic);

-- Add trigger for automatic updatedat timestamp
CREATE TRIGGER set_updatedat_pdf_templates
    BEFORE UPDATE ON pdf_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

-- Add comments for documentation
COMMENT ON TABLE pdf_templates IS 'Stores PDF template configurations for the quote system';
COMMENT ON COLUMN pdf_templates.id IS 'Unique identifier for the template';
COMMENT ON COLUMN pdf_templates.name IS 'Human-readable name for the template';
COMMENT ON COLUMN pdf_templates.description IS 'Optional description of template purpose and usage';
COMMENT ON COLUMN pdf_templates.category IS 'Template category (e.g., invoice, quote, custom)';
COMMENT ON COLUMN pdf_templates.isdefault IS 'Flag indicating if this is the default template for its category';
COMMENT ON COLUMN pdf_templates.ispublic IS 'Flag indicating if template is available to all users';
COMMENT ON COLUMN pdf_templates.template_json IS 'Full template configuration stored as JSON';
COMMENT ON COLUMN pdf_templates.thumbnail IS 'Base64 encoded preview image of the template';
COMMENT ON COLUMN pdf_templates.createdby IS 'User who created this template';
COMMENT ON COLUMN pdf_templates.createdat IS 'Timestamp when template was created';
COMMENT ON COLUMN pdf_templates.updatedat IS 'Timestamp when template was last updated';
COMMENT ON COLUMN pdf_templates.version IS 'Template version number for tracking changes';

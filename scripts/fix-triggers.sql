-- Fix Database Triggers for Lowercase Column Names
-- This script drops and recreates triggers to work with lowercase column names

-- Drop the old function with CASCADE to automatically drop all dependent triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Create new function with lowercase column name
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updatedat column
CREATE TRIGGER set_updatedat_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_permissions
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_quotes
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_clients
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_quote_items
    BEFORE UPDATE ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_policy_clauses
    BEFORE UPDATE ON policy_clauses
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_company_settings
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_terms_conditions
    BEFORE UPDATE ON terms_conditions
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

CREATE TRIGGER set_updatedat_pdf_templates
    BEFORE UPDATE ON pdf_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updatedat_column();

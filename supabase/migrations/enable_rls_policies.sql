-- ============================================================================
-- Row Level Security (RLS) Policies for DesignQuote
-- ============================================================================
-- This migration enables RLS and creates comprehensive policies for all tables
-- Based on role-based permissions system

-- ============================================================================
-- STEP 1: Add missing columns
-- ============================================================================

-- Add createdby column to quotes table to track quote ownership
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS createdby UUID REFERENCES users(id);

-- Add createdby column to clients table to track client ownership
ALTER TABLE clients ADD COLUMN IF NOT EXISTS createdby UUID REFERENCES users(id);

-- ============================================================================
-- STEP 2: Create helper functions for RLS
-- ============================================================================

-- Function to get current user's ID from auth
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS UUID AS $$
  SELECT id::uuid FROM auth.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION current_user_profile() RETURNS SETOF users AS $$
  SELECT * FROM users WHERE authuserid = auth.uid()::text
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.roleid = r.id
    WHERE u.authuserid = auth.uid()::text
    AND r.name = 'Admin'
    AND u.isactive = true
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if current user is sales head
CREATE OR REPLACE FUNCTION is_sales_head() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.roleid = r.id
    WHERE u.authuserid = auth.uid()::text
    AND r.name IN ('Admin', 'Sales Head')
    AND u.isactive = true
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check user's resource permission
CREATE OR REPLACE FUNCTION has_permission(
  resource_name text,
  permission_type text  -- 'cancreate', 'canread', 'canedit', 'candelete', 'canapprove', 'canexport'
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN role_permissions rp ON u.roleid = rp.roleid
    WHERE u.authuserid = auth.uid()::text
    AND u.isactive = true
    AND rp.resource = resource_name
    AND (
      (permission_type = 'cancreate' AND rp.cancreate = true) OR
      (permission_type = 'canread' AND rp.canread = true) OR
      (permission_type = 'canedit' AND rp.canedit = true) OR
      (permission_type = 'candelete' AND rp.candelete = true) OR
      (permission_type = 'canapprove' AND rp.canapprove = true) OR
      (permission_type = 'canexport' AND rp.canexport = true)
    )
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get current user's UUID
CREATE OR REPLACE FUNCTION current_user_uuid() RETURNS UUID AS $$
  SELECT id FROM users WHERE authuserid = auth.uid()::text
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Enable RLS on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (authuserid = auth.uid()::text);

-- Admins and Sales Heads can read all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (is_sales_head());

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (authuserid = auth.uid()::text)
  WITH CHECK (authuserid = auth.uid()::text);

-- Only admins can create users
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can delete users
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- STEP 5: ROLES & PERMISSIONS POLICIES
-- ============================================================================

-- Everyone can read roles (needed for signup/profile display)
CREATE POLICY "roles_select_all" ON roles
  FOR SELECT
  USING (true);

-- Only admins can modify roles
CREATE POLICY "roles_insert_admin" ON roles
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "roles_update_admin" ON roles
  FOR UPDATE
  USING (is_admin() AND isprotected = false)
  WITH CHECK (is_admin());

CREATE POLICY "roles_delete_admin" ON roles
  FOR DELETE
  USING (is_admin() AND isprotected = false);

-- Everyone can read their own role permissions
CREATE POLICY "role_permissions_select_own" ON role_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE authuserid = auth.uid()::text
      AND roleid = role_permissions.roleid
    ) OR is_admin()
  );

-- Only admins can modify role permissions
CREATE POLICY "role_permissions_insert_admin" ON role_permissions
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "role_permissions_update_admin" ON role_permissions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "role_permissions_delete_admin" ON role_permissions
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- STEP 6: CLIENTS TABLE POLICIES
-- ============================================================================

-- Users with 'canread' on clients resource can read all clients
CREATE POLICY "clients_select_permission" ON clients
  FOR SELECT
  USING (has_permission('clients', 'canread'));

-- Users with 'cancreate' on clients can create clients
CREATE POLICY "clients_insert_permission" ON clients
  FOR INSERT
  WITH CHECK (has_permission('clients', 'cancreate'));

-- Users with 'canedit' can update clients they created OR admins can update all
CREATE POLICY "clients_update_permission" ON clients
  FOR UPDATE
  USING (
    has_permission('clients', 'canedit') AND
    (createdby = current_user_uuid() OR is_admin())
  )
  WITH CHECK (
    has_permission('clients', 'canedit') AND
    (createdby = current_user_uuid() OR is_admin())
  );

-- Only admins and users with 'candelete' can delete clients
CREATE POLICY "clients_delete_permission" ON clients
  FOR DELETE
  USING (has_permission('clients', 'candelete') AND is_admin());

-- ============================================================================
-- STEP 7: CLIENT REVISIONS POLICIES
-- ============================================================================

-- Anyone with clients read permission can read revisions
CREATE POLICY "client_revisions_select_permission" ON client_revisions
  FOR SELECT
  USING (has_permission('clients', 'canread'));

-- System creates revisions automatically
CREATE POLICY "client_revisions_insert_system" ON client_revisions
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 8: PRODUCTS & CATEGORIES POLICIES
-- ============================================================================

-- Users with 'canread' on products can read products
CREATE POLICY "products_select_permission" ON products
  FOR SELECT
  USING (has_permission('products', 'canread'));

-- Users with 'cancreate' on products can create products
CREATE POLICY "products_insert_permission" ON products
  FOR INSERT
  WITH CHECK (has_permission('products', 'cancreate'));

-- Users with 'canedit' on products can update products
CREATE POLICY "products_update_permission" ON products
  FOR UPDATE
  USING (has_permission('products', 'canedit'))
  WITH CHECK (has_permission('products', 'canedit'));

-- Only admins can delete products
CREATE POLICY "products_delete_permission" ON products
  FOR DELETE
  USING (has_permission('products', 'candelete') AND is_admin());

-- Categories follow same pattern as products
CREATE POLICY "categories_select_permission" ON categories
  FOR SELECT
  USING (has_permission('categories', 'canread'));

CREATE POLICY "categories_insert_permission" ON categories
  FOR INSERT
  WITH CHECK (has_permission('categories', 'cancreate'));

CREATE POLICY "categories_update_permission" ON categories
  FOR UPDATE
  USING (has_permission('categories', 'canedit'))
  WITH CHECK (has_permission('categories', 'canedit'));

CREATE POLICY "categories_delete_permission" ON categories
  FOR DELETE
  USING (has_permission('categories', 'candelete') AND is_admin());

-- ============================================================================
-- STEP 9: QUOTES TABLE POLICIES
-- ============================================================================

-- Users with 'canread' can read quotes they created OR admins/sales heads can read all
CREATE POLICY "quotes_select_permission" ON quotes
  FOR SELECT
  USING (
    has_permission('quotes', 'canread') AND
    (createdby = current_user_uuid() OR is_sales_head())
  );

-- Users with 'cancreate' can create quotes
CREATE POLICY "quotes_insert_permission" ON quotes
  FOR INSERT
  WITH CHECK (has_permission('quotes', 'cancreate'));

-- Users with 'canedit' can update their own quotes OR sales heads can update all
-- UNLESS quote is already approved (then only admin can edit)
CREATE POLICY "quotes_update_permission" ON quotes
  FOR UPDATE
  USING (
    has_permission('quotes', 'canedit') AND
    (
      (createdby = current_user_uuid() AND (isapproved = false OR is_admin())) OR
      (is_sales_head() AND (isapproved = false OR is_admin()))
    )
  )
  WITH CHECK (
    has_permission('quotes', 'canedit') AND
    (
      (createdby = current_user_uuid() AND (isapproved = false OR is_admin())) OR
      (is_sales_head() AND (isapproved = false OR is_admin()))
    )
  );

-- Only quote creator or admin can delete (and only if not approved)
CREATE POLICY "quotes_delete_permission" ON quotes
  FOR DELETE
  USING (
    has_permission('quotes', 'candelete') AND
    (createdby = current_user_uuid() OR is_admin()) AND
    (isapproved = false OR is_admin())
  );

-- ============================================================================
-- STEP 10: QUOTE ITEMS POLICIES
-- ============================================================================

-- Users can read quote items if they can read the parent quote
CREATE POLICY "quote_items_select_permission" ON quote_items
  FOR SELECT
  USING (
    has_permission('quotes', 'canread') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
    )
  );

-- Users can insert quote items if they can create quotes
CREATE POLICY "quote_items_insert_permission" ON quote_items
  FOR INSERT
  WITH CHECK (
    has_permission('quotes', 'cancreate') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
    )
  );

-- Users can update quote items if they can edit the parent quote
CREATE POLICY "quote_items_update_permission" ON quote_items
  FOR UPDATE
  USING (
    has_permission('quotes', 'canedit') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
      AND (quotes.isapproved = false OR is_admin())
    )
  )
  WITH CHECK (
    has_permission('quotes', 'canedit') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
      AND (quotes.isapproved = false OR is_admin())
    )
  );

-- Users can delete quote items if they can edit the parent quote
CREATE POLICY "quote_items_delete_permission" ON quote_items
  FOR DELETE
  USING (
    has_permission('quotes', 'candelete') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_admin())
      AND (quotes.isapproved = false OR is_admin())
    )
  );

-- ============================================================================
-- STEP 11: QUOTE REVISIONS & POLICY CLAUSES
-- ============================================================================

-- Quote revisions follow parent quote permissions
CREATE POLICY "quote_revisions_select_permission" ON quote_revisions
  FOR SELECT
  USING (
    has_permission('quotes', 'canread') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_revisions.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
    )
  );

-- System creates revisions automatically
CREATE POLICY "quote_revisions_insert_system" ON quote_revisions
  FOR INSERT
  WITH CHECK (true);

-- Policy clauses follow parent quote permissions
CREATE POLICY "policy_clauses_select_permission" ON policy_clauses
  FOR SELECT
  USING (
    has_permission('quotes', 'canread') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = policy_clauses.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
    )
  );

CREATE POLICY "policy_clauses_insert_permission" ON policy_clauses
  FOR INSERT
  WITH CHECK (
    has_permission('quotes', 'cancreate') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = policy_clauses.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
    )
  );

CREATE POLICY "policy_clauses_update_permission" ON policy_clauses
  FOR UPDATE
  USING (
    has_permission('quotes', 'canedit') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = policy_clauses.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
      AND (quotes.isapproved = false OR is_admin())
    )
  )
  WITH CHECK (
    has_permission('quotes', 'canedit') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = policy_clauses.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_sales_head())
      AND (quotes.isapproved = false OR is_admin())
    )
  );

CREATE POLICY "policy_clauses_delete_permission" ON policy_clauses
  FOR DELETE
  USING (
    has_permission('quotes', 'candelete') AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = policy_clauses.quoteid
      AND (quotes.createdby = current_user_uuid() OR is_admin())
      AND (quotes.isapproved = false OR is_admin())
    )
  );

-- ============================================================================
-- STEP 12: PDF TEMPLATES POLICIES
-- ============================================================================

-- Everyone can read public templates, or their own templates
CREATE POLICY "pdf_templates_select" ON pdf_templates
  FOR SELECT
  USING (ispublic = true OR createdby = current_user_uuid() OR is_admin());

-- Users can create templates
CREATE POLICY "pdf_templates_insert" ON pdf_templates
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own templates, admins can update all
CREATE POLICY "pdf_templates_update" ON pdf_templates
  FOR UPDATE
  USING (createdby = current_user_uuid() OR is_admin())
  WITH CHECK (createdby = current_user_uuid() OR is_admin());

-- Users can delete their own templates, admins can delete all
CREATE POLICY "pdf_templates_delete" ON pdf_templates
  FOR DELETE
  USING (createdby = current_user_uuid() OR is_admin());

-- ============================================================================
-- STEP 13: SETTINGS TABLES POLICIES
-- ============================================================================

-- Everyone can read company settings
CREATE POLICY "company_settings_select_all" ON company_settings
  FOR SELECT
  USING (true);

-- Only admins can modify company settings
CREATE POLICY "company_settings_update_admin" ON company_settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Everyone can read terms & conditions
CREATE POLICY "terms_conditions_select_all" ON terms_conditions
  FOR SELECT
  USING (true);

-- Only admins can modify terms & conditions
CREATE POLICY "terms_conditions_update_admin" ON terms_conditions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Everyone can read global settings
CREATE POLICY "settings_select_all" ON settings
  FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "settings_insert_admin" ON settings
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "settings_update_admin" ON settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "settings_delete_admin" ON settings
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- STEP 14: Grant necessary permissions to authenticated users
-- ============================================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select on all tables to authenticated users (RLS will filter)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant insert, update, delete on specific tables (RLS will control access)
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON clients TO authenticated;
GRANT INSERT ON client_revisions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON quote_items TO authenticated;
GRANT INSERT ON quote_revisions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON policy_clauses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON pdf_templates TO authenticated;
GRANT UPDATE ON company_settings TO authenticated;
GRANT UPDATE ON terms_conditions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON settings TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for testing)
-- ============================================================================

/*
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid-here"}';

-- Should see only your own quotes
SELECT * FROM quotes;

-- Should see all products if you have permission
SELECT * FROM products;

-- Should see your own profile
SELECT * FROM users WHERE authuserid = auth.uid()::text;
*/

-- ============================================================================
-- END OF RLS MIGRATION
-- ============================================================================

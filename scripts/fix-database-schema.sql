-- Migration: Fix Column Names to Lowercase Without Underscores
-- This migration renames all camelCase columns to lowercase to match the application expectations

-- 1. Fix quotes table
ALTER TABLE quotes RENAME COLUMN "quoteNumber" TO quotenumber;
ALTER TABLE quotes RENAME COLUMN "clientId" TO clientid;
ALTER TABLE quotes RENAME COLUMN "discountMode" TO discountmode;
ALTER TABLE quotes RENAME COLUMN "overallDiscount" TO overalldiscount;
ALTER TABLE quotes RENAME COLUMN "taxRate" TO taxrate;
ALTER TABLE quotes RENAME COLUMN "grandTotal" TO grandtotal;

-- 2. Fix products table
ALTER TABLE products RENAME COLUMN "baseRate" TO baserate;

-- 3. Fix quote_items table
ALTER TABLE quote_items RENAME COLUMN "quoteId" TO quoteid;
ALTER TABLE quote_items RENAME COLUMN "productId" TO productid;
ALTER TABLE quote_items RENAME COLUMN "lineTotal" TO linetotal;

-- 4. Fix policy_clauses table
ALTER TABLE policy_clauses RENAME COLUMN "quoteId" TO quoteid;
ALTER TABLE policy_clauses RENAME COLUMN "isActive" TO isactive;

-- 5. Fix users table - Add missing authuserid column
ALTER TABLE users ADD COLUMN IF NOT EXISTS authuserid TEXT;

-- 6. Fix role_permissions table
ALTER TABLE role_permissions RENAME COLUMN "canCreate" TO cancreate;
ALTER TABLE role_permissions RENAME COLUMN "canEdit" TO canedit;
ALTER TABLE role_permissions RENAME COLUMN "canDelete" TO candelete;
ALTER TABLE role_permissions RENAME COLUMN "canApprove" TO canapprove;
ALTER TABLE role_permissions RENAME COLUMN "canExport" TO canexport;

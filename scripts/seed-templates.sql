-- Seed Script: Pre-built PDF Templates
-- Phase 3B: Database Seeding
--
-- This script populates the pdf_templates table with 6 professional pre-built templates.
-- These templates provide users with ready-to-use starting points for their quote PDFs.
--
-- CRITICAL: Uses lowercase column naming convention (isdefault, ispublic, template_json, etc.)
-- See CLAUDE.md for database naming conventions.
--
-- Usage:
--   Run this script in Supabase SQL Editor or via psql:
--   psql -h <host> -U <user> -d <database> -f scripts/seed-templates.sql

-- Clear existing default templates (optional - comment out if you want to preserve existing data)
-- DELETE FROM pdf_templates WHERE ispublic = true AND createdby IS NULL;

-- Template 1: Modern Business
-- Clean and professional template ideal for corporate quotes and invoices
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Modern Business',
  'Clean and professional template ideal for corporate quotes and invoices',
  'business',
  true,  -- This is the default template
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":40,"bottom":40,"left":40,"right":40}},"theme":{"colors":{"primary":"#2563eb","secondary":"#64748b","textPrimary":"#1e293b","textSecondary":"#64748b","background":"#ffffff"},"fonts":{"heading":{"family":"Inter","size":24,"weight":700},"body":{"family":"Inter","size":11,"weight":400},"small":{"family":"Inter","size":9,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":true,"logoPosition":"left","showCompanyInfo":true,"showQuoteNumber":true,"showDate":true}},{"id":"divider-1","type":"divider","order":2,"position":"auto","size":{"width":"auto","height":2},"properties":{"color":"#e2e8f0","style":"solid"}},{"id":"client-info-1","type":"textBlock","order":3,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Client Information","showLabel":true,"fields":["name","email","phone","address"]}},{"id":"spacer-1","type":"spacer","order":4,"position":"auto","size":{"width":"auto","height":20},"properties":{}},{"id":"items-table-1","type":"table","order":5,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":true,"columns":["description","quantity","rate","discount","total"],"alternateRowColors":true}},{"id":"totals-1","type":"textBlock","order":6,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":true,"showTax":true,"showGrandTotal":true}},{"id":"spacer-2","type":"spacer","order":7,"position":"auto","size":{"width":"auto","height":30},"properties":{}},{"id":"policies-1","type":"textBlock","order":8,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Terms & Conditions","showLabel":true,"fontSize":9}},{"id":"signature-1","type":"signature","order":9,"position":"auto","size":{"width":"auto","height":60},"properties":{"showSignatureLine":true,"showDate":true,"label":"Authorized Signature"}}]}'::jsonb,
  NULL,  -- thumbnail will be generated later
  NULL,  -- system template (no user owner)
  NOW(),
  NOW(),
  1
);

-- Template 2: Minimalist
-- Simple and elegant design with focus on content and clarity
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Minimalist',
  'Simple and elegant design with focus on content and clarity',
  'minimalist',
  false,
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":60,"bottom":60,"left":60,"right":60}},"theme":{"colors":{"primary":"#000000","secondary":"#6b7280","textPrimary":"#111827","textSecondary":"#6b7280","background":"#ffffff"},"fonts":{"heading":{"family":"Inter","size":28,"weight":300},"body":{"family":"Inter","size":10,"weight":400},"small":{"family":"Inter","size":8,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":false,"showCompanyInfo":true,"showQuoteNumber":true,"showDate":true,"alignment":"center"}},{"id":"spacer-1","type":"spacer","order":2,"position":"auto","size":{"width":"auto","height":40},"properties":{}},{"id":"client-info-1","type":"textBlock","order":3,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"","showLabel":false,"fields":["name","address"],"alignment":"left"}},{"id":"spacer-2","type":"spacer","order":4,"position":"auto","size":{"width":"auto","height":30},"properties":{}},{"id":"items-table-1","type":"table","order":5,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":false,"columns":["description","quantity","rate","total"],"alternateRowColors":false}},{"id":"divider-1","type":"divider","order":6,"position":"auto","size":{"width":"auto","height":1},"properties":{"color":"#e5e7eb","style":"solid"}},{"id":"totals-1","type":"textBlock","order":7,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":false,"showTax":true,"showGrandTotal":true}}]}'::jsonb,
  NULL,
  NULL,
  NOW(),
  NOW(),
  1
);

-- Template 3: Bold
-- Eye-catching template with strong colors and modern typography
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Bold',
  'Eye-catching template with strong colors and modern typography',
  'bold',
  false,
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":30,"bottom":30,"left":30,"right":30}},"theme":{"colors":{"primary":"#dc2626","secondary":"#f59e0b","textPrimary":"#1f2937","textSecondary":"#4b5563","background":"#ffffff"},"fonts":{"heading":{"family":"Inter","size":32,"weight":900},"body":{"family":"Inter","size":11,"weight":500},"small":{"family":"Inter","size":9,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":true,"logoPosition":"center","showCompanyInfo":true,"showQuoteNumber":true,"showDate":true,"backgroundColor":"#dc2626","textColor":"#ffffff","padding":20}},{"id":"client-info-1","type":"textBlock","order":2,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"PREPARED FOR","showLabel":true,"fields":["name","email","phone"],"backgroundColor":"#fef2f2","padding":15}},{"id":"spacer-1","type":"spacer","order":3,"position":"auto","size":{"width":"auto","height":20},"properties":{}},{"id":"items-table-1","type":"table","order":4,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":true,"columns":["description","quantity","rate","discount","total"],"headerBackgroundColor":"#1f2937","headerTextColor":"#ffffff","borderColor":"#e5e7eb"}},{"id":"totals-1","type":"textBlock","order":5,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":true,"showTax":true,"showGrandTotal":true,"backgroundColor":"#f3f4f6","padding":15}},{"id":"policies-1","type":"textBlock","order":6,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Important Terms","showLabel":true,"fontSize":9}}]}'::jsonb,
  NULL,
  NULL,
  NOW(),
  NOW(),
  1
);

-- Template 4: Elegant
-- Sophisticated template with refined aesthetics for premium brands
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Elegant',
  'Sophisticated template with refined aesthetics for premium brands',
  'elegant',
  false,
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":50,"bottom":50,"left":50,"right":50}},"theme":{"colors":{"primary":"#713f12","secondary":"#ca8a04","textPrimary":"#292524","textSecondary":"#78716c","background":"#fafaf9"},"fonts":{"heading":{"family":"Inter","size":26,"weight":600},"body":{"family":"Inter","size":10,"weight":400},"small":{"family":"Inter","size":8,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":true,"logoPosition":"center","showCompanyInfo":true,"showQuoteNumber":true,"showDate":true}},{"id":"divider-1","type":"divider","order":2,"position":"auto","size":{"width":"auto","height":2},"properties":{"color":"#ca8a04","style":"solid"}},{"id":"spacer-1","type":"spacer","order":3,"position":"auto","size":{"width":"auto","height":30},"properties":{}},{"id":"client-info-1","type":"textBlock","order":4,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Prepared For","showLabel":true,"fields":["name","address","email","phone"]}},{"id":"spacer-2","type":"spacer","order":5,"position":"auto","size":{"width":"auto","height":25},"properties":{}},{"id":"items-table-1","type":"table","order":6,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":true,"columns":["description","quantity","rate","total"],"alternateRowColors":true,"alternateColor":"#f5f5f4"}},{"id":"divider-2","type":"divider","order":7,"position":"auto","size":{"width":"auto","height":1},"properties":{"color":"#e7e5e4","style":"solid"}},{"id":"totals-1","type":"textBlock","order":8,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":true,"showTax":true,"showGrandTotal":true}},{"id":"spacer-3","type":"spacer","order":9,"position":"auto","size":{"width":"auto","height":40},"properties":{}},{"id":"policies-1","type":"textBlock","order":10,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Terms and Conditions","showLabel":true,"fontSize":8}},{"id":"signature-1","type":"signature","order":11,"position":"auto","size":{"width":"auto","height":50},"properties":{"showSignatureLine":true,"showDate":true,"label":"Authorized By"}}]}'::jsonb,
  NULL,
  NULL,
  NOW(),
  NOW(),
  1
);

-- Template 5: Modern Creative
-- Contemporary design with creative flair for design-focused businesses
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Modern Creative',
  'Contemporary design with creative flair for design-focused businesses',
  'creative',
  false,
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":35,"bottom":35,"left":35,"right":35}},"theme":{"colors":{"primary":"#7c3aed","secondary":"#06b6d4","textPrimary":"#18181b","textSecondary":"#71717a","background":"#ffffff"},"fonts":{"heading":{"family":"Inter","size":28,"weight":700},"body":{"family":"Inter","size":10,"weight":400},"small":{"family":"Inter","size":8,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":true,"logoPosition":"left","showCompanyInfo":true,"showQuoteNumber":true,"showDate":true,"accentColor":"#7c3aed"}},{"id":"spacer-1","type":"spacer","order":2,"position":"auto","size":{"width":"auto","height":20},"properties":{}},{"id":"client-info-1","type":"textBlock","order":3,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Quote For","showLabel":true,"fields":["name","email","phone"],"borderLeft":true,"borderColor":"#06b6d4","borderWidth":4,"padding":10}},{"id":"spacer-2","type":"spacer","order":4,"position":"auto","size":{"width":"auto","height":25},"properties":{}},{"id":"items-table-1","type":"table","order":5,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":false,"columns":["description","quantity","rate","discount","total"],"headerBackgroundColor":"#f4f4f5","borderBottom":true,"borderColor":"#e4e4e7"}},{"id":"totals-1","type":"textBlock","order":6,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":true,"showTax":true,"showGrandTotal":true,"accentColor":"#7c3aed"}},{"id":"spacer-3","type":"spacer","order":7,"position":"auto","size":{"width":"auto","height":30},"properties":{}},{"id":"policies-1","type":"textBlock","order":8,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Additional Information","showLabel":true,"fontSize":9}}]}'::jsonb,
  NULL,
  NULL,
  NOW(),
  NOW(),
  1
);

-- Template 6: Classic Modern
-- Timeless design combining classic elegance with modern simplicity
INSERT INTO pdf_templates (
  id,
  name,
  description,
  category,
  isdefault,
  ispublic,
  template_json,
  thumbnail,
  createdby,
  createdat,
  updatedat,
  version
) VALUES (
  gen_random_uuid(),
  'Classic Modern',
  'Timeless design combining classic elegance with modern simplicity',
  'modern',
  false,
  true,
  '{"metadata":{"version":"1.0","pageSize":"A4","orientation":"portrait","margins":{"top":45,"bottom":45,"left":45,"right":45}},"theme":{"colors":{"primary":"#0f172a","secondary":"#475569","textPrimary":"#0f172a","textSecondary":"#64748b","background":"#ffffff"},"fonts":{"heading":{"family":"Inter","size":24,"weight":600},"body":{"family":"Inter","size":10,"weight":400},"small":{"family":"Inter","size":8,"weight":400}}},"elements":[{"id":"header-1","type":"header","order":1,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showLogo":true,"logoPosition":"left","showCompanyInfo":true,"showQuoteNumber":true,"showDate":true}},{"id":"divider-1","type":"divider","order":2,"position":"auto","size":{"width":"auto","height":2},"properties":{"color":"#0f172a","style":"solid"}},{"id":"spacer-1","type":"spacer","order":3,"position":"auto","size":{"width":"auto","height":25},"properties":{}},{"id":"client-info-1","type":"textBlock","order":4,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Client Details","showLabel":true,"fields":["name","address","email","phone"]}},{"id":"spacer-2","type":"spacer","order":5,"position":"auto","size":{"width":"auto","height":20},"properties":{}},{"id":"items-table-1","type":"table","order":6,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"showHeader":true,"showBorders":true,"columns":["description","quantity","rate","discount","total"],"alternateRowColors":true,"alternateColor":"#f8fafc","borderColor":"#cbd5e1"}},{"id":"divider-2","type":"divider","order":7,"position":"auto","size":{"width":"auto","height":2},"properties":{"color":"#0f172a","style":"solid"}},{"id":"totals-1","type":"textBlock","order":8,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"align":"right","showSubtotal":true,"showDiscount":true,"showTax":true,"showGrandTotal":true}},{"id":"spacer-3","type":"spacer","order":9,"position":"auto","size":{"width":"auto","height":35},"properties":{}},{"id":"policies-1","type":"textBlock","order":10,"position":"auto","size":{"width":"auto","height":"auto"},"properties":{"label":"Terms & Conditions","showLabel":true,"fontSize":8}},{"id":"signature-1","type":"signature","order":11,"position":"auto","size":{"width":"auto","height":60},"properties":{"showSignatureLine":true,"showDate":true,"label":"Authorized Signature"}}]}'::jsonb,
  NULL,
  NULL,
  NOW(),
  NOW(),
  1
);

-- Verify the seeding results
SELECT
  name,
  category,
  isdefault,
  ispublic,
  version,
  createdat
FROM pdf_templates
WHERE ispublic = true AND createdby IS NULL
ORDER BY isdefault DESC, name;

-- Show total count
SELECT COUNT(*) as template_count
FROM pdf_templates
WHERE ispublic = true AND createdby IS NULL;

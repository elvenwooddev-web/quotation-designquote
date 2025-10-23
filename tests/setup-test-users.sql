-- Test Users Setup Script for Playwright Tests
-- Run this in your Supabase SQL Editor before running tests

-- NOTE: This script assumes you're using Supabase Auth
-- You must first create the auth users in Supabase Auth dashboard
-- Then link them to user profiles here

-- =============================================================================
-- STEP 1: Create Auth Users in Supabase Dashboard
-- =============================================================================
-- Go to: Authentication → Users → Add User
-- Create 5 users with these emails (password: Test@123456 for all):
--   1. admin@test.designquote.com
--   2. saleshead@test.designquote.com
--   3. executive@test.designquote.com
--   4. designer@test.designquote.com
--   5. client@test.designquote.com

-- =============================================================================
-- STEP 2: Get Auth User IDs
-- =============================================================================
-- Run this query to get the UUIDs you need for Step 3:
-- SELECT id, email FROM auth.users WHERE email LIKE '%test.designquote.com' ORDER BY email;

-- =============================================================================
-- STEP 3: Get Role IDs
-- =============================================================================
-- Run this query to get role IDs for the profiles:
-- SELECT id, name FROM public.roles ORDER BY name;

-- =============================================================================
-- STEP 4: Create User Profiles
-- =============================================================================
-- Replace the UUIDs below with actual values from Steps 2 and 3

-- Admin Test User
INSERT INTO public.users (id, authuserid, name, email, role, roleid, isactive, createdat, updatedat)
VALUES (
  gen_random_uuid(),
  'REPLACE_WITH_AUTH_USER_ID_FOR_ADMIN',
  'Test Admin',
  'admin@test.designquote.com',
  'Admin',
  'REPLACE_WITH_ADMIN_ROLE_ID',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sales Head Test User
INSERT INTO public.users (id, authuserid, name, email, role, roleid, isactive, createdat, updatedat)
VALUES (
  gen_random_uuid(),
  'REPLACE_WITH_AUTH_USER_ID_FOR_SALES_HEAD',
  'Test Sales Head',
  'saleshead@test.designquote.com',
  'Sales Head',
  'REPLACE_WITH_SALES_HEAD_ROLE_ID',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sales Executive Test User
INSERT INTO public.users (id, authuserid, name, email, role, roleid, isactive, createdat, updatedat)
VALUES (
  gen_random_uuid(),
  'REPLACE_WITH_AUTH_USER_ID_FOR_EXECUTIVE',
  'Test Sales Executive',
  'executive@test.designquote.com',
  'Sales Executive',
  'REPLACE_WITH_SALES_EXECUTIVE_ROLE_ID',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Designer Test User
INSERT INTO public.users (id, authuserid, name, email, role, roleid, isactive, createdat, updatedat)
VALUES (
  gen_random_uuid(),
  'REPLACE_WITH_AUTH_USER_ID_FOR_DESIGNER',
  'Test Designer',
  'designer@test.designquote.com',
  'Designer',
  'REPLACE_WITH_DESIGNER_ROLE_ID',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Client Test User
INSERT INTO public.users (id, authuserid, name, email, role, roleid, isactive, createdat, updatedat)
VALUES (
  gen_random_uuid(),
  'REPLACE_WITH_AUTH_USER_ID_FOR_CLIENT',
  'Test Client',
  'client@test.designquote.com',
  'Client',
  'REPLACE_WITH_CLIENT_ROLE_ID',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- STEP 5: Verify Test Users Created
-- =============================================================================
SELECT id, name, email, role, roleid, isactive FROM public.users WHERE email LIKE '%test.designquote.com' ORDER BY email;

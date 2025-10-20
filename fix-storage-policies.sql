-- Fix Storage Bucket Policies for product-images
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tmrjuedenuidfhbnocya/sql

-- First, check if the bucket exists
SELECT * FROM storage.buckets WHERE name = 'product-images';

-- If the bucket is not public, make it public
UPDATE storage.buckets
SET public = true
WHERE name = 'product-images';

-- Drop existing policies if any (to start fresh)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read" ON storage.objects;

-- Create policy to allow anyone to read (SELECT)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Create policy to allow anyone to upload (INSERT)
-- Note: For production, you should restrict this to authenticated users
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Create policy to allow anyone to update
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Create policy to allow anyone to delete
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%product-images%'
ORDER BY policyname;

-- Alternative: If you want to restrict to authenticated users only:
/*
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
*/
# Supabase Storage Setup Instructions

## Fix Row-Level Security Policy Error ⚠️

**Current Error:** `new row violates row-level security policy`

The bucket exists but needs proper RLS policies configured.

## Quick Fix - Run SQL Script

1. **Go to Supabase SQL Editor**
   - Open: https://supabase.com/dashboard/project/tmrjuedenuidfhbnocya/sql

2. **Run the Fix Script**
   - Open the file: `fix-storage-policies.sql`
   - Copy all the SQL code
   - Paste into the SQL Editor
   - Click "Run"

This will set up the correct policies to allow uploads.

---

## Manual Steps (Alternative)

If you prefer to do it manually:

### Step 1: Make Bucket Public

1. Go to: https://supabase.com/dashboard/project/tmrjuedenuidfhbnocya/storage/buckets
2. Click on `product-images` bucket
3. Click "Settings" or the gear icon
4. Check "Public bucket" option
5. Save

### Step 2: Set Storage Policies

Go to SQL Editor and run:

```sql
-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'product-images';

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow public upload access
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow public update access
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow public delete access
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
```

**Note:** For production, you should restrict uploads to authenticated users only.
See `fix-storage-policies.sql` for production-ready policies.

### Alternative: Use Manual Image URLs

If you don't want to set up storage, you can:
1. Host images elsewhere (Cloudinary, AWS S3, etc.)
2. Enter image URLs directly in the product form
3. Skip image upload and leave it empty

### Verify Setup

After creating the bucket, the file upload component should work without errors.

## Current Bucket Name Used in Code:
- `product-images` (in `components/ui/file-upload.tsx`)

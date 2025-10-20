# PDF Template Seeding Guide

This document explains how to seed the database with pre-built PDF templates for the Intelli-Quoter PDF Template Editor system.

## Overview

The seeding system populates the `pdf_templates` table with 6 professional, ready-to-use templates:

1. **Modern Business** (Default) - Clean, professional design for corporate quotes
2. **Minimalist** - Simple, elegant design with maximum whitespace
3. **Bold** - Eye-catching design with strong colors and typography
4. **Elegant** - Sophisticated design for premium brands
5. **Modern Creative** - Contemporary design with creative flair
6. **Classic Modern** - Timeless design with modern touches

## Files Created

### 1. Template Definitions
**File:** `lib/template-defaults.ts`

Contains TypeScript definitions for all 6 pre-built templates. Each template includes:
- Name and description
- Category classification
- Complete template JSON structure (metadata, theme, elements)

### 2. SQL Seeding Script
**File:** `scripts/seed-templates.sql`

Direct SQL script for seeding templates. Can be run in:
- Supabase SQL Editor
- psql command line
- Any PostgreSQL client

**Features:**
- Uses `gen_random_uuid()` for ID generation
- Sets first template as default (`isdefault=true`)
- All templates are public system templates (`ispublic=true`, `createdby=NULL`)
- Includes verification queries at the end
- Properly formatted JSONB data with escaped characters

### 3. TypeScript Seeding Script
**File:** `scripts/seed-templates.ts`

Node.js/TypeScript script using Supabase client. Provides:
- Automated template import from `lib/template-defaults.ts`
- Column name mapping (camelCase → lowercase)
- Duplicate detection (skips existing templates)
- Error handling and detailed logging
- Summary statistics and table display

## Running the Seeding Scripts

### Option 1: TypeScript Script (Recommended)

```bash
# Navigate to the intelli-quoter directory
cd intelli-quoter

# Run the seeding script
npm run db:seed-templates
```

**Output Example:**
```
=== Seeding PDF Templates ===

Found 6 templates to seed

[1/6] Processing: Modern Business (business)...
  ✅ Created successfully
     ID: 123e4567-e89b-12d3-a456-426614174000
     Default: true
     Public: true

[2/6] Processing: Minimalist (minimalist)...
  ✅ Created successfully
     ID: 234e5678-e89b-12d3-a456-426614174001
     Default: false
     Public: true

...

=== Seeding Summary ===

✅ Successfully created: 6
⚠️  Skipped (already exist): 0
❌ Failed: 0
📊 Total processed: 6

=== Current Templates in Database ===

┌─────────┬──────────────────┬─────────────┬─────────┬────────┬─────────┬────────────┐
│ (index) │      Name        │  Category   │ Default │ Public │ Version │  Created   │
├─────────┼──────────────────┼─────────────┼─────────┼────────┼─────────┼────────────┤
│    0    │'Modern Business' │ 'business'  │   '✓'   │  '✓'   │    1    │ '1/20/2025'│
│    1    │     'Bold'       │   'bold'    │         │  '✓'   │    1    │ '1/20/2025'│
│    2    │ 'Classic Modern' │  'modern'   │         │  '✓'   │    1    │ '1/20/2025'│
│    3    │   'Elegant'      │ 'elegant'   │         │  '✓'   │    1    │ '1/20/2025'│
│    4    │  'Minimalist'    │'minimalist' │         │  '✓'   │    1    │ '1/20/2025'│
│    5    │'Modern Creative' │ 'creative'  │         │  '✓'   │    1    │ '1/20/2025'│
└─────────┴──────────────────┴─────────────┴─────────┴────────┴─────────┴────────────┘

Total system templates: 6

=== Seeding Complete ===
```

### Option 2: SQL Script

**Via Supabase Dashboard:**
1. Open your Supabase project
2. Navigate to SQL Editor
3. Copy contents of `scripts/seed-templates.sql`
4. Paste and run the script
5. Check the verification results at the end

**Via psql:**
```bash
psql -h <your-supabase-host> \
     -U <your-username> \
     -d postgres \
     -f scripts/seed-templates.sql
```

## Database Schema

The templates are inserted into the `pdf_templates` table with lowercase column names:

| Column Name    | Type                      | Description                          |
|----------------|---------------------------|--------------------------------------|
| `id`           | UUID                      | Auto-generated unique identifier     |
| `name`         | TEXT                      | Template display name                |
| `description`  | TEXT                      | Template description                 |
| `category`     | TEXT                      | Template category                    |
| `isdefault`    | BOOLEAN                   | Whether this is the default template |
| `ispublic`     | BOOLEAN                   | Whether template is public           |
| `template_json`| JSONB                     | Complete template configuration      |
| `thumbnail`    | TEXT                      | Base64 thumbnail (NULL after seed)   |
| `createdby`    | UUID (FK to users)        | Creator user ID (NULL for system)    |
| `createdat`    | TIMESTAMP WITH TIME ZONE  | Creation timestamp                   |
| `updatedat`    | TIMESTAMP WITH TIME ZONE  | Last update timestamp                |
| `version`      | INTEGER                   | Version number (starts at 1)         |

## Important Notes

### Column Naming Convention

**CRITICAL:** The database uses **lowercase column names without underscores**. This is non-standard but required for compatibility with the existing system.

**Examples:**
- ✅ `isdefault` (NOT `isDefault` or `is_default`)
- ✅ `ispublic` (NOT `isPublic` or `is_public`)
- ✅ `template_json` (Exception: uses underscore)
- ✅ `createdat` (NOT `createdAt` or `created_at`)
- ✅ `updatedat` (NOT `updatedAt` or `updated_at`)
- ✅ `createdby` (NOT `createdBy` or `created_by`)

See `CLAUDE.md` for complete database naming conventions.

### Default Template Behavior

- **Only ONE template should have `isdefault=true`**
- The first template ("Modern Business") is set as default
- If you need to change the default:
  ```sql
  -- Unset current default
  UPDATE pdf_templates SET isdefault = false WHERE isdefault = true;

  -- Set new default
  UPDATE pdf_templates SET isdefault = true WHERE name = 'Your Template Name';
  ```

### System vs User Templates

System templates are identified by:
- `ispublic = true`
- `createdby = NULL`

User-created custom templates will have:
- `ispublic = false` (or true if shared)
- `createdby = <user_id>`

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Ensure your `.env` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Issue: Templates already exist

The TypeScript script automatically skips existing templates. To re-seed:

**Option 1:** Delete existing templates first
```sql
DELETE FROM pdf_templates
WHERE ispublic = true AND createdby IS NULL;
```

**Option 2:** Run script again - duplicates will be skipped
```bash
npm run db:seed-templates
```

### Issue: "invalid input syntax for type json"

This means the JSON is malformed. The SQL script has properly escaped JSON strings. If you're modifying templates:
- Ensure all quotes inside JSON are properly escaped
- Use `'::jsonb` cast for JSONB columns
- Test JSON validity with online validators

### Issue: Permission denied errors

Ensure your Supabase key has insert permissions on `pdf_templates` table. Check Row Level Security (RLS) policies.

## Template Structure

Each template contains:

### Metadata
- Page size (A4, Letter, Legal)
- Orientation (portrait, landscape)
- Margins (top, bottom, left, right in points)

### Theme
- **Colors:** primary, secondary, textPrimary, textSecondary, background
- **Fonts:** heading, body, small (family, size, weight)

### Elements
Array of components in rendering order:
- **header** - Company info, logo, quote number, date
- **textBlock** - Client info, totals, policies
- **table** - Line items with quantities, rates, totals
- **divider** - Visual separators
- **spacer** - Vertical spacing
- **signature** - Signature line and date

## Verification

After seeding, verify templates in Supabase:

```sql
-- Check all seeded templates
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

-- Count templates
SELECT COUNT(*) as total_templates
FROM pdf_templates
WHERE ispublic = true AND createdby IS NULL;
```

Expected result: 6 templates total, 1 with `isdefault=true`

## Next Steps

After seeding:

1. **Generate Thumbnails** (Phase 3C)
   - Create thumbnail preview images for each template
   - Update `thumbnail` column with base64 data

2. **Test Template Selection** (Phase 4)
   - Verify templates appear in template selector UI
   - Test loading and applying templates to quotes
   - Ensure default template loads correctly for new quotes

3. **Add More Templates** (Future)
   - Create new template definitions in `lib/template-defaults.ts`
   - Re-run seeding script to add new templates
   - Existing templates will be skipped automatically

## Support

For issues or questions:
- Check `CLAUDE.md` for database conventions
- Review `lib/types.ts` for TypeScript interfaces
- See `scripts/create-pdf-templates.sql` for table schema
- Consult Phase 1A and 1B documentation for context

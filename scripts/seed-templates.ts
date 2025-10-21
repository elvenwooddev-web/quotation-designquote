/**
 * Seed Script: Pre-built PDF Templates (TypeScript version)
 * Phase 3B: Database Seeding
 *
 * This script populates the pdf_templates table with 6 professional pre-built templates
 * using the Supabase client. It imports template definitions from lib/template-defaults.ts
 * and handles the camelCase to lowercase column name mapping.
 *
 * CRITICAL: Database uses lowercase column naming (isdefault, ispublic, template_json, etc.)
 * See CLAUDE.md for database naming conventions.
 *
 * Usage:
 *   npm run db:seed-templates
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { DEFAULT_TEMPLATES } from '../lib/template-defaults';

// Load environment variables
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Interface matching database column names (lowercase)
 */
interface PDFTemplateRow {
  id?: string;
  name: string;
  description: string;
  category: string;
  isdefault: boolean;
  ispublic: boolean;
  template_json: object;
  thumbnail: string | null;
  createdby: string | null;
  createdat?: string;
  updatedat?: string;
  version: number;
}

/**
 * Main seeding function
 */
async function seedTemplates() {
  console.log('=== Seeding PDF Templates ===\n');
  console.log(`Found ${DEFAULT_TEMPLATES.length} templates to seed\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Process each template
  for (let i = 0; i < DEFAULT_TEMPLATES.length; i++) {
    const template = DEFAULT_TEMPLATES[i];

    console.log(`[${i + 1}/${DEFAULT_TEMPLATES.length}] Processing: ${template.name} (${template.category})...`);

    // Check if template with same name already exists
    const { data: existing } = await supabase
      .from('pdf_templates')
      .select('id, name')
      .eq('name', template.name)
      .eq('ispublic', true)
      .eq('createdby', null) // Only check system templates
      .single();

    if (existing) {
      console.log(`  ⚠️  Template already exists, skipping\n`);
      skipCount++;
      continue;
    }

    // Map camelCase template definition to lowercase database columns
    const templateRow: PDFTemplateRow = {
      name: template.name,
      description: template.description,
      category: template.category,
      isdefault: template.isDefault, // Use isDefault from template definition
      ispublic: true,
      template_json: template.templateJson,
      thumbnail: null, // Will be generated later
      createdby: null, // System template (no user owner)
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      version: 1,
    };

    // Insert template into database
    const { data, error } = await supabase
      .from('pdf_templates')
      .insert(templateRow)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error:`, error.message);
      console.error(`     Details:`, error);
      errorCount++;
    } else {
      console.log(`  ✅ Created successfully`);
      console.log(`     ID: ${data.id}`);
      console.log(`     Default: ${data.isdefault}`);
      console.log(`     Public: ${data.ispublic}\n`);
      successCount++;
    }
  }

  console.log('=== Seeding Summary ===\n');
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`⚠️  Skipped (already exist): ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total processed: ${DEFAULT_TEMPLATES.length}\n`);

  // Display current templates in database
  console.log('=== Current Templates in Database ===\n');

  const { data: allTemplates, error: fetchError } = await supabase
    .from('pdf_templates')
    .select('id, name, category, isdefault, ispublic, version, createdat')
    .eq('ispublic', true)
    .eq('createdby', null)
    .order('isdefault', { ascending: false })
    .order('name');

  if (fetchError) {
    console.error('❌ Error fetching templates:', fetchError.message);
  } else if (allTemplates && allTemplates.length > 0) {
    // Format templates for display
    const formattedTemplates = allTemplates.map(t => ({
      Name: t.name,
      Category: t.category,
      Default: t.isdefault ? '✓' : '',
      Public: t.ispublic ? '✓' : '',
      Version: t.version,
      Created: new Date(t.createdat).toLocaleDateString(),
    }));

    console.table(formattedTemplates);
    console.log(`\nTotal system templates: ${allTemplates.length}`);
  } else {
    console.log('No system templates found in database');
  }

  console.log('\n=== Seeding Complete ===\n');
}

/**
 * Run the seeding script
 */
seedTemplates()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });

#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(sqlFilePath: string) {
  try {
    console.log(`\n=== Running Migration: ${sqlFilePath} ===\n`);

    // Read SQL file
    const sqlPath = join(__dirname, sqlFilePath);
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL file loaded successfully');
    console.log(`   Length: ${sql.length} characters\n`);

    // Split SQL into individual statements
    // Remove comments and split by semicolon
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('COMMENT')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Skipping comment/metadata`);
        continue;
      }

      console.log(`⏳ [${i + 1}/${statements.length}] Executing statement...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] Success`);
          successCount++;
        }
      } catch (err: any) {
        // If exec_sql RPC doesn't exist, try direct execution via REST API
        console.log(`⚠️  RPC not available, trying alternative method...`);

        // For DDL statements, we need to use the Supabase SQL Editor API
        // This typically requires a direct HTTP POST to the management API
        console.error(`❌ Cannot execute DDL via client. Please run this SQL manually in Supabase SQL Editor:`);
        console.error(`\n${statement}\n`);
        errorCount++;
      }
    }

    console.log(`\n=== Migration Summary ===\n`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📊 Total statements: ${statements.length}\n`);

    if (errorCount > 0) {
      console.error('⚠️  Some statements failed. Please check the errors above.\n');
      console.error('💡 TIP: For DDL operations (CREATE TABLE, ALTER TABLE, etc.), you may need to:');
      console.error('   1. Open Supabase Dashboard → SQL Editor');
      console.error('   2. Paste the SQL from the migration file');
      console.error('   3. Execute it manually\n');
    } else {
      console.log('🎉 Migration completed successfully!\n');
    }

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: tsx scripts/run-migration.ts <sql-file-path>');
  console.error('   Example: tsx scripts/run-migration.ts create-pdf-templates.sql');
  process.exit(1);
}

// Run the migration
runMigration(migrationFile);

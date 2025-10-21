const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('=== Starting Database Migration ===\n');
  console.log('⚠️  WARNING: This will rename columns in your database!');
  console.log('⚠️  Make sure you have a backup before proceeding.\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'fix-database-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n[${i + 1}/${statements.length}] Executing:`);
    console.log(`  ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Some errors are expected (like column already exists)
        if (error.message.includes('already exists') ||
            error.message.includes('does not exist')) {
          console.log('  ⚠️  Column may already be renamed:', error.message);
          successCount++;
        } else {
          console.error('  ❌ Error:', error.message);
          errorCount++;
        }
      } else {
        console.log('  ✅ Success');
        successCount++;
      }
    } catch (err) {
      console.error('  ❌ Exception:', err.message);
      errorCount++;
    }

    // Add a small delay between queries
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n=== Migration Complete ===');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('Run "node scripts/check-database.js" to verify the changes.');
  } else {
    console.log('\n⚠️  Some migrations failed. Check the errors above.');
  }
}

// Note: This requires a PostgreSQL function to execute raw SQL
// If exec_sql function doesn't exist, we need to use Supabase SQL Editor
console.log('\n📝 IMPORTANT NOTES:');
console.log('This script attempts to run SQL via Supabase RPC.');
console.log('If you get errors, you may need to run the SQL manually in Supabase SQL Editor:');
console.log('1. Go to https://supabase.com/dashboard/project/tmrjuedenuidfhbnocya/sql/new');
console.log('2. Copy the contents of scripts/fix-database-schema.sql');
console.log('3. Paste and run in the SQL Editor\n');

runMigration().catch(console.error);

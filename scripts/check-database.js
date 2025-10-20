const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('=== Database Schema Check ===\n');

  const tables = [
    'categories',
    'products',
    'clients',
    'quotes',
    'quote_items',
    'policy_clauses',
    'users',
    'role_permissions',
    'client_revisions'
  ];

  for (const table of tables) {
    console.log(`\n--- Checking ${table} ---`);

    // Try to fetch one row to see the schema
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error accessing ${table}:`, error.message);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`✅ Table exists. Column names:`, Object.keys(data[0]).join(', '));
    } else {
      console.log(`⚠️  Table exists but is empty`);

      // Try to get count
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`   Row count: ${count}`);
      }
    }
  }

  // Check for common issues
  console.log('\n\n=== Common Issues Check ===\n');

  // Check if quotes table has correct columns
  const { data: quoteData } = await supabase
    .from('quotes')
    .select('*')
    .limit(1);

  if (quoteData && quoteData.length > 0) {
    const expectedColumns = [
      'id', 'title', 'quotenumber', 'clientid', 'discountmode',
      'overalldiscount', 'taxrate', 'subtotal', 'discount',
      'tax', 'grandtotal', 'status', 'createdat', 'updatedat'
    ];

    const actualColumns = Object.keys(quoteData[0]);
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));
    const extra = actualColumns.filter(col => !expectedColumns.includes(col));

    if (missing.length > 0) {
      console.log('❌ Missing columns in quotes:', missing.join(', '));
    }
    if (extra.length > 0) {
      console.log('ℹ️  Extra columns in quotes:', extra.join(', '));
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log('✅ Quotes table columns match expected schema');
    }
  }

  // Check products table
  const { data: productData } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (productData && productData.length > 0) {
    const expectedColumns = [
      'id', 'name', 'description', 'unit', 'baserate',
      'imageurl', 'categoryid', 'createdat', 'updatedat'
    ];

    const actualColumns = Object.keys(productData[0]);
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));

    if (missing.length > 0) {
      console.log('❌ Missing columns in products:', missing.join(', '));
    } else {
      console.log('✅ Products table columns match expected schema');
    }
  }

  // Check users table
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (userData && userData.length > 0) {
    const expectedColumns = [
      'id', 'authuserid', 'name', 'email', 'role',
      'isactive', 'createdat', 'updatedat'
    ];

    const actualColumns = Object.keys(userData[0]);
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));

    if (missing.length > 0) {
      console.log('❌ Missing columns in users:', missing.join(', '));
    } else {
      console.log('✅ Users table columns match expected schema');
    }
  }

  console.log('\n=== Check Complete ===\n');
}

checkDatabase().catch(console.error);

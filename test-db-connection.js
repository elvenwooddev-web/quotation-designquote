// Test Supabase database connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test connection by querying tables
    console.log('\n📊 Fetching database tables...');

    // Try to query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Error querying users table:', usersError.message);
    } else {
      console.log(`✅ Users table: Found ${users.length} user(s)`);
    }

    // Try to query categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error querying categories table:', categoriesError.message);
    } else {
      console.log(`✅ Categories table: Found ${categories.length} categor(ies)`);
    }

    // Try to query products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('❌ Error querying products table:', productsError.message);
    } else {
      console.log(`✅ Products table: Found ${products.length} product(s)`);
    }

    // Try to query quotes table
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(5);

    if (quotesError) {
      console.error('❌ Error querying quotes table:', quotesError.message);
    } else {
      console.log(`✅ Quotes table: Found ${quotes.length} quote(s)`);
    }

    console.log('\n✅ Database connection test completed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();

/**
 * Simple database connection test
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Database Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`  URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
console.log();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function testConnection() {
  console.log('Testing connection to public.users...');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, authuserid, roleid')
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`✅ Successfully connected to database`);
    console.log(`   Found ${data?.length || 0} user(s)\n`);

    if (data && data.length > 0) {
      console.log('User Records:');
      data.forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.name} (${user.email})`);
        console.log(`     ID: ${user.id}`);
        console.log(`     Auth User ID: ${user.authuserid || 'NOT SET'}`);
        console.log(`     Role ID: ${user.roleid || 'NOT SET'}`);
        console.log();
      });
    }

    // Test roles
    console.log('Testing connection to public.roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, description');

    if (rolesError) {
      console.error('❌ Error:', rolesError.message);
    } else {
      console.log(`✅ Found ${roles?.length || 0} role(s)`);
      if (roles && roles.length > 0) {
        roles.forEach(role => {
          console.log(`   - ${role.name}: ${role.description || 'No description'}`);
        });
      }
      console.log();
    }

    // Test auth users (if admin available)
    if (supabaseAdmin) {
      console.log('Testing connection to auth.users...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        console.error('❌ Error:', authError.message);
      } else {
        console.log(`✅ Found ${authData.users.length} auth user(s) in auth schema`);
        authData.users.forEach((user, idx) => {
          console.log(`   ${idx + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
          console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
        });
        console.log();
      }
    }

    console.log('✅ All connection tests passed!');
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
}

testConnection();

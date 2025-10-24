/**
 * Update admin password
 * Run with: npx tsx scripts/update-admin-password.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updateAdminPassword() {
  console.log('🔐 Updating admin password...\n');

  const email = 'varun@elvenwood.in';
  const newPassword = 'Varun@7470';

  try {
    // Get the auth user ID
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      process.exit(1);
    }

    const authUser = users.users.find(u => u.email === email);

    if (!authUser) {
      console.error(`❌ Auth user not found for email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found auth user: ${authUser.email}`);
    console.log(`   Auth ID: ${authUser.id}`);
    console.log();

    // Update password using admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
    console.log();
    console.log('📝 New Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log();

    // Verify user profile and role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        isactive,
        role:roles(name)
      `)
      .eq('authuserid', authUser.id)
      .single();

    if (profileError) {
      console.error('⚠️  Could not fetch profile:', profileError);
    } else {
      console.log('👤 User Profile:');
      console.log(`   Name: ${profile.name}`);
      console.log(`   Role: ${profile.role?.name || 'No role'}`);
      console.log(`   Active: ${profile.isactive ? 'Yes' : 'No'}`);
      console.log();
    }

    console.log('🎉 All done! You can now login with the new password.');
    console.log('🔗 Login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

updateAdminPassword();

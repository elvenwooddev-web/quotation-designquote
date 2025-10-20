// Script to create test users in Supabase
// Run this with: node scripts/create-test-users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'admin@designquote.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'Admin'
  },
  {
    email: 'designer@designquote.com',
    password: 'designer123',
    name: 'Designer User',
    role: 'Designer'
  },
  {
    email: 'client@designquote.com',
    password: 'client123',
    name: 'Client User',
    role: 'Client'
  }
];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const userData of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`Error creating auth user for ${userData.email}:`, authError);
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          is_active: true,
        });

      if (profileError) {
        console.error(`Error creating profile for ${userData.email}:`, profileError);
      } else {
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }
  
  console.log('Test user creation completed!');
}

createTestUsers();

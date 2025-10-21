const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const demoUsers = [
  {
    name: 'Sophia Carter',
    email: 'sophia.carter@email.com',
    role: 'Admin',
  },
  {
    name: 'Ethan Bennett',
    email: 'ethan.bennett@email.com',
    role: 'Designer',
  },
  {
    name: 'Olivia Hayes',
    email: 'olivia.hayes@email.com',
    role: 'Designer',
  },
  {
    name: 'Liam Foster',
    email: 'liam.foster@email.com',
    role: 'Client',
  },
  {
    name: 'Ava Morgan',
    email: 'ava.morgan@email.com',
    role: 'Client',
  },
];

async function seedDemoUsers() {
  console.log('=== Seeding Demo Users ===\n');

  for (const user of demoUsers) {
    console.log(`Creating user: ${user.name} (${user.email})...`);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', user.email)
      .single();

    if (existingUser) {
      console.log(`  ⚠️  User already exists, skipping\n`);
      continue;
    }

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        authuserid: null, // No auth user for demo mode
        name: user.name,
        email: user.email,
        role: user.role,
        isactive: true,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error:`, error.message);
    } else {
      console.log(`  ✅ Created successfully (ID: ${data.id})\n`);
    }
  }

  console.log('=== Seeding Complete ===\n');

  // Show all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('name, email, role, isactive')
    .order('role');

  console.log('Current users in database:');
  console.table(allUsers);
}

seedDemoUsers().catch(console.error);

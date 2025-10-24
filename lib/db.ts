import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (uses anon key)
// This respects RLS policies and is safe for browser use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key)
// This bypasses RLS and should ONLY be used in API routes
// Use this for admin operations and auth user management
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper to get the authenticated user's profile from public.users
// This queries the public.users table using the auth user ID
export async function getUserProfile(authUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(
        id,
        name,
        description,
        isprotected,
        createdat,
        updatedat
      )
    `)
    .eq('authuserid', authUserId)
    .single();

  if (error) {
    console.error('[DB] Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Helper to get role permissions
export async function getRolePermissions(roleId: string) {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('roleid', roleId);

  if (error) {
    console.error('[DB] Error fetching role permissions:', error);
    return [];
  }

  return data || [];
}




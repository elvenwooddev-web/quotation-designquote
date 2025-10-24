'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './db';
import { User, RolePermission } from './types';

interface AuthContextType {
  user: User | null;
  permissions: RolePermission[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; roleId: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 🔧 DEV MODE: Set to false to re-enable authentication
const DEV_MODE_BYPASS_AUTH = false;

// Mock admin user for development
const MOCK_DEV_USER: User = {
  id: 'dev-admin-id',
  authUserId: 'dev-auth-id',
  name: 'Dev Admin',
  email: 'admin@dev.local',
  roleId: 'dev-role-id',
  role: 'Admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock full admin permissions for development
const MOCK_DEV_PERMISSIONS: RolePermission[] = [
  {
    id: 'dev-perm-1',
    roleId: 'dev-role-id',
    resource: 'categories',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canExport: true,
  },
  {
    id: 'dev-perm-2',
    roleId: 'dev-role-id',
    resource: 'products',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canExport: true,
  },
  {
    id: 'dev-perm-3',
    roleId: 'dev-role-id',
    resource: 'clients',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canExport: true,
  },
  {
    id: 'dev-perm-4',
    roleId: 'dev-role-id',
    resource: 'quotes',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canExport: true,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 🔧 DEV MODE: Bypass auth and use mock admin user
    if (DEV_MODE_BYPASS_AUTH) {
      console.log('🔧 [DEV MODE] Auth bypassed - using mock admin user');
      setUser(MOCK_DEV_USER);
      setPermissions(MOCK_DEV_PERMISSIONS);
      setLoading(false);
      return;
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 10000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Error getting session:', error);

          // If session is invalid, clear it
          if (error.message?.includes('invalid') || error.message?.includes('expired')) {
            console.log('[Auth] Clearing invalid session');
            await supabase.auth.signOut();
          }

          if (mounted) {
            setUser(null);
            setPermissions([]);
            setLoading(false);
            clearTimeout(timeout);
          }
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id);
          clearTimeout(timeout);
        } else {
          if (mounted) {
            setUser(null);
            setPermissions([]);
            setLoading(false);
            clearTimeout(timeout);
          }
        }
      } catch (error: any) {
        console.error('[Auth] Exception in getInitialSession:', error);

        // Clear potentially corrupted session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('[Auth] Error signing out:', signOutError);
        }

        if (mounted) {
          setUser(null);
          setPermissions([]);
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          if (mounted) {
            setUser(null);
            setPermissions([]);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUserId: string) => {
    try {
      console.log('[Auth] Fetching user profile for auth user:', authUserId);

      // Fetch user profile from public.users linked to auth.users via authuserid
      const { data: userProfile, error } = await supabase
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
        console.error('[Auth] Error fetching user profile:', error);
        console.error('[Auth] Error code:', error.code);
        console.error('[Auth] Error details:', error.details);
        console.error('[Auth] Error hint:', error.hint);

        // If RLS policy is blocking, provide helpful message
        if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
          console.error('[Auth] No user profile found. Make sure a record exists in public.users with authuserid:', authUserId);
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.error('[Auth] RLS policy blocked access to user profile. Check RLS policies on public.users table.');
        }

        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      if (!userProfile) {
        console.error('[Auth] No user profile found for auth user:', authUserId);
        console.error('[Auth] Make sure public.users has a record with authuserid =', authUserId);
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      if (!userProfile.isactive) {
        console.error('[Auth] User account is deactivated');
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Map database column names to camelCase for frontend
      const mappedUser: User = {
        id: userProfile.id,
        authUserId: userProfile.authuserid,
        name: userProfile.name,
        email: userProfile.email,
        roleId: userProfile.roleid,
        role: userProfile.role?.name || 'Unknown',
        isActive: userProfile.isactive,
        createdAt: userProfile.createdat,
        updatedAt: userProfile.updatedat,
      };

      setUser(mappedUser);

      // Fetch permissions for the user's role
      if (userProfile.roleid) {
        await fetchRolePermissions(userProfile.roleid);
      } else {
        console.warn('[Auth] User has no role assigned');
        setPermissions([]);
      }
    } catch (error) {
      console.error('[Auth] Exception in fetchUserProfile:', error);
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      // Fetch permissions from public.role_permissions
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('roleid', roleId);

      if (error) {
        console.error('[Auth] Error fetching permissions:', error);
        setPermissions([]);
        return;
      }

      if (!rolePermissions || rolePermissions.length === 0) {
        console.warn('[Auth] No permissions found for role:', roleId);
        setPermissions([]);
        return;
      }

      // Map database column names to camelCase for frontend
      const mappedPermissions: RolePermission[] = rolePermissions.map((perm) => ({
        id: perm.id,
        roleId: perm.roleid,
        resource: perm.resource,
        canCreate: perm.cancreate,
        canRead: perm.canread,
        canEdit: perm.canedit,
        canDelete: perm.candelete,
        canApprove: perm.canapprove,
        canExport: perm.canexport,
      }));

      setPermissions(mappedPermissions);
    } catch (error) {
      console.error('[Auth] Exception in fetchRolePermissions:', error);
      setPermissions([]);
    }
  };

  const signIn = async (email: string, password: string) => {
    // 🔧 DEV MODE: Sign in is bypassed
    if (DEV_MODE_BYPASS_AUTH) {
      console.log('🔧 [DEV MODE] Sign in bypassed - already using mock admin');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from sign in');
    }

    // Explicitly fetch the user profile to ensure it loads before proceeding
    // This prevents the loading state from hanging
    console.log('[Auth] Sign in successful, fetching profile for:', data.user.id);
    await fetchUserProfile(data.user.id);
  };

  const signUp = async (email: string, password: string, userData: { name: string; roleId: string }) => {
    // 🔧 DEV MODE: Sign up is bypassed
    if (DEV_MODE_BYPASS_AUTH) {
      console.log('🔧 [DEV MODE] Sign up bypassed - auth is disabled');
      throw new Error('Sign up is disabled in dev mode');
    }

    // Validate email domain
    if (!email.endsWith('@elvenwood.in')) {
      throw new Error('Only @elvenwood.in email addresses are allowed');
    }

    // Step 1: Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message || 'Failed to create account');
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // Step 2: Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        authuserid: authData.user.id,
        name: userData.name,
        email: email,
        roleid: userData.roleId,
        isactive: true,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we should ideally delete the auth user
      // But for now, just throw the error
      throw new Error(profileError.message || 'Failed to create user profile');
    }

    // The user will be automatically signed in and profile fetched via auth state listener
  };

  const signOut = async () => {
    // 🔧 DEV MODE: Just reset to mock user
    if (DEV_MODE_BYPASS_AUTH) {
      console.log('🔧 [DEV MODE] Sign out bypassed - keeping mock admin user');
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

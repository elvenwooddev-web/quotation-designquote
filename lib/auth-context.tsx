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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Session check timed out after 10 seconds');
        setLoading(false);
      }
    }, 10000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[Auth] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Error getting session:', error);
          if (mounted) {
            setUser(null);
            setPermissions([]);
            setLoading(false);
            clearTimeout(timeout);
          }
          return;
        }

        console.log('[Auth] Session:', session ? 'Found' : 'None');

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
      } catch (error) {
        console.error('[Auth] Exception in getInitialSession:', error);
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
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event);
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
      console.log('[Auth] Fetching user profile for auth ID:', authUserId);

      // Fetch user with role information
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

      console.log('[Auth] User profile response:', { userProfile, error });

      if (error) {
        console.error('[Auth] Error fetching user profile:', error);
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      if (!userProfile) {
        console.error('[Auth] No user profile found');
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

      // Use the data as-is since it's already in the correct format
      console.log('[Auth] Setting user:', userProfile);
      setUser(userProfile as User);

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
      console.log('[Auth] Fetching permissions for role:', roleId);
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('roleid', roleId);

      if (error) {
        console.error('[Auth] Error fetching permissions:', error);
        setPermissions([]);
        return;
      }

      if (!rolePermissions) {
        console.warn('[Auth] No permissions found for role');
        setPermissions([]);
        return;
      }

      // Use the data as-is since types match database columns
      console.log('[Auth] Setting permissions:', rolePermissions);
      setPermissions(rolePermissions as RolePermission[]);
    } catch (error) {
      console.error('[Auth] Exception in fetchRolePermissions:', error);
      setPermissions([]);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Starting sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('[Auth] Sign in response:', { data, error });

    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }

    console.log('[Auth] Sign in successful, waiting for auth state change...');
    // The user profile will be fetched automatically via the auth state change listener
  };

  const signUp = async (email: string, password: string, userData: { name: string; roleId: string }) => {
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
    const { data: userProfile, error: profileError } = await supabase
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

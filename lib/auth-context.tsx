'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './db';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; role: string }) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in localStorage first
    const checkDemoUser = () => {
      if (typeof window !== 'undefined') {
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          try {
            const user = JSON.parse(demoUser);
            setUser(user);
            setLoading(false);
            return true;
          } catch (error) {
            localStorage.removeItem('demo_user');
          }
        }
      }
      return false;
    };

    // Check demo user first
    if (checkDemoUser()) {
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUserId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('authuserid', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (!userProfile.isactive) {
        throw new Error('Account is deactivated');
      }

      setUser(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Demo function to bypass auth for testing
  const signInDemo = async (email: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        throw new Error('User not found');
      }

      if (!userProfile.isactive) {
        throw new Error('Account is deactivated');
      }

      setUser(userProfile);
    } catch (error: any) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // The user profile will be fetched automatically via the auth state change listener
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: string }) => {
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
        role: userData.role,
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
    // Clear demo user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

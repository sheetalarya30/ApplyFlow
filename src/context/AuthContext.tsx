import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, checkSupabaseHealth, type SupabaseHealthResult } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  connectionHealth: SupabaseHealthResult;
  checkConnection: () => Promise<SupabaseHealthResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loginAsDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'applyflow_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionHealth, setConnectionHealth] = useState<SupabaseHealthResult>({
    status: isSupabaseConfigured ? 'checking' : 'not_connected',
    message: isSupabaseConfigured ? 'Verifying connection to Supabase...' : 'Supabase credentials not configured in .env',
    tableFound: false,
  });

  const checkConnection = useCallback(async (): Promise<SupabaseHealthResult> => {
    setConnectionHealth((prev) => ({ ...prev, status: 'checking', message: 'Testing real request to Supabase...' }));
    const result = await checkSupabaseHealth();
    setConnectionHealth(result);
    return result;
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check if demo user is stored in local storage
      const savedDemo = localStorage.getItem(DEMO_USER_KEY);
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
        } catch {
          localStorage.removeItem(DEMO_USER_KEY);
        }
      }
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error fetching initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Re-verify connection health when session changes
      checkConnection();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkConnection]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      // Local demo sign in
      const demoUser = {
        id: 'demo-user-id',
        email,
        app_metadata: {},
        user_metadata: { name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(demoUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      return { error: new Error(message) };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-user-id',
        email,
        app_metadata: {},
        user_metadata: { name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(demoUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      return { error: new Error(message) };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem(DEMO_USER_KEY);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const loginAsDemoUser = (): void => {
    const demoUser = {
      id: 'demo-student-uuid',
      email: 'student@placement.edu',
      app_metadata: {},
      user_metadata: { name: 'Final Year Student' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(demoUser);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        connectionHealth,
        checkConnection,
        signIn,
        signUp,
        signOut,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

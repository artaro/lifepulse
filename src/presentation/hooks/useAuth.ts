'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/data/datasources/supabaseBrowser';
import { useAuthStore } from '@/presentation/stores/useAuthStore';

const supabase = createSupabaseBrowserClient();

export function useAuth() {
  const { user, session, loading, setSession, clearSession } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error.message);
        clearSession();
        return;
      }
      setSession(session);
    }).catch((err) => {
      console.error('Unexpected auth error:', err);
      clearSession();
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearSession();
      } else if (event === 'TOKEN_REFRESHED' && !session) {
        // If token refresh failed, session might be null or invalid
        clearSession();
      } else {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Immediately update the store so navigation doesn't race with onAuthStateChange
      if (data.session) setSession(data.session);
    },
    [setSession]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) setSession(data.session);
    },
    [setSession]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearSession();
  }, [clearSession]);

  return { user, session, loading, signIn, signUp, signOut };
}

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithUsername: (username: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, username: string, password: string, whatsapp?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  verifyAdminPassword: (password: string) => Promise<boolean>;
  loading: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  isAdminCheckComplete: boolean;
  isSubscriptionExpired: boolean;
  subscriptionExpiredAt: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // 5-second timeout - faster response for better UX
    const setupTimeout = () => {
      loadingTimeout = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('Auth check timeout - forcing load complete');
          setLoading(false);
          setIsAdminCheckComplete(true);
        }
      }, 5000);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setIsAdminCheckComplete(false);
        // Use faster, non-blocking check
        checkUserApprovalAndRole(session.user.id);
      } else {
        setIsApproved(false);
        setIsAdmin(false);
        setIsAdminCheckComplete(true);
        setLoading(false);
      }
    });

    // THEN check for existing session
    const initAuth = async () => {
      setupTimeout();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setIsAdminCheckComplete(false);
          // Non-blocking check for faster loading
          checkUserApprovalAndRole(session.user.id);
        } else {
          setIsApproved(false);
          setIsAdmin(false);
          setIsAdminCheckComplete(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsAdminCheckComplete(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserApprovalAndRole = async (userId: string) => {
    try {
      // Run checks in parallel for speed
      const [roleCheck, profileCheck] = await Promise.all([
        supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin' as any,
        }),
        supabase
          .from('profiles')
          .select('is_approved')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      const isUserAdmin = !!roleCheck.data && !roleCheck.error;
      setIsAdmin(isUserAdmin);

      // Admin bypasses approval check
      if (profileCheck.error) {
        console.error('Error fetching profile:', profileCheck.error);
        setIsApproved(isUserAdmin ? true : false);
      } else {
        setIsApproved(isUserAdmin ? true : (profileCheck.data?.is_approved ?? false));
      }

      // Subscription check - disabled
      setIsSubscriptionExpired(false);
      setSubscriptionExpiredAt(null);
    } catch (error) {
      console.error('Error checking user status:', error);
      setIsApproved(false);
      setIsAdmin(false);
      setIsSubscriptionExpired(false);
      setSubscriptionExpiredAt(null);
    } finally {
      setIsAdminCheckComplete(true);
    }
  };

  const signUp = async (email: string, username: string, password: string, whatsapp?: string) => {
    // Get the correct redirect URL - use production URL if available, otherwise current origin
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'https://kasirq-pos.lovable.app/waiting-approval'
      : `${window.location.origin}/waiting-approval`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          whatsapp: whatsapp
        },
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) return { error };
    
    // Notify admin about new registration
    if (data.user) {
      try {
        await supabase.functions.invoke('notify-admin-new-user', {
          body: {
            userEmail: email,
            username: username,
          },
        });
      } catch (notifyError) {
        console.error('Failed to notify admin:', notifyError);
        // Don't block signup if notification fails
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };
    
    // User approval will be checked by ProtectedRoute
    // So we don't block login here, just let them in
    
    return { error };
  };

  const signInWithUsername = async (username: string, password: string) => {
    // Use RPC with SECURITY DEFINER to bypass RLS when not authenticated
    const { data, error } = await supabase.rpc('get_user_by_username_or_email', {
      identifier: username,
    });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      return { error: { message: 'Username tidak ditemukan' } };
    }

    const record = Array.isArray(data) ? data[0] : data;
    if (!record || !record.email) {
      return { error: { message: 'Username tidak ditemukan' } };
    }

    return signIn(record.email as string, password);
  };

  const signOut = async () => {
    try {
      // Clear all local state first
      setUser(null);
      setSession(null);
      
      // Clear any local storage/session storage data
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if there's an error, try to clear local state
      setUser(null);
      setSession(null);
      window.location.href = '/';
    }
  };

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    // Simplified to use the same constant as AdminProtection to avoid DB dependency
    return password === '122344566';
  };

  const value = {
    user,
    session,
    signIn,
    signInWithUsername,
    signUp,
    signOut,
    verifyAdminPassword,
    loading,
    isApproved,
    isAdmin,
    isAdminCheckComplete,
    isSubscriptionExpired,
    subscriptionExpiredAt,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Define a global interface to extend Window
declare global {
    interface Window {
        _supabaseClient?: SupabaseClient;
    }
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using mock mode.');
} else {
    // Only log configuration once to avoid clutter during HMR
    if (!window._supabaseClient) {
        console.log('Supabase Configuration:', { url: supabaseUrl, hasKey: !!supabaseAnonKey });
    }
}

const getSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) return null;

    // Singleton pattern for HMR support
    if (!window._supabaseClient) {
        console.log('Initializing Supabase client instance...');
        window._supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }

    return window._supabaseClient;
};

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = !!supabase;

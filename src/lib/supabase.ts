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

// Default timeout for database requests (in milliseconds)
export const DEFAULT_TIMEOUT = 8000;

/**
 * Utility function to wrap a promise with a timeout.
 * If the promise doesn't resolve within the timeout, it will reject with a timeout error.
 * Note: This doesn't actually cancel the underlying request, but prevents UI from hanging.
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = DEFAULT_TIMEOUT,
    operationName: string = 'Database operation'
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

/**
 * Creates an AbortController with automatic timeout.
 * Use this for Supabase requests that support AbortSignal.
 */
export function createTimeoutController(timeoutMs: number = DEFAULT_TIMEOUT): {
    controller: AbortController;
    cleanup: () => void;
} {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    return {
        controller,
        cleanup: () => clearTimeout(timeoutId)
    };
}

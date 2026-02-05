import { supabase, isSupabaseConfigured, withTimeout, DEFAULT_TIMEOUT } from '../lib/supabase';
import { UserRole } from '../../types';

export interface UserProfile {
    id: string;
    role: UserRole;
    username: string | null;
    phone: string | null;
    avatar_url: string | null;
}

export interface AuthResult {
    success: boolean;
    user?: UserProfile;
    error?: string;
}

// Translate Supabase error messages to Chinese
function translateError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': '邮箱或密码错误',
        'Email not confirmed': '邮箱未验证，请先验证邮箱',
        'User already registered': '该邮箱已注册，请直接登录',
        'Password should be at least 6 characters': '密码至少需要6位',
        'Unable to validate email address: invalid format': '邮箱格式不正确',
        'Email rate limit exceeded': '操作过于频繁，请稍后再试',
        'For security purposes, you can only request this once every 60 seconds': '操作过于频繁，请60秒后再试',
        'Signup requires a valid password': '请输入有效的密码',
        'User not found': '用户不存在',
        'Network error': '网络连接失败，请检查网络',
        'timed out': '请求超时，请检查网络连接',
    };

    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }
    return errorMessage;
}

// Sign up with email and password
export async function signUp(email: string, password: string, role: UserRole = UserRole.CONSUMER): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
        return mockSignUp(email, role);
    }

    try {
        const { data, error } = await withTimeout(
            supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { role }
                }
            }),
            DEFAULT_TIMEOUT,
            'Sign up'
        );

        if (error) {
            console.error('Sign up error:', error);
            return { success: false, error: translateError(error.message) };
        }

        if (data.user) {
            return {
                success: true,
                user: {
                    id: data.user.id,
                    role,
                    username: email,
                    phone: null,
                    avatar_url: null
                }
            };
        }

        return { success: false, error: '注册失败，请稍后重试' };
    } catch (err) {
        console.error('Sign up exception:', err);
        const message = err instanceof Error ? err.message : '注册失败，请检查网络连接';
        return { success: false, error: translateError(message) };
    }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
        return mockSignIn(email);
    }

    try {
        const { data, error } = await withTimeout(
            supabase.auth.signInWithPassword({
                email,
                password
            }),
            DEFAULT_TIMEOUT,
            'Sign in'
        );

        if (error) {
            console.error('Sign in error:', error);
            return { success: false, error: translateError(error.message) };
        }

        if (data.user) {
            // Get profile with timeout, but don't block login if it fails
            let profile: UserProfile | null = null;
            try {
                profile = await getUserProfile(data.user.id);
            } catch (profileErr) {
                console.warn('Failed to fetch profile during login, using default:', profileErr);
            }

            return {
                success: true,
                user: profile || {
                    id: data.user.id,
                    role: UserRole.CONSUMER,
                    username: data.user.email || null,
                    phone: null,
                    avatar_url: null
                }
            };
        }

        return { success: false, error: '登录失败，请稍后重试' };
    } catch (err) {
        console.error('Sign in exception:', err);
        const message = err instanceof Error ? err.message : '登录失败，请检查网络连接';
        return { success: false, error: translateError(message) };
    }
}

// Sign out
export async function signOut(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
        return;
    }
    try {
        await withTimeout(supabase.auth.signOut(), 5000, 'Sign out');
    } catch (err) {
        console.error('Sign out error:', err);
        // Still clear local state even if API call fails
    }
}

// Get current user
export async function getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data: { user }, error } = await withTimeout(
            supabase.auth.getUser(),
            5000, // Shorter timeout for initial user check
            'Get current user'
        );

        if (error) {
            console.error('Error fetching auth user:', error);
            return null;
        }

        if (!user) return null;

        return await getUserProfile(user.id);
    } catch (err) {
        console.error('Unexpected error in getCurrentUser:', err);
        return null;
    }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data, error } = await withTimeout(
            supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single(),
            DEFAULT_TIMEOUT,
            'Get user profile'
        );

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id,
            role: data.role as UserRole,
            username: data.username,
            phone: data.phone,
            avatar_url: data.avatar_url
        };
    } catch (err) {
        console.error('Unexpected error in getUserProfile:', err);
        return null;
    }
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: UserProfile | null) => void): (() => void) | undefined {
    if (!isSupabaseConfigured || !supabase) {
        return undefined;
    }

    // Track pending profile fetch to prevent overlapping requests
    let pendingProfileFetch: Promise<UserProfile | null> | null = null;
    let isUnsubscribed = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change event:', event);

        if (isUnsubscribed) return;

        if (session?.user) {
            // Cancel any pending profile fetch
            if (pendingProfileFetch) {
                console.log('Cancelling previous profile fetch');
            }

            // Fetch profile with timeout protection
            pendingProfileFetch = getUserProfile(session.user.id);

            try {
                const profile = await pendingProfileFetch;
                if (!isUnsubscribed) {
                    callback(profile);
                }
            } catch (err) {
                console.error('Error fetching profile in auth state change:', err);
                // Still notify with basic user info
                if (!isUnsubscribed) {
                    callback({
                        id: session.user.id,
                        role: UserRole.CONSUMER,
                        username: session.user.email || null,
                        phone: null,
                        avatar_url: null
                    });
                }
            } finally {
                pendingProfileFetch = null;
            }
        } else {
            callback(null);
        }
    });

    return () => {
        isUnsubscribed = true;
        subscription.unsubscribe();
    };
}

// Mock functions for development without Supabase
function mockSignUp(email: string, role: UserRole): AuthResult {
    console.log('[Mock] Sign up:', email, role);
    return {
        success: true,
        user: {
            id: 'mock-user-id',
            role,
            username: email,
            phone: null,
            avatar_url: null
        }
    };
}

function mockSignIn(email: string): AuthResult {
    console.log('[Mock] Sign in:', email);
    const role = email.includes('merchant') || email.includes('admin') ? UserRole.MERCHANT : UserRole.CONSUMER;
    return {
        success: true,
        user: {
            id: 'mock-user-id',
            role,
            username: email,
            phone: null,
            avatar_url: null
        }
    };
}

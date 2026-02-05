import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MerchantProfile {
    id: string;
    user_id: string;
    shop_name: string | null;
    credit_score: number;
    deposit: number;
    verified: boolean;
    verified_until: string | null;
}

export interface DashboardStats {
    currentViewers: number;
    viewersChange: number;
    cvr: number;
    avgStayTime: string;
    ageDistribution: { name: string; value: number }[];
    genderDistribution: { gender: string; percentage: number }[];
    topRegion: string;
}

// Get merchant profile
export async function getMerchantProfile(userId: string): Promise<MerchantProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
        return getMockMerchantProfile(userId);
    }

    try {
        const { data, error } = await supabase
            .from('merchant_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return getMockMerchantProfile(userId);
        return data;
    } catch {
        return getMockMerchantProfile(userId);
    }
}

// Get dashboard statistics (simulated realtime data)
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    // In a real app, this would fetch from analytics service
    // For now, we return mock data that simulates realtime stats
    return {
        currentViewers: 12845 + Math.floor(Math.random() * 100),
        viewersChange: 15.4,
        cvr: 8.4,
        avgStayTime: '3m 24s',
        ageDistribution: [
            { name: '18-24', value: 35 },
            { name: '25-34', value: 58 },
            { name: '35-44', value: 25 },
            { name: '45+', value: 12 },
        ],
        genderDistribution: [
            { gender: '女性', percentage: 68 },
            { gender: '男性', percentage: 32 },
        ],
        topRegion: '广东省'
    };
}

// Update merchant profile
export async function updateMerchantProfile(
    userId: string,
    updates: Partial<Omit<MerchantProfile, 'id' | 'user_id'>>
): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        const { error } = await supabase
            .from('merchant_profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        return !error;
    } catch {
        return false;
    }
}

// Create merchant profile
export async function createMerchantProfile(userId: string, shopName: string): Promise<MerchantProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
        return getMockMerchantProfile(userId);
    }

    try {
        const { data, error } = await supabase
            .from('merchant_profiles')
            .insert({
                user_id: userId,
                shop_name: shopName,
                credit_score: 98.5,
                deposit: 20000,
                verified: false
            })
            .select()
            .single();

        if (error || !data) return null;
        return data;
    } catch {
        return null;
    }
}

// Mock data
function getMockMerchantProfile(userId: string): MerchantProfile {
    return {
        id: 'mock-merchant-id',
        user_id: userId,
        shop_name: '虚视界官方旗舰店',
        credit_score: 98.5,
        deposit: 20000,
        verified: true,
        verified_until: '2024-12-31'
    };
}

import { supabase, isSupabaseConfigured, withTimeout, DEFAULT_TIMEOUT } from '../lib/supabase';

export interface AvatarConfig {
    id?: string;
    user_id: string;
    seed: string;
    hair: string;
    face: string;
    clothes: string;
    makeup: string;
    color: string;
    voice_pitch: number;
    motion: string;
}

// Get user's avatar configuration
export async function getAvatarConfig(userId: string): Promise<AvatarConfig | null> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalAvatarConfig();
    }

    try {
        const { data, error } = await withTimeout(
            supabase
                .from('avatar_configs')
                .select('*')
                .eq('user_id', userId)
                .single(),
            DEFAULT_TIMEOUT,
            'Get avatar config'
        );

        if (error || !data) return getLocalAvatarConfig();
        return data;
    } catch (err) {
        console.error('[AvatarService] Error fetching config:', err);
        return getLocalAvatarConfig();
    }
}

// Save avatar configuration
export async function saveAvatarConfig(config: AvatarConfig): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        saveLocalAvatarConfig(config);
        return true;
    }

    try {
        const { error } = await withTimeout(
            supabase
                .from('avatar_configs')
                .upsert({
                    user_id: config.user_id,
                    seed: config.seed,
                    hair: config.hair,
                    face: config.face,
                    clothes: config.clothes,
                    makeup: config.makeup,
                    color: config.color,
                    voice_pitch: config.voice_pitch,
                    motion: config.motion,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                }),
            DEFAULT_TIMEOUT,
            'Save avatar config'
        );

        if (error) {
            console.error('Error saving avatar config:', error);
            return false;
        }

        // Also save locally as backup
        saveLocalAvatarConfig(config);
        return true;
    } catch (err) {
        console.error('Error saving avatar config:', err);
        // Try to save locally as fallback
        saveLocalAvatarConfig(config);
        return false;
    }
}

// Default avatar configuration
export function getDefaultAvatarConfig(userId: string = 'guest'): AvatarConfig {
    return {
        user_id: userId,
        seed: 'Natsumi',
        hair: 'hair-0',
        face: 'face-0',
        clothes: 'cloth-0',
        makeup: 'makeup-0',
        color: 'c2',
        voice_pitch: 50,
        motion: 'm1'
    };
}

// Local storage helpers for offline/guest mode
const LOCAL_STORAGE_KEY = 'avatar_config';

function getLocalAvatarConfig(): AvatarConfig | null {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parsing errors
    }
    return null;
}

function saveLocalAvatarConfig(config: AvatarConfig): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Ignore storage errors
    }
}

// Avatar library presets
export const AVATAR_LIBRARY = [
    { id: 'av1', name: '元气少女', seed: 'Natsumi' },
    { id: 'av2', name: '高冷男神', seed: 'Kenji' },
    { id: 'av3', name: '邻家小妹', seed: 'Sakura' },
    { id: 'av4', name: '阳光学长', seed: 'Hiro' },
    { id: 'av5', name: '时尚达人', seed: 'Yuki' },
    { id: 'av6', name: '二次元', seed: 'Rin' },
];

export const COLORS = [
    { id: 'c1', hex: '#FFADAD' },
    { id: 'c2', hex: '#FFD6A5' },
    { id: 'c3', hex: '#FDFFB6' },
    { id: 'c4', hex: '#CAFFBF' },
    { id: 'c5', hex: '#9BF6FF' },
    { id: 'c6', hex: '#A0C4FF' },
    { id: 'c7', hex: '#BDB2FF' },
    { id: 'c8', hex: '#333333' },
    { id: 'c9', hex: '#F0F0F0' },
    { id: 'c10', hex: '#6D4C41' },
];

export const MOTIONS = [
    { id: 'm1', label: '打招呼', icon: '👋' },
    { id: 'm2', label: '比心', icon: '❤️' },
    { id: 'm3', label: '大笑', icon: '😄' },
    { id: 'm4', label: '思考', icon: '🤔' },
    { id: 'm5', label: '跳舞', icon: '💃' },
    { id: 'm6', label: '点赞', icon: '👍' },
    { id: 'm7', label: '害羞', icon: '😳' },
    { id: 'm8', label: '生气', icon: '😤' },
];

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PROFILE_KEY = 'virtual_horizon_profile';

export interface ProfileData {
    username: string;
    phone: string;
    avatar_url: string;
    bio?: string;
    gender?: string;
    birthday?: string;
}

function getLocalProfile(): ProfileData | null {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveLocalProfile(profile: ProfileData): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<ProfileData | null> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalProfile();
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return getLocalProfile();

        const { data, error } = await supabase
            .from('profiles')
            .select('username, phone, avatar_url, bio, gender, birthday')
            .eq('id', user.id)
            .single();

        if (error || !data) return getLocalProfile();

        const profile: ProfileData = {
            username: data.username || '',
            phone: data.phone || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            gender: data.gender || '',
            birthday: data.birthday || '',
        };
        saveLocalProfile(profile);
        return profile;
    } catch {
        return getLocalProfile();
    }
}

export async function updateProfile(updates: Partial<ProfileData>): Promise<boolean> {
    // Always save locally
    const current = getLocalProfile() || { username: '', phone: '', avatar_url: '' };
    const merged = { ...current, ...updates };
    saveLocalProfile(merged);

    if (!isSupabaseConfigured || !supabase) return true;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return true;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        return !error;
    } catch {
        return true;
    }
}

// Upload avatar - converts image to base64 and stores in profile
export async function uploadAvatar(file: File): Promise<string | null> {
    // Convert to base64 for localStorage fallback
    const base64 = await fileToBase64(file);

    if (!isSupabaseConfigured || !supabase) {
        await updateProfile({ avatar_url: base64 });
        return base64;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            await updateProfile({ avatar_url: base64 });
            return base64;
        }

        // Try Supabase Storage
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `avatars/${user.id}_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });

        if (uploadError || !uploadData) {
            // Fallback: store base64 directly in profile
            await updateProfile({ avatar_url: base64 });
            return base64;
        }

        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl || base64;
        await updateProfile({ avatar_url: publicUrl });
        return publicUrl;
    } catch {
        await updateProfile({ avatar_url: base64 });
        return base64;
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

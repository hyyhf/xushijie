import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserAddress {
    id: string;
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    is_default: boolean;
}

const ADDR_KEY = 'virtual_horizon_addresses';

function getLocalAddresses(): UserAddress[] {
    try {
        const raw = localStorage.getItem(ADDR_KEY);
        return raw ? JSON.parse(raw) : getDefaultAddresses();
    } catch {
        return getDefaultAddresses();
    }
}

function saveLocalAddresses(items: UserAddress[]): void {
    localStorage.setItem(ADDR_KEY, JSON.stringify(items));
}

function getDefaultAddresses(): UserAddress[] {
    return [
        {
            id: 'addr_default',
            name: '张三',
            phone: '138****8888',
            province: '浙江省',
            city: '杭州市',
            district: '西湖区',
            detail: '文三路 268 号创业大厦 18 楼',
            is_default: true,
        }
    ];
}

export async function getAddresses(): Promise<UserAddress[]> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalAddresses();
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return getLocalAddresses();

        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error || !data || data.length === 0) return getLocalAddresses();
        return data;
    } catch {
        return getLocalAddresses();
    }
}

export async function getDefaultAddress(): Promise<UserAddress | null> {
    const addrs = await getAddresses();
    return addrs.find(a => a.is_default) || addrs[0] || null;
}

export async function addAddress(address: Omit<UserAddress, 'id'>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        const addrs = getLocalAddresses();
        if (address.is_default) {
            addrs.forEach(a => a.is_default = false);
        }
        addrs.push({ ...address, id: `addr_${Date.now()}` });
        saveLocalAddresses(addrs);
        return true;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const addrs = getLocalAddresses();
            if (address.is_default) addrs.forEach(a => a.is_default = false);
            addrs.push({ ...address, id: `addr_${Date.now()}` });
            saveLocalAddresses(addrs);
            return true;
        }

        if (address.is_default) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        await supabase
            .from('user_addresses')
            .insert({ ...address, user_id: user.id });
        return true;
    } catch {
        const addrs = getLocalAddresses();
        if (address.is_default) addrs.forEach(a => a.is_default = false);
        addrs.push({ ...address, id: `addr_${Date.now()}` });
        saveLocalAddresses(addrs);
        return true;
    }
}

export async function updateAddress(id: string, address: Partial<UserAddress>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        const addrs = getLocalAddresses();
        const idx = addrs.findIndex(a => a.id === id);
        if (idx !== -1) {
            if (address.is_default) {
                addrs.forEach(a => a.is_default = false);
            }
            addrs[idx] = { ...addrs[idx], ...address };
            saveLocalAddresses(addrs);
        }
        return true;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const addrs = getLocalAddresses();
            const idx = addrs.findIndex(a => a.id === id);
            if (idx !== -1) {
                if (address.is_default) addrs.forEach(a => a.is_default = false);
                addrs[idx] = { ...addrs[idx], ...address };
                saveLocalAddresses(addrs);
            }
            return true;
        }

        if (address.is_default) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        await supabase
            .from('user_addresses')
            .update(address)
            .eq('id', id);
        return true;
    } catch {
        const addrs = getLocalAddresses();
        const idx = addrs.findIndex(a => a.id === id);
        if (idx !== -1) {
            if (address.is_default) addrs.forEach(a => a.is_default = false);
            addrs[idx] = { ...addrs[idx], ...address };
            saveLocalAddresses(addrs);
        }
        return true;
    }
}

export async function deleteAddress(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        const addrs = getLocalAddresses().filter(a => a.id !== id);
        saveLocalAddresses(addrs);
        return true;
    }

    try {
        await supabase
            .from('user_addresses')
            .delete()
            .eq('id', id);
        return true;
    } catch {
        const addrs = getLocalAddresses().filter(a => a.id !== id);
        saveLocalAddresses(addrs);
        return true;
    }
}

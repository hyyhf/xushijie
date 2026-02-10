import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    selected: boolean;
    specs: Record<string, string>;
    // Joined product fields
    title?: string;
    price?: number;
    image_url?: string;
    stock?: number;
}

const CART_STORAGE_KEY = 'virtual_horizon_cart';

function getLocalCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalCart(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function addToLocalCart(productId: string, quantity: number, specs: Record<string, string>): boolean {
    const cart = getLocalCart();
    const existing = cart.find(i => i.product_id === productId && JSON.stringify(i.specs) === JSON.stringify(specs));
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: `local_${Date.now()}`,
            product_id: productId,
            quantity,
            selected: true,
            specs,
        });
    }
    saveLocalCart(cart);
    return true;
}

// Get all cart items
export async function getCartItems(): Promise<CartItem[]> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalCart();
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return getLocalCart();

        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                id, product_id, quantity, selected, specs,
                products (title, price, image_url, stock)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error || !data) return getLocalCart();

        return data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            selected: item.selected,
            specs: item.specs || {},
            title: item.products?.title,
            price: item.products?.price,
            image_url: item.products?.image_url,
            stock: item.products?.stock || 999,
        }));
    } catch {
        return getLocalCart();
    }
}

// Add item to cart
export async function addToCart(productId: string, quantity: number = 1, specs: Record<string, string> = {}): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return addToLocalCart(productId, quantity, specs);
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return addToLocalCart(productId, quantity, specs);

        // Check if item already exists
        const { data: existing, error: checkError } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (checkError) {
            // Table might not exist, fall back to localStorage
            return addToLocalCart(productId, quantity, specs);
        }

        if (existing) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id);
            if (error) return addToLocalCart(productId, quantity, specs);
        } else {
            const { error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity,
                    selected: true,
                    specs,
                });
            if (error) return addToLocalCart(productId, quantity, specs);
        }
        return true;
    } catch {
        // Supabase failed, fall back to localStorage
        return addToLocalCart(productId, quantity, specs);
    }
}

// Update quantity
export async function updateCartQuantity(itemId: string, quantity: number): Promise<boolean> {
    // Always update localStorage for local_ items
    const cart = getLocalCart();
    const localItem = cart.find(i => i.id === itemId);
    if (localItem) {
        localItem.quantity = Math.max(1, quantity);
        saveLocalCart(cart);
        return true;
    }

    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        await supabase
            .from('cart_items')
            .update({ quantity: Math.max(1, quantity) })
            .eq('id', itemId);
        return true;
    } catch {
        return true;
    }
}

// Toggle selected
export async function toggleCartItemSelected(itemId: string, selected: boolean): Promise<boolean> {
    // Always update localStorage for local_ items
    const cart = getLocalCart();
    const localItem = cart.find(i => i.id === itemId);
    if (localItem) {
        localItem.selected = selected;
        saveLocalCart(cart);
        return true;
    }

    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        await supabase
            .from('cart_items')
            .update({ selected })
            .eq('id', itemId);
        return true;
    } catch {
        return true;
    }
}

// Toggle all selected
export async function toggleAllSelected(selected: boolean): Promise<boolean> {
    // Always update local cart
    const cart = getLocalCart();
    cart.forEach(i => i.selected = selected);
    saveLocalCart(cart);

    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return true;

        await supabase
            .from('cart_items')
            .update({ selected })
            .eq('user_id', user.id);
        return true;
    } catch {
        return true;
    }
}

// Remove item
export async function removeFromCart(itemId: string): Promise<boolean> {
    // Always remove from local cart
    const cart = getLocalCart().filter(i => i.id !== itemId);
    saveLocalCart(cart);

    if (!isSupabaseConfigured || !supabase || itemId.startsWith('local_')) {
        return true;
    }

    try {
        await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);
        return true;
    } catch {
        return true;
    }
}

// Remove selected items
export async function removeSelectedItems(): Promise<boolean> {
    // Always remove from local cart
    const cart = getLocalCart().filter(i => !i.selected);
    saveLocalCart(cart);

    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return true;

        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('selected', true);
        return true;
    } catch {
        return true;
    }
}

// Get cart count
export async function getCartCount(): Promise<number> {
    // Always use local cart count as the source of truth for local items
    const localCount = getLocalCart().reduce((sum, i) => sum + i.quantity, 0);

    if (!isSupabaseConfigured || !supabase) {
        return localCount;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return localCount;

        const { data, error } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id);

        if (error || !data) return localCount;

        const supabaseCount = data.reduce((sum: number, i: any) => sum + i.quantity, 0);
        return supabaseCount + localCount;
    } catch {
        return localCount;
    }
}

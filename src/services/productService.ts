import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Product {
    id: string;
    title: string;
    price: number;
    category_id: string | null;
    image_url: string;
    sales: number;
    rating: number;
    tag: string | null;
}

export interface Category {
    id: string;
    name: string;
    display_order: number;
}

// Get categories
export async function getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) {
        return getMockCategories();
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order');

        if (error || !data || data.length === 0) return getMockCategories();
        return data;
    } catch {
        return getMockCategories();
    }
}

// Get products with optional filtering and sorting
export async function getProducts(options?: {
    categoryId?: string;
    sortBy?: 'sales' | 'price' | 'rating';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
}): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
        return getMockProducts(options);
    }

    try {
        let query = supabase.from('products').select('*');

        if (options?.categoryId && options.categoryId !== 'all') {
            query = query.eq('category_id', options.categoryId);
        }

        if (options?.sortBy) {
            query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
        } else {
            query = query.order('sales', { ascending: false });
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) return getMockProducts(options);
        return data;
    } catch {
        return getMockProducts(options);
    }
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return data;
    } catch {
        return null;
    }
}

// Get hot/featured products
export async function getHotProducts(limit: number = 3): Promise<Product[]> {
    return getProducts({ sortBy: 'sales', sortOrder: 'desc', limit });
}

// Mock data for development
function getMockCategories(): Category[] {
    return [
        { id: 'all', name: '全部', display_order: 0 },
        { id: 'beauty', name: '美妆个护', display_order: 1 },
        { id: 'fashion', name: '时尚穿搭', display_order: 2 },
        { id: 'tech', name: '数码3C', display_order: 3 },
        { id: 'home', name: '家居生活', display_order: 4 },
        { id: 'food', name: '美食饮品', display_order: 5 },
    ];
}

function getMockProducts(options?: { limit?: number }): Product[] {
    const products: Product[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `mock-${i}`,
        title: i % 2 === 0 ? '主播同款高级感西装外套' : '夏季清爽控油定妆散粉',
        price: i % 2 === 0 ? 299 : 89,
        category_id: null,
        image_url: `https://picsum.photos/300/300?random=${i + 100}`,
        sales: i * 100 + 50,
        rating: 4.8,
        tag: i % 3 === 0 ? '直播特价' : i % 3 === 1 ? '新品' : ''
    }));

    if (options?.limit) {
        return products.slice(0, options.limit);
    }
    return products;
}

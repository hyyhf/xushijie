import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Product {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    category_id: string | null;
    image_url: string;
    images?: string[];
    sales: number;
    rating: number;
    tag: string | null;
    stock?: number;
    description?: string;
    specs?: { name: string; options: string[] }[];
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
    // Always check mock data first for local IDs
    const mockProduct = MOCK_PRODUCT_DATA.find(p => p.id === id);

    if (!isSupabaseConfigured || !supabase) {
        return mockProduct || null;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return mockProduct || null;
        return data;
    } catch {
        return mockProduct || null;
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

// Real product data with authentic images
const MOCK_PRODUCT_DATA: Product[] = [
    {
        id: 'p1',
        title: 'MAC 哑光唇膏 #316 热门色号',
        price: 230,
        category_id: 'beauty',
        image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop',
        sales: 2380,
        rating: 4.9,
        tag: '直播特价'
    },
    {
        id: 'p2',
        title: '兰蔻小黑瓶面部精华 100ml',
        price: 849,
        category_id: 'beauty',
        image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
        sales: 1890,
        rating: 4.8,
        tag: '爆款'
    },
    {
        id: 'p3',
        title: '修身西装外套 黑色百搭款',
        price: 399,
        category_id: 'fashion',
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
        sales: 1560,
        rating: 4.7,
        tag: '新品'
    },
    {
        id: 'p4',
        title: '夏季清爽控油定妆散粉',
        price: 89,
        category_id: 'beauty',
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
        sales: 3200,
        rating: 4.6,
        tag: '直播特价'
    },
    {
        id: 'p5',
        title: 'Sony WH-1000XM5 降噪耳机',
        price: 2699,
        category_id: 'tech',
        image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop',
        sales: 980,
        rating: 4.9,
        tag: '新品'
    },
    {
        id: 'p6',
        title: '真丝碎花连衣裙 长款',
        price: 599,
        category_id: 'fashion',
        image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop',
        sales: 1100,
        rating: 4.8,
        tag: ''
    },
    {
        id: 'p7',
        title: 'Apple Watch Ultra 2 智能手表',
        price: 6499,
        category_id: 'tech',
        image_url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=300&h=300&fit=crop',
        sales: 760,
        rating: 4.9,
        tag: '爆款'
    },
    {
        id: 'p8',
        title: '北欧简约香薰蜡烛 礼盒装',
        price: 128,
        category_id: 'home',
        image_url: 'https://images.unsplash.com/photo-1602607688066-6a824b79be3f?w=300&h=300&fit=crop',
        sales: 2100,
        rating: 4.7,
        tag: '直播特价'
    },
    {
        id: 'p9',
        title: '进口混合坚果大礼包 1000g',
        price: 68,
        category_id: 'food',
        image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop',
        sales: 5600,
        rating: 4.5,
        tag: '热销'
    },
    {
        id: 'p10',
        title: '日式手工陶瓷餐具套装',
        price: 259,
        category_id: 'home',
        image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop',
        sales: 890,
        rating: 4.8,
        tag: '新品'
    }
];

function getMockProducts(options?: { categoryId?: string; sortBy?: string; sortOrder?: string; limit?: number }): Product[] {
    let products = [...MOCK_PRODUCT_DATA];

    if (options?.categoryId && options.categoryId !== 'all') {
        products = products.filter(p => p.category_id === options.categoryId);
    }

    if (options?.sortBy) {
        const key = options.sortBy as keyof Product;
        const ascending = options.sortOrder === 'asc';
        products.sort((a, b) => {
            const va = a[key] as number;
            const vb = b[key] as number;
            return ascending ? va - vb : vb - va;
        });
    }

    if (options?.limit) {
        return products.slice(0, options.limit);
    }
    return products;
}

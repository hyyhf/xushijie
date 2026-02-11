import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ==================== Types ====================

export interface CouponTemplate {
    id: string;
    title: string;
    type: 'fixed' | 'percent';
    discount_amount: number;
    min_spend: number;
    total_count: number;
    claimed_count: number;
    start_time: string;
    end_time: string;
    live_room_id: string;
    is_active: boolean;
}

export interface UserCoupon {
    id: string;
    user_id: string;
    coupon_template_id: string;
    status: 'unused' | 'used' | 'expired';
    claimed_at: string;
    used_at?: string;
    order_id?: string;
    // Joined fields
    template?: CouponTemplate;
}

export interface LiveProduct {
    id: string;
    live_room_id: string;
    product_id: string;
    live_price: number;
    sort_order: number;
    is_current: boolean;
    stock_limit: number;
    sold_count: number;
    // Joined fields
    title?: string;
    price?: number;
    image_url?: string;
    sales?: number;
    rating?: number;
    tag?: string;
}

// ==================== Local Storage Keys ====================
const COUPONS_KEY = 'virtual_horizon_user_coupons';
const COUPON_TEMPLATES_KEY = 'virtual_horizon_coupon_templates';

// ==================== Mock Data ====================

const MOCK_COUPON_TEMPLATES: CouponTemplate[] = [
    {
        id: 'ct1',
        title: '新人专享券',
        type: 'fixed',
        discount_amount: 10,
        min_spend: 50,
        total_count: 200,
        claimed_count: 45,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString(),
        live_room_id: 'default',
        is_active: true,
    },
    {
        id: 'ct2',
        title: '直播间满减券',
        type: 'fixed',
        discount_amount: 30,
        min_spend: 200,
        total_count: 100,
        claimed_count: 23,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString(),
        live_room_id: 'default',
        is_active: true,
    },
    {
        id: 'ct3',
        title: '限时折扣券',
        type: 'fixed',
        discount_amount: 50,
        min_spend: 300,
        total_count: 50,
        claimed_count: 12,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString(),
        live_room_id: 'default',
        is_active: true,
    },
    {
        id: 'ct4',
        title: '超级大额券',
        type: 'fixed',
        discount_amount: 100,
        min_spend: 500,
        total_count: 20,
        claimed_count: 5,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString(),
        live_room_id: 'default',
        is_active: true,
    },
];

// Mock live room products
const MOCK_LIVE_PRODUCTS: LiveProduct[] = [
    {
        id: 'lp1', live_room_id: 'default', product_id: 'p1',
        live_price: 189, sort_order: 0, is_current: true,
        stock_limit: 50, sold_count: 23,
        title: 'MAC 哑光唇膏 #316 热门色号', price: 230,
        image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop',
        sales: 2380, rating: 4.9, tag: '直播特价'
    },
    {
        id: 'lp2', live_room_id: 'default', product_id: 'p2',
        live_price: 699, sort_order: 1, is_current: false,
        stock_limit: 30, sold_count: 12,
        title: '兰蔻小黑瓶面部精华 100ml', price: 849,
        image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
        sales: 1890, rating: 4.8, tag: '爆款'
    },
    {
        id: 'lp3', live_room_id: 'default', product_id: 'p3',
        live_price: 299, sort_order: 2, is_current: false,
        stock_limit: 100, sold_count: 45,
        title: '修身西装外套 黑色百搭款', price: 399,
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
        sales: 1560, rating: 4.7, tag: '新品'
    },
    {
        id: 'lp4', live_room_id: 'default', product_id: 'p5',
        live_price: 2199, sort_order: 3, is_current: false,
        stock_limit: 20, sold_count: 8,
        title: 'Sony WH-1000XM5 降噪耳机', price: 2699,
        image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop',
        sales: 980, rating: 4.9, tag: '新品'
    },
    {
        id: 'lp5', live_room_id: 'default', product_id: 'p4',
        live_price: 59, sort_order: 4, is_current: false,
        stock_limit: 200, sold_count: 156,
        title: '夏季清爽控油定妆散粉', price: 89,
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
        sales: 3200, rating: 4.6, tag: '直播特价'
    },
    {
        id: 'lp6', live_room_id: 'default', product_id: 'p9',
        live_price: 39, sort_order: 5, is_current: false,
        stock_limit: 500, sold_count: 312,
        title: '进口混合坚果大礼包 1000g', price: 68,
        image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop',
        sales: 5600, rating: 4.5, tag: '热销'
    },
];

// ==================== Local Storage Helpers ====================

function getLocalUserCoupons(): UserCoupon[] {
    try {
        const saved = localStorage.getItem(COUPONS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
}

function saveLocalUserCoupons(coupons: UserCoupon[]) {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
}

function getLocalTemplates(): CouponTemplate[] {
    try {
        const saved = localStorage.getItem(COUPON_TEMPLATES_KEY);
        if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    // Initialize with mock data
    localStorage.setItem(COUPON_TEMPLATES_KEY, JSON.stringify(MOCK_COUPON_TEMPLATES));
    return [...MOCK_COUPON_TEMPLATES];
}

function saveLocalTemplates(templates: CouponTemplate[]) {
    localStorage.setItem(COUPON_TEMPLATES_KEY, JSON.stringify(templates));
}

// ==================== API Functions ====================

/** 获取直播间可领取的优惠券列表 */
export async function getLiveCoupons(liveRoomId: string = 'default'): Promise<CouponTemplate[]> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalTemplates().filter(t => t.live_room_id === liveRoomId && t.is_active);
    }

    try {
        const { data, error } = await supabase
            .from('coupon_templates')
            .select('*')
            .eq('live_room_id', liveRoomId)
            .eq('is_active', true)
            .order('discount_amount', { ascending: true });

        if (error || !data || data.length === 0) {
            return getLocalTemplates().filter(t => t.live_room_id === liveRoomId && t.is_active);
        }
        return data;
    } catch {
        return getLocalTemplates().filter(t => t.live_room_id === liveRoomId && t.is_active);
    }
}

/** 用户领取/抢优惠券 */
export async function claimCoupon(couponTemplateId: string): Promise<{ success: boolean; message: string; coupon?: UserCoupon }> {
    // Local mode
    if (!isSupabaseConfigured || !supabase) {
        const templates = getLocalTemplates();
        const template = templates.find(t => t.id === couponTemplateId);
        if (!template) return { success: false, message: '优惠券不存在' };

        const userCoupons = getLocalUserCoupons();
        const alreadyClaimed = userCoupons.find(c => c.coupon_template_id === couponTemplateId);
        if (alreadyClaimed) return { success: false, message: '您已领取过该优惠券' };

        if (template.claimed_count >= template.total_count) {
            return { success: false, message: '优惠券已被领完' };
        }

        // Update template claimed count
        template.claimed_count += 1;
        saveLocalTemplates(templates);

        // Create user coupon
        const newCoupon: UserCoupon = {
            id: `uc_${Date.now()}`,
            user_id: 'local',
            coupon_template_id: couponTemplateId,
            status: 'unused',
            claimed_at: new Date().toISOString(),
            template,
        };
        userCoupons.push(newCoupon);
        saveLocalUserCoupons(userCoupons);

        return { success: true, message: '领取成功！', coupon: newCoupon };
    }

    // Supabase mode
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: '请先登录' };

        // Check if already claimed
        const { data: existing } = await supabase
            .from('user_coupons')
            .select('id')
            .eq('user_id', user.id)
            .eq('coupon_template_id', couponTemplateId)
            .single();

        if (existing) return { success: false, message: '您已领取过该优惠券' };

        // Check availability
        const { data: template } = await supabase
            .from('coupon_templates')
            .select('*')
            .eq('id', couponTemplateId)
            .single();

        if (!template) return { success: false, message: '优惠券不存在' };
        if (template.claimed_count >= template.total_count) {
            return { success: false, message: '优惠券已被领完' };
        }

        // Claim
        const { data: coupon, error } = await supabase
            .from('user_coupons')
            .insert({ user_id: user.id, coupon_template_id: couponTemplateId })
            .select()
            .single();

        if (error) return { success: false, message: '领取失败，请重试' };

        // Increment claimed count
        await supabase
            .from('coupon_templates')
            .update({ claimed_count: template.claimed_count + 1 })
            .eq('id', couponTemplateId);

        return { success: true, message: '领取成功！', coupon };
    } catch {
        return { success: false, message: '网络错误，请重试' };
    }
}

/** 获取用户的优惠券列表 */
export async function getUserCoupons(): Promise<UserCoupon[]> {
    if (!isSupabaseConfigured || !supabase) {
        const coupons = getLocalUserCoupons();
        const templates = getLocalTemplates();
        return coupons.map(c => ({
            ...c,
            template: templates.find(t => t.id === c.coupon_template_id),
        }));
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return getLocalUserCoupons();

        const { data, error } = await supabase
            .from('user_coupons')
            .select('*, template:coupon_templates(*)')
            .eq('user_id', user.id)
            .order('claimed_at', { ascending: false });

        if (error || !data) return getLocalUserCoupons();
        return data.map((c: any) => ({ ...c, template: c.template }));
    } catch {
        return getLocalUserCoupons();
    }
}

/** 获取可用于指定金额的优惠券 */
export async function getAvailableCoupons(totalAmount: number): Promise<UserCoupon[]> {
    const coupons = await getUserCoupons();
    return coupons.filter(c => {
        if (c.status !== 'unused') return false;
        if (!c.template) return false;
        return totalAmount >= c.template.min_spend;
    });
}

/** 获取所有用户优惠券（含不可用的，用于展示） */
export async function getAllUserCouponsForCheckout(totalAmount: number): Promise<{ available: UserCoupon[]; unavailable: UserCoupon[] }> {
    const coupons = await getUserCoupons();
    const available: UserCoupon[] = [];
    const unavailable: UserCoupon[] = [];

    coupons.forEach(c => {
        if (c.status !== 'unused' || !c.template) {
            unavailable.push(c);
        } else if (totalAmount >= c.template.min_spend) {
            available.push(c);
        } else {
            unavailable.push(c);
        }
    });

    // Sort available by discount amount descending
    available.sort((a, b) => (b.template?.discount_amount || 0) - (a.template?.discount_amount || 0));

    return { available, unavailable };
}

/** 标记优惠券为已使用 */
export async function useCoupon(couponId: string, orderId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        const coupons = getLocalUserCoupons();
        const coupon = coupons.find(c => c.id === couponId);
        if (coupon) {
            coupon.status = 'used';
            coupon.used_at = new Date().toISOString();
            coupon.order_id = orderId;
            saveLocalUserCoupons(coupons);
        }
        return true;
    }

    try {
        const { error } = await supabase
            .from('user_coupons')
            .update({ status: 'used', used_at: new Date().toISOString(), order_id: orderId })
            .eq('id', couponId);

        return !error;
    } catch {
        return false;
    }
}

/** 计算优惠券折扣金额 */
export function calculateDiscount(coupon: UserCoupon | null, subtotal: number): number {
    if (!coupon || !coupon.template) return 0;
    if (subtotal < coupon.template.min_spend) return 0;

    if (coupon.template.type === 'fixed') {
        return Math.min(coupon.template.discount_amount, subtotal);
    } else if (coupon.template.type === 'percent') {
        return Math.round(subtotal * coupon.template.discount_amount / 100 * 100) / 100;
    }
    return 0;
}

/** 获取直播间商品列表 */
export async function getLiveProducts(liveRoomId: string = 'default'): Promise<LiveProduct[]> {
    if (!isSupabaseConfigured || !supabase) {
        return MOCK_LIVE_PRODUCTS.filter(p => p.live_room_id === liveRoomId);
    }

    try {
        const { data, error } = await supabase
            .from('live_products')
            .select('*, product:products(title, price, image_url, sales, rating, tag)')
            .eq('live_room_id', liveRoomId)
            .order('sort_order');

        if (error || !data || data.length === 0) {
            return MOCK_LIVE_PRODUCTS.filter(p => p.live_room_id === liveRoomId);
        }

        return data.map((item: any) => ({
            ...item,
            title: item.product?.title,
            price: item.product?.price,
            image_url: item.product?.image_url,
            sales: item.product?.sales,
            rating: item.product?.rating,
            tag: item.product?.tag,
        }));
    } catch {
        return MOCK_LIVE_PRODUCTS.filter(p => p.live_room_id === liveRoomId);
    }
}

/** 检查用户是否已领取某张优惠券 */
export function isTemplateClaimed(templateId: string, userCoupons: UserCoupon[]): boolean {
    return userCoupons.some(c => c.coupon_template_id === templateId);
}

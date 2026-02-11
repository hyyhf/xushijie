import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserAddress } from './addressService';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
    id: string;
    product_id: string;
    title: string;
    price: number;
    quantity: number;
    image_url: string;
    specs: Record<string, string>;
}

export interface Order {
    id: string;
    order_no: string;
    status: OrderStatus;
    total: number;
    shipping_fee: number;
    discount: number;
    coupon_id?: string;
    coupon_discount?: number;
    address_snapshot: UserAddress;
    payment_method: string;
    items: OrderItem[];
    paid_at?: string;
    shipped_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    created_at: string;
}

const ORDER_KEY = 'virtual_horizon_orders';

function generateOrderNo(): string {
    const now = new Date();
    const ts = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return ts + rand;
}

function getLocalOrders(): Order[] {
    try {
        const raw = localStorage.getItem(ORDER_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalOrders(orders: Order[]): void {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

export interface CreateOrderParams {
    items: {
        product_id: string;
        title: string;
        price: number;
        quantity: number;
        image_url: string;
        specs?: Record<string, string>;
    }[];
    address: UserAddress;
    shipping_fee?: number;
    discount?: number;
    payment_method?: string;
    coupon_id?: string;
}

// Create order
export async function createOrder(params: CreateOrderParams): Promise<Order | null> {
    const total = params.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        + (params.shipping_fee || 0)
        - (params.discount || 0);

    const orderNo = generateOrderNo();
    const now = new Date().toISOString();

    const order: Order = {
        id: `order_${Date.now()}`,
        order_no: orderNo,
        status: 'pending',
        total: Math.max(0, total),
        shipping_fee: params.shipping_fee || 0,
        discount: params.discount || 0,
        coupon_id: params.coupon_id,
        coupon_discount: params.discount || 0,
        address_snapshot: params.address,
        payment_method: params.payment_method || '',
        items: params.items.map((item, idx) => ({
            id: `oi_${Date.now()}_${idx}`,
            product_id: item.product_id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            specs: item.specs || {},
        })),
        created_at: now,
    };

    if (!isSupabaseConfigured || !supabase) {
        const orders = getLocalOrders();
        orders.unshift(order);
        saveLocalOrders(orders);
        return order;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const orders = getLocalOrders();
            orders.unshift(order);
            saveLocalOrders(orders);
            return order;
        }

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                order_no: orderNo,
                status: 'pending',
                total: order.total,
                shipping_fee: order.shipping_fee,
                discount: order.discount,
                coupon_id: params.coupon_id || null,
                coupon_discount: params.discount || 0,
                address_snapshot: params.address,
                payment_method: params.payment_method || '',
            })
            .select()
            .single();

        if (orderError || !orderData) {
            const orders = getLocalOrders();
            orders.unshift(order);
            saveLocalOrders(orders);
            return order;
        }

        // Insert order items
        // Filter out invalid product IDs for Supabase (e.g. mock 'p1') or set to null
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        const orderItems = params.items.map(item => ({
            order_id: orderData.id,
            product_id: uuidRegex.test(item.product_id) ? item.product_id : null,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            specs: item.specs || {},
        }));

        await supabase.from('order_items').insert(orderItems);

        order.id = orderData.id;
        // Also save locally for quick access
        const orders = getLocalOrders();
        orders.unshift(order);
        saveLocalOrders(orders);

        return order;
    } catch {
        const orders = getLocalOrders();
        orders.unshift(order);
        saveLocalOrders(orders);
        return order;
    }
}

// Get orders
export async function getOrders(status?: OrderStatus): Promise<Order[]> {
    if (!isSupabaseConfigured || !supabase) {
        let orders = getLocalOrders();
        if (status) orders = orders.filter(o => o.status === status);
        return orders;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return getLocalOrders().filter(o => !status || o.status === status);

        let query = supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            return getLocalOrders().filter(o => !status || o.status === status);
        }

        // Fetch order items for each order
        const orderIds = data.map((o: any) => o.id);
        const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        return data.map((o: any) => ({
            ...o,
            items: (itemsData || []).filter((i: any) => i.order_id === o.id),
        }));
    } catch {
        return getLocalOrders().filter(o => !status || o.status === status);
    }
}

// Get single order
export async function getOrderById(orderId: string): Promise<Order | null> {
    const orders = await getOrders();
    return orders.find(o => o.id === orderId || o.order_no === orderId) || null;
}

// Simulate payment
export async function simulatePayment(orderId: string, method: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured || !supabase) {
        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'paid';
            order.payment_method = method;
            order.paid_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }

    try {
        await supabase
            .from('orders')
            .update({ status: 'paid', payment_method: method, paid_at: now })
            .eq('id', orderId);

        // Also update local
        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'paid';
            order.payment_method = method;
            order.paid_at = now;
            saveLocalOrders(orders);
        }
        return true;
    } catch {
        // Supabase failed, fall back to localStorage
        const orders = getLocalOrders();
        const localOrder = orders.find(o => o.id === orderId);
        if (localOrder) {
            localOrder.status = 'paid';
            localOrder.payment_method = method;
            localOrder.paid_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }
}

// Cancel order
export async function cancelOrder(orderId: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured || !supabase) {
        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === 'pending') {
            order.status = 'cancelled';
            order.cancelled_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }

    try {
        await supabase
            .from('orders')
            .update({ status: 'cancelled', cancelled_at: now })
            .eq('id', orderId)
            .eq('status', 'pending');

        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cancelled';
            order.cancelled_at = now;
            saveLocalOrders(orders);
        }
        return true;
    } catch {
        const orders = getLocalOrders();
        const localOrder = orders.find(o => o.id === orderId);
        if (localOrder && localOrder.status === 'pending') {
            localOrder.status = 'cancelled';
            localOrder.cancelled_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }
}

// Confirm receive
export async function confirmReceive(orderId: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured || !supabase) {
        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            order.completed_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }

    try {
        await supabase
            .from('orders')
            .update({ status: 'completed', completed_at: now })
            .eq('id', orderId);

        const orders = getLocalOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            order.completed_at = now;
            saveLocalOrders(orders);
        }
        return true;
    } catch {
        const orders = getLocalOrders();
        const localOrder = orders.find(o => o.id === orderId);
        if (localOrder) {
            localOrder.status = 'completed';
            localOrder.completed_at = now;
            saveLocalOrders(orders);
        }
        return true;
    }
}

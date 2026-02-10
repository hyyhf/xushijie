import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Loader2, Package, ChevronRight } from 'lucide-react';
import { AppScreen } from '../types';
import { Order, OrderStatus, getOrders } from '../src/services/orderService';

interface OrderListScreenProps {
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
    { label: '全部', value: 'all' },
    { label: '待付款', value: 'pending' },
    { label: '待发货', value: 'paid' },
    { label: '待收货', value: 'shipped' },
    { label: '已完成', value: 'completed' },
];

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
    pending: { text: '待付款', color: 'text-orange-500' },
    paid: { text: '待发货', color: 'text-blue-500' },
    shipped: { text: '待收货', color: 'text-green-500' },
    completed: { text: '已完成', color: 'text-gray-500' },
    cancelled: { text: '已取消', color: 'text-red-400' },
};

const OrderListScreen: React.FC<OrderListScreenProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        const status = activeTab === 'all' ? undefined : activeTab;
        const data = await getOrders(status);
        setOrders(data);
        setLoading(false);
    }, [activeTab]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
                <div className="px-4 py-3 flex items-center">
                    <button onClick={() => onNavigate(AppScreen.PROFILE)} className="w-8 h-8 flex items-center justify-center">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="flex-1 text-center text-base font-medium">我的订单</span>
                    <div className="w-8" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${activeTab === tab.value ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            {tab.label}
                            {activeTab === tab.value && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Package size={64} className="text-gray-200" />
                    <p className="text-gray-400 text-sm">暂无订单</p>
                    <button onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)} className="px-6 py-2 bg-primary-500 text-white rounded-full text-sm">
                        去逛逛
                    </button>
                </div>
            ) : (
                <div className="p-3 space-y-3">
                    {orders.map((order) => {
                        const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: 'text-gray-500' };
                        return (
                            <button
                                key={order.id}
                                onClick={() => onNavigate(AppScreen.ORDER_DETAIL, { orderId: order.id })}
                                className="bg-white rounded-xl p-4 w-full text-left block"
                            >
                                {/* Order header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">虚视界商城</span>
                                    </div>
                                    <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                                </div>

                                {/* Items preview */}
                                {order.items?.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex gap-3 mb-2">
                                        <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm text-slate-700 line-clamp-1">{item.title}</h4>
                                            <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="text-xs text-red-500">¥</span>
                                            <span className="text-sm text-red-500 font-bold">{item.price}</span>
                                        </div>
                                    </div>
                                ))}

                                {(order.items?.length || 0) > 2 && (
                                    <p className="text-xs text-gray-400 mb-2">... 共 {order.items.length} 件商品</p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400">{order.created_at ? formatDate(order.created_at) : ''}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-600">共 {order.items?.reduce((s, i) => s + i.quantity, 0) || 0} 件</span>
                                        <span className="text-xs text-gray-600">合计:</span>
                                        <span className="text-red-500 text-xs font-bold">¥{order.total.toFixed(2)}</span>
                                        <ChevronRight size={14} className="text-gray-400" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderListScreen;

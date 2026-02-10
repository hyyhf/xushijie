import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Loader2, Package, Truck, Check, X, CreditCard, Copy } from 'lucide-react';
import { AppScreen } from '../types';
import { Order, getOrderById, cancelOrder, confirmReceive, simulatePayment } from '../src/services/orderService';

interface OrderDetailScreenProps {
    orderId: string;
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: '等待付款', color: 'text-orange-500', icon: <CreditCard size={20} /> },
    paid: { label: '等待发货', color: 'text-blue-500', icon: <Package size={20} /> },
    shipped: { label: '运输中', color: 'text-green-500', icon: <Truck size={20} /> },
    completed: { label: '交易完成', color: 'text-gray-500', icon: <Check size={20} /> },
    cancelled: { label: '已取消', color: 'text-red-400', icon: <X size={20} /> },
};

const STEPS = ['下单', '付款', '发货', '收货', '完成'];
const STATUS_STEP_MAP: Record<string, number> = {
    pending: 1,
    paid: 2,
    shipped: 3,
    completed: 4,
    cancelled: -1,
};

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ orderId, onNavigate }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const o = await getOrderById(orderId);
            setOrder(o);
            setLoading(false);
        };
        load();
    }, [orderId]);

    const handleCancel = async () => {
        if (!order) return;
        setActionLoading(true);
        await cancelOrder(order.id);
        const updated = await getOrderById(order.id);
        setOrder(updated);
        setActionLoading(false);
    };

    const handlePayNow = async () => {
        if (!order) return;
        onNavigate(AppScreen.PAYMENT, { orderId: order.id, total: order.total, payMethod: order.payment_method || 'alipay' });
    };

    const handleConfirmReceive = async () => {
        if (!order) return;
        setActionLoading(true);
        await confirmReceive(order.id);
        const updated = await getOrderById(order.id);
        setOrder(updated);
        setActionLoading(false);
    };

    const copyOrderNo = () => {
        if (order) {
            navigator.clipboard?.writeText(order.order_no);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400">订单不存在</p>
                <button onClick={() => onNavigate(AppScreen.ORDER_LIST)} className="text-primary-500 text-sm">返回订单列表</button>
            </div>
        );
    }

    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const currentStep = STATUS_STEP_MAP[order.status] || 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.ORDER_LIST)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center text-base font-medium">订单详情</span>
                <div className="w-8" />
            </div>

            {/* Status banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                    {statusInfo.icon}
                    <span className="text-lg font-bold">{statusInfo.label}</span>
                </div>
                {/* Progress bar */}
                {order.status !== 'cancelled' && (
                    <div className="flex items-center justify-between mt-2 relative">
                        {/* Background line */}
                        <div className="absolute top-2 left-0 right-0 h-0.5 bg-white/30 rounded" />
                        <div className="absolute top-2 left-0 h-0.5 bg-white rounded transition-all" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
                        {STEPS.map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 relative z-10">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${i <= currentStep ? 'bg-white text-red-500' : 'bg-white/30 text-white/60'}`}>
                                    {i <= currentStep ? '&#10003;' : i + 1}
                                </div>
                                <span className={`text-[10px] ${i <= currentStep ? 'text-white' : 'text-white/50'}`}>{step}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address */}
            {order.address_snapshot && (
                <div className="bg-white mx-3 mt-3 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />
                    <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-red-500 mt-0.5" />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{order.address_snapshot.name}</span>
                                <span className="text-sm text-gray-500">{order.address_snapshot.phone}</span>
                            </div>
                            <p className="text-xs text-gray-500">{order.address_snapshot.province}{order.address_snapshot.city}{order.address_snapshot.district} {order.address_snapshot.detail}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">官方直营</span>
                    <span className="text-sm font-medium text-slate-700">虚视界商城</span>
                </div>

                {order.items?.map((item, idx) => (
                    <div key={item.id} className={`flex gap-3 py-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                        <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-slate-700 line-clamp-2">{item.title}</h4>
                            <div className="flex items-end justify-between mt-2">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-red-500 text-xs">¥</span>
                                    <span className="text-red-500 text-sm font-bold">{item.price}</span>
                                </div>
                                <span className="text-xs text-gray-400">x{item.quantity}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order info */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">订单编号</span>
                    <button onClick={copyOrderNo} className="flex items-center gap-1 text-slate-700">
                        {order.order_no}
                        <Copy size={12} className="text-gray-400" />
                        {copied && <span className="text-green-500 text-[10px]">已复制</span>}
                    </button>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">下单时间</span>
                    <span className="text-slate-700">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">支付方式</span>
                    <span className="text-slate-700">{order.payment_method || '-'}</span>
                </div>
                {order.paid_at && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">付款时间</span>
                        <span className="text-slate-700">{formatDate(order.paid_at)}</span>
                    </div>
                )}
            </div>

            {/* Price detail */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>商品总额</span>
                    <span>¥{(order.total - order.shipping_fee + order.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>运费</span>
                    <span>{order.shipping_fee > 0 ? `¥${order.shipping_fee.toFixed(2)}` : '免运费'}</span>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span>优惠</span>
                        <span>-¥{order.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
                    <span className="text-slate-800">实付金额</span>
                    <span className="text-red-500 font-bold">¥{order.total.toFixed(2)}</span>
                </div>
            </div>

            {/* Bottom actions */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-3 z-40">
                {order.status === 'pending' && (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="px-5 h-9 rounded-full border border-gray-200 text-sm text-gray-600 active:scale-[0.98]"
                        >
                            取消订单
                        </button>
                        <button
                            onClick={handlePayNow}
                            className="px-5 h-9 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium active:scale-[0.98]"
                        >
                            立即付款
                        </button>
                    </>
                )}
                {order.status === 'shipped' && (
                    <button
                        onClick={handleConfirmReceive}
                        disabled={actionLoading}
                        className="px-5 h-9 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium active:scale-[0.98]"
                    >
                        确认收货
                    </button>
                )}
                {(order.status === 'completed' || order.status === 'cancelled') && (
                    <button
                        onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)}
                        className="px-5 h-9 rounded-full border border-gray-200 text-sm text-gray-600 active:scale-[0.98]"
                    >
                        再次购买
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetailScreen;

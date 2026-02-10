import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ChevronRight, Truck, CreditCard, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { CartItem } from '../src/services/cartService';
import { getDefaultAddress, UserAddress } from '../src/services/addressService';
import { createOrder } from '../src/services/orderService';
import { removeFromCart } from '../src/services/cartService';

interface CheckoutScreenProps {
    checkoutItems: CartItem[];
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const PAYMENT_METHODS = [
    { id: 'alipay', name: '支付宝', icon: '💰', color: '#1677FF' },
    { id: 'wechat', name: '微信支付', icon: '💬', color: '#07C160' },
    { id: 'virtual', name: '虚拟支付', icon: '💎', color: '#8B5CF6' },
];

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ checkoutItems, onNavigate }) => {
    const [address, setAddress] = useState<UserAddress | null>(null);
    const [payMethod, setPayMethod] = useState('alipay');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [remark, setRemark] = useState('');

    const shippingFee = 0; // Free shipping
    const discount = 0;
    const subtotal = checkoutItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const total = subtotal + shippingFee - discount;
    const itemCount = checkoutItems.reduce((sum, i) => sum + i.quantity, 0);

    useEffect(() => {
        const load = async () => {
            const addr = await getDefaultAddress();
            setAddress(addr);
            setLoading(false);
        };
        load();
    }, []);

    const handleSubmit = async () => {
        if (!address) return;
        setSubmitting(true);

        const order = await createOrder({
            items: checkoutItems.map(i => ({
                product_id: i.product_id,
                title: i.title || '商品',
                price: i.price || 0,
                quantity: i.quantity,
                image_url: i.image_url || '',
                specs: i.specs,
            })),
            address,
            shipping_fee: shippingFee,
            discount,
            payment_method: payMethod,
        });

        // Remove purchased items from cart
        for (const item of checkoutItems) {
            await removeFromCart(item.id);
        }

        setSubmitting(false);

        if (order) {
            onNavigate(AppScreen.PAYMENT, { orderId: order.id, total: order.total, payMethod });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.CART)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center text-base font-medium">确认订单</span>
                <div className="w-8" />
            </div>

            {/* Address */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />
                {address ? (
                    <button className="w-full text-left flex items-start gap-3">
                        <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-slate-800">{address.name}</span>
                                <span className="text-sm text-gray-500">{address.phone}</span>
                                {address.is_default && <span className="text-[10px] text-red-500 border border-red-300 px-1 rounded">默认</span>}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{address.province}{address.city}{address.district} {address.detail}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 mt-2" />
                    </button>
                ) : (
                    <button className="w-full flex items-center gap-2 text-red-500 text-sm font-medium py-2">
                        <MapPin size={18} /> 添加收货地址
                    </button>
                )}
            </div>

            {/* Items */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">官方直营</span>
                    <span className="text-sm font-medium text-slate-700">虚视界商城</span>
                </div>

                {checkoutItems.map((item, idx) => (
                    <div key={item.id} className={`flex gap-3 py-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                        <img src={item.image_url || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-slate-700 line-clamp-1">{item.title}</h4>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">默认</span>
                            <div className="flex items-end justify-between mt-1">
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

            {/* Shipping */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck size={16} className="text-gray-500" />
                    <span className="text-sm text-slate-700">配送方式</span>
                </div>
                <span className="text-sm text-gray-500">顺丰免邮</span>
            </div>

            {/* Remark */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-700">订单备注</span>
                </div>
                <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="选填，请先和商家协商一致"
                    className="w-full text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                />
            </div>

            {/* Payment method */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <CreditCard size={16} /> 支付方式
                </h3>
                <div className="space-y-2">
                    {PAYMENT_METHODS.map((pm) => (
                        <button
                            key={pm.id}
                            onClick={() => setPayMethod(pm.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${payMethod === pm.id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        >
                            <span className="text-lg">{pm.icon}</span>
                            <span className="text-sm text-slate-700 flex-1 text-left">{pm.name}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === pm.id ? 'border-red-500' : 'border-gray-300'}`}>
                                {payMethod === pm.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>商品小计</span><span>¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>运费</span><span className="text-green-500">免运费</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span>优惠</span><span>-¥{discount.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex items-center z-40">
                <div className="flex-1">
                    <span className="text-sm text-gray-600">共 {itemCount} 件，合计: </span>
                    <span className="text-red-500 text-sm font-bold">¥</span>
                    <span className="text-red-500 text-xl font-bold">{total.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!address || submitting}
                    className={`px-8 h-10 rounded-full text-white text-sm font-medium transition-all ${!address || submitting ? 'bg-gray-300' : 'bg-gradient-to-r from-red-500 to-red-600 active:scale-[0.98]'}`}
                >
                    {submitting ? '提交中...' : '提交订单'}
                </button>
            </div>
        </div>
    );
};

export default CheckoutScreen;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, ChevronRight, Truck, CreditCard, Loader2, Tag, ChevronDown, X, Check, Clock } from 'lucide-react';
import { AppScreen } from '../types';
import { CartItem } from '../src/services/cartService';
import { getDefaultAddress, UserAddress } from '../src/services/addressService';
import { createOrder } from '../src/services/orderService';
import { removeFromCart } from '../src/services/cartService';
import { getAllUserCouponsForCheckout, calculateDiscount, useCoupon, UserCoupon } from '../src/services/couponService';

interface CheckoutScreenProps {
    checkoutItems: CartItem[];
    onNavigate: (screen: AppScreen, data?: any) => void;
    selectedAddress?: UserAddress;
}

const PAYMENT_METHODS = [
    { id: 'alipay', name: '支付宝', icon: '💰', color: '#1677FF' },
    { id: 'wechat', name: '微信支付', icon: '💬', color: '#07C160' },
    { id: 'virtual', name: '虚拟支付', icon: '💎', color: '#8B5CF6' },
];

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ checkoutItems, onNavigate, selectedAddress }) => {
    const [address, setAddress] = useState<UserAddress | null>(null);
    const [payMethod, setPayMethod] = useState('alipay');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [remark, setRemark] = useState('');

    // Coupon state
    const [showCouponPicker, setShowCouponPicker] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([]);
    const [unavailableCoupons, setUnavailableCoupons] = useState<UserCoupon[]>([]);

    const shippingFee = 0;
    const subtotal = checkoutItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
    const couponDiscount = calculateDiscount(selectedCoupon, subtotal);
    const total = subtotal + shippingFee - couponDiscount;
    const itemCount = checkoutItems.reduce((sum, i) => sum + i.quantity, 0);

    useEffect(() => {
        const load = async () => {
            if (selectedAddress) {
                setAddress(selectedAddress);
            } else {
                const addr = await getDefaultAddress();
                setAddress(addr);
            }

            // Load coupons
            const { available, unavailable } = await getAllUserCouponsForCheckout(subtotal);
            setAvailableCoupons(available);
            setUnavailableCoupons(unavailable);

            // Auto-select best coupon
            if (available.length > 0) {
                setSelectedCoupon(available[0]);
            }

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
            discount: couponDiscount,
            payment_method: payMethod,
            coupon_id: selectedCoupon?.id,
        });

        // Mark coupon as used
        if (order && selectedCoupon) {
            await useCoupon(selectedCoupon.id, order.id);
        }

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
                    <button onClick={() => onNavigate(AppScreen.ADDRESS_MANAGE, { from: 'checkout' })} className="w-full text-left flex items-start gap-3">
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
                    <button onClick={() => onNavigate(AppScreen.ADDRESS_EDIT, { address: null })} className="w-full flex items-center gap-2 text-red-500 text-sm font-medium py-2">
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

            {/* ==================== Coupon Section ==================== */}
            <div className="bg-white mx-3 mt-3 rounded-xl p-4">
                <button
                    onClick={() => setShowCouponPicker(true)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-red-500" />
                        <span className="text-sm text-slate-700 font-medium">优惠券</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {selectedCoupon ? (
                            <span className="text-red-500 text-sm font-bold">-¥{couponDiscount.toFixed(2)}</span>
                        ) : availableCoupons.length > 0 ? (
                            <span className="text-red-500 text-sm">{availableCoupons.length}张可用</span>
                        ) : (
                            <span className="text-gray-400 text-sm">暂无可用</span>
                        )}
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </button>
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
                {couponDiscount > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span className="flex items-center gap-1">
                            <Tag size={12} />
                            优惠券减免
                        </span>
                        <span className="font-bold">-¥{couponDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-medium">
                    <span className="text-slate-700">应付金额</span>
                    <span className="text-red-500 font-bold text-lg">¥{total.toFixed(2)}</span>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex items-center z-40">
                <div className="flex-1">
                    <span className="text-sm text-gray-600">共 {itemCount} 件，合计: </span>
                    <span className="text-red-500 text-sm font-bold">¥</span>
                    <span className="text-red-500 text-xl font-bold">{total.toFixed(2)}</span>
                    {couponDiscount > 0 && (
                        <span className="text-orange-500 text-[10px] ml-1">已优惠¥{couponDiscount.toFixed(2)}</span>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!address || submitting}
                    className={`px-8 h-10 rounded-full text-white text-sm font-medium transition-all ${!address || submitting ? 'bg-gray-300' : 'bg-gradient-to-r from-red-500 to-red-600 active:scale-[0.98]'}`}
                >
                    {submitting ? '提交中...' : '提交订单'}
                </button>
            </div>

            {/* ==================== Coupon Picker Modal ==================== */}
            {showCouponPicker && (
                <div className="fixed inset-0 z-50 flex justify-center">
                    <div className="relative w-full max-w-md flex flex-col justify-end">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowCouponPicker(false)} />
                        <div className="relative z-10 bg-white rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300" style={{ maxHeight: '70vh' }}>
                            {/* Handle */}
                            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

                            {/* Header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                                <h3 className="font-bold text-slate-800 text-base">选择优惠券</h3>
                                <button onClick={() => setShowCouponPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Coupon list */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {/* No coupon option */}
                                <button
                                    onClick={() => { setSelectedCoupon(null); setShowCouponPicker(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${!selectedCoupon ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!selectedCoupon ? 'border-red-500' : 'border-gray-300'
                                        }`}>
                                        {!selectedCoupon && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                    </div>
                                    <span className="text-sm text-slate-700">不使用优惠券</span>
                                </button>

                                {/* Available coupons */}
                                {availableCoupons.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 mb-2">可用优惠券 ({availableCoupons.length})</h4>
                                        <div className="space-y-2">
                                            {availableCoupons.map(coupon => {
                                                const isSelected = selectedCoupon?.id === coupon.id;
                                                const discount = calculateDiscount(coupon, subtotal);
                                                return (
                                                    <button
                                                        key={coupon.id}
                                                        onClick={() => { setSelectedCoupon(coupon); setShowCouponPicker(false); }}
                                                        className={`w-full rounded-xl border overflow-hidden transition-all ${isSelected ? 'border-red-400 shadow-md shadow-red-100' : 'border-gray-200 hover:border-red-200'
                                                            }`}
                                                    >
                                                        <div className="flex">
                                                            {/* Left: Amount */}
                                                            <div className="w-22 bg-gradient-to-b from-red-500 to-orange-500 flex flex-col items-center justify-center py-3 px-4 relative">
                                                                <span className="text-xl font-black text-white">¥{coupon.template?.discount_amount}</span>
                                                                <span className="text-[9px] text-white/80 mt-0.5">满{coupon.template?.min_spend}可用</span>
                                                                <div className="absolute right-0 top-2 bottom-2 border-r border-dashed border-white/30" />
                                                            </div>

                                                            {/* Right: Info */}
                                                            <div className="flex-1 p-3 flex items-center justify-between">
                                                                <div className="text-left">
                                                                    <h5 className="text-sm font-bold text-slate-700">{coupon.template?.title}</h5>
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <Clock size={10} className="text-gray-400" />
                                                                        <span className="text-[10px] text-gray-400">
                                                                            {coupon.template?.end_time ? new Date(coupon.template.end_time).toLocaleDateString() : ''} 到期
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-orange-500 text-xs font-bold mt-1 inline-block">
                                                                        可省 ¥{discount.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-red-500' : 'border-gray-300'
                                                                    }`}>
                                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Unavailable coupons */}
                                {unavailableCoupons.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 mb-2">不可用优惠券 ({unavailableCoupons.length})</h4>
                                        <div className="space-y-2">
                                            {unavailableCoupons.map(coupon => (
                                                <div key={coupon.id} className="w-full rounded-xl border border-gray-200 overflow-hidden opacity-50">
                                                    <div className="flex">
                                                        <div className="w-22 bg-gray-200 flex flex-col items-center justify-center py-3 px-4 relative">
                                                            <span className="text-xl font-black text-gray-400">¥{coupon.template?.discount_amount || '?'}</span>
                                                            <span className="text-[9px] text-gray-400 mt-0.5">满{coupon.template?.min_spend || '?'}可用</span>
                                                            <div className="absolute right-0 top-2 bottom-2 border-r border-dashed border-gray-300" />
                                                        </div>
                                                        <div className="flex-1 p-3">
                                                            <h5 className="text-sm font-bold text-gray-400">{coupon.template?.title || '优惠券'}</h5>
                                                            <span className="text-[10px] text-gray-400 mt-1 inline-block">
                                                                {coupon.status === 'used' ? '已使用' :
                                                                    coupon.status === 'expired' ? '已过期' :
                                                                        `未满${coupon.template?.min_spend}元`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {availableCoupons.length === 0 && unavailableCoupons.length === 0 && (
                                    <div className="text-center py-12">
                                        <Tag className="text-gray-200 mx-auto mb-3" size={48} />
                                        <p className="text-gray-400 text-sm">暂无优惠券</p>
                                        <p className="text-gray-400 text-xs mt-1">可在直播间领取优惠券</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutScreen;

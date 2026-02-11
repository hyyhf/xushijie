import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ShoppingBag, Home } from 'lucide-react';
import { AppScreen } from '../types';
import { simulatePayment } from '../src/services/orderService';

interface PaymentScreenProps {
    orderId: string;
    total: number;
    payMethod: string;
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const PAY_LABELS: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    virtual: '虚拟支付',
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({ orderId, total, payMethod, onNavigate }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        // Simulate payment with progress
        const doPayment = async () => {
            // Show loading for 2 seconds
            await new Promise(r => setTimeout(r, 2000));

            const success = await simulatePayment(orderId, payMethod);
            setStatus(success ? 'success' : 'failed');
        };

        doPayment();
    }, [orderId, payMethod]);

    // Auto redirect countdown after success
    useEffect(() => {
        if (status !== 'success') return;
        if (countdown <= 0) {
            onNavigate(AppScreen.ORDER_LIST);
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown, onNavigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-6">
            {status === 'loading' && (
                <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                    {/* Payment animation */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                        </div>
                        <div className="absolute -inset-2 rounded-full border-2 border-dashed border-primary-200 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-slate-800 mb-2">正在支付</h2>
                        <p className="text-sm text-gray-500">使用{PAY_LABELS[payMethod] || payMethod}支付</p>
                        <p className="text-2xl font-bold text-red-500 mt-3">¥{total.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">请勿关闭此页面...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle className="text-green-500" size={48} />
                        </div>
                        {/* Success ripple */}
                        <div className="absolute -inset-4 rounded-full border-2 border-green-200 animate-ping opacity-30" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">支付成功</h2>
                        <p className="text-sm text-gray-500">已通过{PAY_LABELS[payMethod] || payMethod}支付</p>
                        <p className="text-xl font-bold text-green-500 mt-2">¥{total.toFixed(2)}</p>
                    </div>

                    <p className="text-xs text-gray-400">{countdown}秒后自动跳转到订单列表</p>

                    <div className="flex gap-3 mt-4 w-full">
                        <button
                            onClick={() => onNavigate(AppScreen.HOME)}
                            className="flex-1 h-11 border border-gray-200 rounded-full text-sm text-gray-600 font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] whitespace-nowrap"
                        >
                            <Home size={16} /> 回首页
                        </button>
                        <button
                            onClick={() => onNavigate(AppScreen.ORDER_LIST)}
                            className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] whitespace-nowrap"
                        >
                            <ShoppingBag size={16} /> 查看订单
                        </button>
                    </div>
                </div>
            )}

            {status === 'failed' && (
                <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="text-red-500" size={48} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">支付失败</h2>
                        <p className="text-sm text-gray-500">请稍后重试或更换支付方式</p>
                    </div>
                    <div className="flex gap-3 mt-4 w-full">
                        <button
                            onClick={() => onNavigate(AppScreen.ORDER_LIST)}
                            className="flex-1 h-11 border border-gray-200 rounded-full text-sm text-gray-600 font-medium active:scale-[0.98] whitespace-nowrap"
                        >
                            查看订单
                        </button>
                        <button
                            onClick={() => setStatus('loading')}
                            className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-medium active:scale-[0.98] whitespace-nowrap"
                        >
                            重新支付
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default PaymentScreen;

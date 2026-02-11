import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Check, Trash2, Edit2, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { UserAddress, getAddresses, deleteAddress, updateAddress } from '../src/services/addressService';

interface AddressManageScreenProps {
    onNavigate: (screen: AppScreen, data?: any) => void;
    selectMode?: boolean; // If true, selecting an address returns it
    onSelect?: (address: UserAddress) => void;
}

const AddressManageScreen: React.FC<AddressManageScreenProps> = ({ onNavigate, selectMode, onSelect }) => {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    const loadAddresses = async () => {
        setLoading(true);
        const data = await getAddresses();
        setAddresses(data);
        setLoading(false);
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (addresses.length <= 1) {
            showToast('至少保留一个地址');
            return;
        }
        await deleteAddress(id);
        showToast('已删除');
        loadAddresses();
    };

    const handleSetDefault = async (id: string) => {
        await updateAddress(id, { is_default: true });
        showToast('已设为默认');
        loadAddresses();
    };

    const handleSelect = (addr: UserAddress) => {
        if (selectMode && onSelect) {
            onSelect(addr);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.CHECKOUT)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center text-base font-medium">管理收货地址</span>
                <div className="w-8" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500" size={28} />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16">
                    <MapPin className="text-gray-200 mx-auto mb-4" size={56} />
                    <p className="text-gray-400 text-sm mb-1">暂无收货地址</p>
                    <p className="text-gray-400 text-xs">添加一个地址方便收货</p>
                </div>
            ) : (
                <div className="p-3 space-y-3">
                    {addresses.map(addr => (
                        <div
                            key={addr.id}
                            onClick={() => handleSelect(addr)}
                            className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${selectMode ? 'cursor-pointer hover:border-primary-300 active:scale-[0.99]' : 'border-transparent'
                                } ${addr.is_default ? 'border-primary-200' : ''}`}
                        >
                            {/* Name & Phone */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">{addr.name}</span>
                                    <span className="text-sm text-gray-500">{addr.phone}</span>
                                    {addr.is_default && (
                                        <span className="bg-primary-50 text-primary-500 text-[10px] font-bold px-2 py-0.5 rounded-full">默认</span>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {addr.province}{addr.city}{addr.district} {addr.detail}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    {!addr.is_default && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500"
                                        >
                                            <Check size={14} />
                                            设为默认
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onNavigate(AppScreen.ADDRESS_EDIT, { address: addr }); }}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500"
                                    >
                                        <Edit2 size={14} />
                                        编辑
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Address Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
                <button
                    onClick={() => onNavigate(AppScreen.ADDRESS_EDIT, { address: null })}
                    className="w-full h-12 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-full font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <Plus size={18} />
                    新增收货地址
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 text-white px-6 py-3 rounded-lg text-sm font-medium">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default AddressManageScreen;

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { UserAddress, addAddress, updateAddress } from '../src/services/addressService';

interface AddressEditScreenProps {
    onNavigate: (screen: AppScreen, data?: any) => void;
    address?: UserAddress | null; // null = new address
}

const AddressEditScreen: React.FC<AddressEditScreenProps> = ({ onNavigate, address }) => {
    const isEdit = !!address;
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: address?.name || '',
        phone: address?.phone || '',
        province: address?.province || '',
        city: address?.city || '',
        district: address?.district || '',
        detail: address?.detail || '',
        is_default: address?.is_default || false,
    });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const handleSave = async () => {
        // Validate
        if (!form.name.trim()) { showToast('请输入收货人姓名'); return; }
        if (!form.phone.trim()) { showToast('请输入手机号码'); return; }
        if (!/^1\d{10}$/.test(form.phone.replace(/\*/g, '0'))) {
            // Allow masked phone like 138****8888
            if (!/^\d{3}\*{4}\d{4}$/.test(form.phone) && !/^1\d{10}$/.test(form.phone)) {
                showToast('请输入正确的手机号');
                return;
            }
        }
        if (!form.province.trim()) { showToast('请输入省份'); return; }
        if (!form.city.trim()) { showToast('请输入城市'); return; }
        if (!form.district.trim()) { showToast('请输入区/县'); return; }
        if (!form.detail.trim()) { showToast('请输入详细地址'); return; }

        setSaving(true);

        let success: boolean;
        if (isEdit && address) {
            success = await updateAddress(address.id, form);
        } else {
            success = await addAddress(form);
        }

        setSaving(false);

        if (success) {
            showToast(isEdit ? '地址已更新' : '地址已添加');
            setTimeout(() => onNavigate(AppScreen.ADDRESS_MANAGE), 500);
        } else {
            showToast('保存失败');
        }
    };

    const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '河南省', '山东省', '福建省', '安徽省', '重庆市', '天津市', '河北省', '陕西省', '辽宁省', '吉林省', '黑龙江省', '山西省', '甘肃省', '云南省', '贵州省', '广西壮族自治区', '海南省', '江西省', '内蒙古自治区', '西藏自治区', '新疆维吾尔自治区', '宁夏回族自治区', '青海省'];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center border-b border-gray-100">
                <button onClick={() => onNavigate(AppScreen.ADDRESS_MANAGE)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center text-base font-medium">{isEdit ? '编辑地址' : '新增地址'}</span>
                <div className="w-8" />
            </div>

            {/* Form */}
            <div className="bg-white mx-3 mt-3 rounded-xl overflow-hidden">
                {/* Name */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20 flex-shrink-0">收货人</span>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="请输入收货人姓名"
                        className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
                        maxLength={20}
                    />
                </div>

                {/* Phone */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20 flex-shrink-0">手机号码</span>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="请输入手机号码"
                        className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
                        maxLength={11}
                    />
                </div>

                {/* Province */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20 flex-shrink-0">省份</span>
                    <select
                        value={form.province}
                        onChange={(e) => setForm(prev => ({ ...prev, province: e.target.value }))}
                        className="flex-1 text-sm text-slate-800 outline-none bg-transparent appearance-none"
                    >
                        <option value="">请选择省份</option>
                        {provinces.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* City */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20 flex-shrink-0">城市</span>
                    <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="请输入城市"
                        className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
                    />
                </div>

                {/* District */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20 flex-shrink-0">区/县</span>
                    <input
                        type="text"
                        value={form.district}
                        onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value }))}
                        placeholder="请输入区/县"
                        className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
                    />
                </div>

                {/* Detail */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 mb-2 block">详细地址</span>
                    <textarea
                        value={form.detail}
                        onChange={(e) => setForm(prev => ({ ...prev, detail: e.target.value }))}
                        placeholder="请输入详细地址，如街道、楼号、门牌号等"
                        rows={2}
                        className="w-full text-sm text-slate-800 outline-none bg-gray-50 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-primary-300"
                    />
                </div>

                {/* Set Default */}
                <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-sm text-slate-700">设为默认地址</span>
                    <button
                        onClick={() => setForm(prev => ({ ...prev, is_default: !prev.is_default }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${form.is_default ? 'bg-primary-500' : 'bg-gray-200'}`}
                    >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_default ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-full font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            保存中...
                        </>
                    ) : (
                        '保存地址'
                    )}
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

export default AddressEditScreen;

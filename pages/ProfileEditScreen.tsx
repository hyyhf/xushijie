import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, ChevronRight, Save, Loader2, User, Phone, FileText, Calendar, Users } from 'lucide-react';
import { AppScreen } from '../types';
import { useUser } from '../src/lib/userContext';
import { getProfile, updateProfile, uploadAvatar, ProfileData } from '../src/services/profileService';

interface ProfileEditScreenProps {
    onNavigate: (screen: AppScreen, data?: any) => void;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onNavigate }) => {
    const { user } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const [form, setForm] = useState<ProfileData>({
        username: '',
        phone: '',
        avatar_url: '',
        bio: '',
        gender: '',
        birthday: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            const profile = await getProfile();
            if (profile) {
                setForm(profile);
                setAvatarPreview(profile.avatar_url);
            } else if (user) {
                setForm(prev => ({
                    ...prev,
                    username: user.username || '',
                    phone: user.phone || '',
                    avatar_url: user.avatar_url || '',
                }));
                setAvatarPreview(user.avatar_url || '');
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('图片大小不能超过 5MB');
            return;
        }

        // Show preview immediately
        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);

        // Upload
        const url = await uploadAvatar(file);
        if (url) {
            setForm(prev => ({ ...prev, avatar_url: url }));
            showToast('头像已更新');
        } else {
            showToast('上传失败，请重试');
        }
    };

    const handleSave = async () => {
        if (!form.username.trim()) {
            showToast('请输入用户名');
            return;
        }
        setSaving(true);
        const success = await updateProfile(form);
        setSaving(false);
        if (success) {
            showToast('保存成功');
            setTimeout(() => onNavigate(AppScreen.PROFILE), 800);
        } else {
            showToast('保存失败');
        }
    };

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`;

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
                <button onClick={() => onNavigate(AppScreen.PROFILE)} className="w-8 h-8 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center text-base font-medium">编辑资料</span>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-sm text-primary-500 font-bold"
                >
                    {saving ? '保存中...' : '保存'}
                </button>
            </div>

            {/* Avatar Section */}
            <div className="bg-white py-8 flex flex-col items-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            <img
                                src={avatarPreview || form.avatar_url || defaultAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                    >
                        <Camera size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>
                <p className="text-sm text-gray-400 mt-2">点击更换头像</p>
            </div>

            {/* Form Fields */}
            <div className="bg-white mx-3 mt-3 rounded-xl overflow-hidden">
                {/* Username */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm text-slate-700">昵称</span>
                    </div>
                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="请输入昵称"
                        className="flex-1 text-sm text-slate-800 text-right outline-none bg-transparent"
                        maxLength={20}
                    />
                </div>

                {/* Phone */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-slate-700">手机</span>
                    </div>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="请输入手机号"
                        className="flex-1 text-sm text-slate-800 text-right outline-none bg-transparent"
                        maxLength={11}
                    />
                </div>

                {/* Gender */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-slate-700">性别</span>
                    </div>
                    <div className="flex-1 flex justify-end gap-2">
                        {['男', '女', '保密'].map(g => (
                            <button
                                key={g}
                                onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                                className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.gender === g
                                        ? 'border-primary-500 text-primary-500 bg-primary-50'
                                        : 'border-gray-200 text-gray-500'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Birthday */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-slate-700">生日</span>
                    </div>
                    <input
                        type="date"
                        value={form.birthday || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, birthday: e.target.value }))}
                        className="flex-1 text-sm text-slate-800 text-right outline-none bg-transparent"
                    />
                </div>

                {/* Bio */}
                <div className="px-4 py-3.5">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm text-slate-700">个人简介</span>
                    </div>
                    <textarea
                        value={form.bio || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="介绍一下自己吧"
                        rows={3}
                        maxLength={100}
                        className="w-full text-sm text-slate-800 outline-none bg-gray-50 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-primary-300"
                    />
                    <p className="text-right text-[10px] text-gray-400 mt-1">{(form.bio || '').length}/100</p>
                </div>
            </div>

            {/* Account Info (read-only) */}
            <div className="bg-white mx-3 mt-3 rounded-xl overflow-hidden">
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                    <span className="text-sm text-slate-700 w-20">邮箱</span>
                    <span className="flex-1 text-sm text-gray-400 text-right">{user?.email || '未绑定'}</span>
                </div>
                <div className="flex items-center px-4 py-3.5">
                    <span className="text-sm text-slate-700 w-20">用户ID</span>
                    <span className="flex-1 text-sm text-gray-400 text-right">{user?.id?.slice(0, 8) || '-'}</span>
                </div>
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

export default ProfileEditScreen;

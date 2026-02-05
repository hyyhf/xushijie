import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Palette, Gift, Sparkles, Check, Image, Save, Zap } from 'lucide-react';
import { AppScreen } from '../types';

interface LiveRoomCustomizeScreenProps {
    onNavigate: (screen: AppScreen) => void;
}

// 直播间配置接口
export interface LiveRoomConfig {
    theme: string;
    backgroundColor: string;
    accentColor: string;
    backgroundImage: string;
    hostTitle: string;
    welcomeMessage: string;
    couponEnabled: boolean;
    couponAmount: number;
    couponMinSpend: number;
    couponAutoSend: boolean;
    specialEffects: string[];
}

// 默认配置
const defaultConfig: LiveRoomConfig = {
    theme: 'elegant',
    backgroundColor: '#1a1a2e',
    accentColor: '#ff6b35',
    backgroundImage: '',
    hostTitle: '虚视界官方号',
    welcomeMessage: '欢迎来到直播间！',
    couponEnabled: false,
    couponAmount: 10,
    couponMinSpend: 100,
    couponAutoSend: false,
    specialEffects: []
};

// 从 localStorage 获取配置
export function getLiveRoomConfig(): LiveRoomConfig {
    try {
        const saved = localStorage.getItem('liveRoomConfig');
        if (saved) {
            return { ...defaultConfig, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Error loading live room config:', e);
    }
    return defaultConfig;
}

// 保存配置到 localStorage
export function saveLiveRoomConfig(config: LiveRoomConfig): void {
    try {
        localStorage.setItem('liveRoomConfig', JSON.stringify(config));
    } catch (e) {
        console.error('Error saving live room config:', e);
    }
}

// 主题预设
const themePresets = [
    { id: 'elegant', name: '高端大气', bgColor: '#1a1a2e', accent: '#ff6b35', preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
    { id: 'fresh', name: '清新自然', bgColor: '#e8f5e9', accent: '#4caf50', preview: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' },
    { id: 'romantic', name: '浪漫粉红', bgColor: '#fce4ec', accent: '#e91e63', preview: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' },
    { id: 'tech', name: '科技蓝光', bgColor: '#0d1b2a', accent: '#00d4ff', preview: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)' },
    { id: 'luxury', name: '奢华金色', bgColor: '#1c1c1c', accent: '#ffd700', preview: 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)' },
    { id: 'vivid', name: '活力橙红', bgColor: '#ff5722', accent: '#ffffff', preview: 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)' },
];

// 特效选项
const effectOptions = [
    { id: 'sparkles', name: '闪光', icon: '✨', color: '#FFD700' },
    { id: 'hearts', name: '爱心', icon: '💕', color: '#ff6b81' },
    { id: 'confetti', name: '彩带', icon: '🎉', color: '#a29bfe' },
    { id: 'stars', name: '星星', icon: '⭐', color: '#ffe135' },
    { id: 'bubbles', name: '气泡', icon: '🫧', color: '#74b9ff' },
    { id: 'fire', name: '火焰', icon: '🔥', color: '#ff7675' },
];

// 粒子组件
const ParticleSystem = ({ type }: { type: string }) => {
    const [particles, setParticles] = useState<{ id: number; left: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => {
                const newParticle = {
                    id: Date.now(),
                    left: Math.random() * 100,
                    delay: 0,
                    scale: 0.5 + Math.random() * 0.5
                };
                return [...prev.slice(-15), newParticle]; // Keep max 15 particles
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const getIcon = () => {
        const effect = effectOptions.find(e => e.id === type);
        return effect ? effect.icon : '✨';
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute bottom-0 text-xl animate-float-up opacity-0"
                    style={{
                        left: `${p.left}%`,
                        fontSize: `${p.scale}rem`,
                        animationDuration: '3s',
                        animationTimingFunction: 'ease-out'
                    }}
                >
                    {getIcon()}
                </div>
            ))}
        </div>
    );
};

const LiveRoomCustomizeScreen: React.FC<LiveRoomCustomizeScreenProps> = ({ onNavigate }) => {
    const [config, setConfig] = useState<LiveRoomConfig>(defaultConfig);
    const [activeSection, setActiveSection] = useState<'theme' | 'coupon' | 'effects'>('theme');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // 加载已保存的配置
    useEffect(() => {
        setConfig(getLiveRoomConfig());
    }, []);

    // 保存配置
    const handleSave = () => {
        setIsSaving(true);
        saveLiveRoomConfig(config);
        setTimeout(() => {
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 500);
    };

    // 切换特效
    const toggleEffect = (effectId: string) => {
        setConfig(prev => ({
            ...prev,
            specialEffects: prev.specialEffects.includes(effectId)
                ? prev.specialEffects.filter(e => e !== effectId)
                : [...prev.specialEffects, effectId]
        }));
    };

    // 选择主题预设
    const selectTheme = (preset: typeof themePresets[0]) => {
        setConfig(prev => ({
            ...prev,
            theme: preset.id,
            backgroundColor: preset.bgColor,
            accentColor: preset.accent
        }));
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20 relative">
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(20px) scale(0.8); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translateY(-150px) scale(1.2); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-fill-mode: forwards;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
            `}</style>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50">
                <div className="flex items-center justify-between px-4 py-2">
                    <button
                        onClick={() => onNavigate(AppScreen.HOME)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-base font-bold text-slate-800">直播间定制</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md hover:bg-gray-800 transition-colors"
                    >
                        {isSaving ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        保存
                    </button>
                </div>
            </header>

            {/* Save Success Toast */}
            {showSaveSuccess && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-bounce shadow-lg">
                    <Check size={16} />
                    保存成功！
                </div>
            )}

            <div className="max-w-md mx-auto">
                {/* Preview Area */}
                <div className="px-4 py-4 sticky top-12 z-30 bg-slate-50/95 backdrop-blur-sm">
                    <div
                        className="aspect-[16/9] rounded-2xl overflow-hidden relative shadow-2xl transition-all duration-500"
                        style={{
                            background: config.backgroundImage
                                ? `url(${config.backgroundImage}) center/cover`
                                : themePresets.find(t => t.id === config.theme)?.preview || config.backgroundColor
                        }}
                    >
                        {/* Dynamic Effects Overlay */}
                        {config.specialEffects.map(effectId => (
                            <ParticleSystem key={effectId} type={effectId} />
                        ))}

                        {/* Preview content */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 flex flex-col justify-between p-4">
                            {/* Host info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-white shadow-sm" />
                                    <div>
                                        <p className="text-white text-xs font-bold leading-tight">{config.hostTitle || '主播名称'}</p>
                                        <p className="text-white/80 text-[10px] scale-90 origin-left">1.2w 在看</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="bg-black/20 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 border border-white/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-white/90 text-[10px] font-medium">Live</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom area */}
                            <div className="space-y-2">
                                {/* Welcome Message */}
                                <div className="flex items-end gap-2">
                                    <div className="bg-black/40 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] border border-white/5">
                                        <p className="text-white text-xs font-medium leading-relaxed">{config.welcomeMessage}</p>
                                    </div>
                                </div>

                                {/* Coupon */}
                                {config.couponEnabled && (
                                    <div
                                        className="animate-bounce inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg"
                                        style={{ backgroundColor: config.accentColor, boxShadow: `0 4px 12px ${config.accentColor}66` }}
                                    >
                                        <Gift size={14} className="text-white" />
                                        <span className="text-white text-xs font-bold">
                                            ¥{config.couponAmount} 优惠券
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] min-h-[500px] border-t border-gray-100">
                    {/* Tabs */}
                    <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'theme', icon: Palette, label: '装修' },
                            { id: 'coupon', icon: Gift, label: '优惠' },
                            { id: 'effects', icon: Sparkles, label: '特效' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as any)}
                                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold transition-all duration-300 ${activeSection === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg scale-100'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 scale-95'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 pb-24">
                        {/* Theme Section */}
                        {activeSection === 'theme' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-3 gap-3">
                                    {themePresets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => selectTheme(preset)}
                                            className={`group relative rounded-2xl overflow-hidden aspect-square transition-all duration-300 ${config.theme === preset.id
                                                ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-xl'
                                                : 'hover:scale-95 opacity-80 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="absolute inset-0" style={{ background: preset.preview }} />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                <p className="text-white text-[10px] font-bold text-center">{preset.name}</p>
                                            </div>
                                            {config.theme === preset.id && (
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">自定义背景图</label>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                <Image size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={config.backgroundImage}
                                                onChange={(e) => setConfig(prev => ({ ...prev, backgroundImage: e.target.value }))}
                                                placeholder="输入图片链接..."
                                                className="flex-1 bg-transparent text-sm outline-none px-2 text-slate-800 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">主播名称</label>
                                        <input
                                            type="text"
                                            value={config.hostTitle}
                                            onChange={(e) => setConfig(prev => ({ ...prev, hostTitle: e.target.value }))}
                                            className="w-full bg-white h-10 px-3 rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400 transition-colors"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">欢迎语</label>
                                        <textarea
                                            value={config.welcomeMessage}
                                            onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                            className="w-full bg-white h-20 p-3 rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400 resize-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Coupon Section */}
                        {activeSection === 'coupon' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="glass-panel p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                            <Gift size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">启用优惠券</h3>
                                            <p className="text-xs text-slate-400">进场自动弹窗发放</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, couponEnabled: !prev.couponEnabled }))}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${config.couponEnabled ? 'bg-orange-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${config.couponEnabled ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                {config.couponEnabled && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">面额选择</label>
                                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                                {[5, 10, 20, 50, 100].map(amount => (
                                                    <button
                                                        key={amount}
                                                        onClick={() => setConfig(prev => ({ ...prev, couponAmount: amount }))}
                                                        className={`flex-shrink-0 w-14 h-14 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-center justify-center gap-1 ${config.couponAmount === amount
                                                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                            : 'border-slate-100 bg-white text-slate-400'
                                                            }`}
                                                    >
                                                        <span className="text-xs">¥</span>
                                                        <span className="text-lg leading-none">{amount}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">满减门槛</label>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-slate-700">¥</span>
                                                    <input
                                                        type="number"
                                                        value={config.couponMinSpend}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, couponMinSpend: parseInt(e.target.value) || 0 }))}
                                                        className="w-full bg-transparent text-lg font-bold outline-none text-slate-800"
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold text-slate-500">自动发放</label>
                                                    <button
                                                        onClick={() => setConfig(prev => ({ ...prev, couponAutoSend: !prev.couponAutoSend }))}
                                                        className={`w-8 h-4 rounded-full transition-colors relative ${config.couponAutoSend ? 'bg-green-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${config.couponAutoSend ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-400">用户进入立即领取</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Effects Section */}
                        {activeSection === 'effects' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-3 gap-3">
                                    {effectOptions.map(effect => (
                                        <button
                                            key={effect.id}
                                            onClick={() => toggleEffect(effect.id)}
                                            className={`p-3 rounded-2xl border transition-all relative overflow-hidden group ${config.specialEffects.includes(effect.id)
                                                ? 'border-transparent bg-slate-900 text-white shadow-lg scale-105'
                                                : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">{effect.icon}</div>
                                            <p className="text-xs font-bold">{effect.name}</p>
                                            {config.specialEffects.includes(effect.id) && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-3">
                                    <Zap className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-900 mb-1">特效说明</h4>
                                        <p className="text-xs text-indigo-700/80 leading-relaxed">
                                            选中特效后，直播间将自动播放对应的动态粒子效果。建议同时不要开启超过3个特效，以免影响画面流畅度。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
                <button
                    onClick={() => onNavigate(AppScreen.LIVE_STREAM)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-800 border border-white/10 backdrop-blur-md"
                >
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>预览直播间效果</span>
                </button>
            </div>
        </div>
    );
};

export default LiveRoomCustomizeScreen;

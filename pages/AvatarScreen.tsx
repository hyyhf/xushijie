import React, { useState, useEffect } from 'react';
import { Undo, Redo, Check, Save, Mic, Sparkles, Layout, Music, User, Grid, Loader2 } from 'lucide-react';
import { useUser } from '../src/lib/userContext';
import {
   getAvatarConfig,
   saveAvatarConfig,
   getDefaultAvatarConfig,
   AVATAR_LIBRARY,
   COLORS,
   MOTIONS,
   AvatarConfig
} from '../src/services/avatarService';

// Using 'micah' style for a cleaner, more aesthetic look
const AVATAR_STYLE = 'micah';

const CUSTOMIZE_OPTIONS = {
   HAIR: Array.from({ length: 9 }).map((_, i) => ({ id: `hair-${i}`, seed: `hair${i}` })),
   FACE: Array.from({ length: 6 }).map((_, i) => ({ id: `face-${i}`, seed: `face${i}` })),
   CLOTHES: Array.from({ length: 9 }).map((_, i) => ({ id: `cloth-${i}`, seed: `cloth${i}` })),
   MAKEUP: Array.from({ length: 6 }).map((_, i) => ({ id: `makeup-${i}`, seed: `mu${i}` })),
};

const VOICE_TEMPLATES = [
   { id: 'v1', title: '带货场景文案，服装专场', content: '宝宝们，这件西装外套真的绝绝子，上身超级显瘦...', duration: '15s' },
   { id: 'v2', title: '带货场景文案，食品专场', content: '今天给家人们炸一波福利，这个零食大礼包只要...', duration: '12s' },
   { id: 'v3', title: '带货场景文案，美妆专场', content: '敏感肌的宝宝看过来，这款修护水乳...', duration: '20s' },
   { id: 'v4', title: '日常互动，感谢关注', content: '谢谢宝宝的关注，主播爱你哟~', duration: '5s' },
];

const AvatarScreen: React.FC = () => {
   const { user } = useUser();
   const [activeTab, setActiveTab] = useState<'CUSTOM' | 'VOICE' | 'MOTION'>('CUSTOM');
   const [subCategory, setSubCategory] = useState<keyof typeof CUSTOMIZE_OPTIONS>('HAIR');
   const [isSaving, setIsSaving] = useState(false);
   const [saveMessage, setSaveMessage] = useState<string | null>(null);

   // Selection States
   const [currentAvatarSeed, setCurrentAvatarSeed] = useState('Natsumi');
   const [selections, setSelections] = useState({
      HAIR: 'hair-0',
      FACE: 'face-0',
      CLOTHES: 'cloth-0',
      MAKEUP: 'makeup-0',
      COLOR: 'c2',
      VOICE_PITCH: 50,
      MOTION: 'm1'
   });

   // History
   const [history, setHistory] = useState([selections]);
   const [historyIndex, setHistoryIndex] = useState(0);

   // Load saved config on mount
   useEffect(() => {
      const loadConfig = async () => {
         const config = await getAvatarConfig(user?.id || 'guest');
         if (config) {
            setCurrentAvatarSeed(config.seed);
            setSelections({
               HAIR: config.hair,
               FACE: config.face,
               CLOTHES: config.clothes,
               MAKEUP: config.makeup,
               COLOR: config.color,
               VOICE_PITCH: config.voice_pitch,
               MOTION: config.motion
            });
         }
      };
      loadConfig();
   }, [user?.id]);

   const updateSelection = (key: string, value: any) => {
      const newSelections = { ...selections, [key]: value };

      // Only add to history if it's different
      if (JSON.stringify(newSelections) !== JSON.stringify(selections)) {
         const newHistory = history.slice(0, historyIndex + 1);
         newHistory.push(newSelections);
         setHistory(newHistory);
         setHistoryIndex(newHistory.length - 1);
      }
      setSelections(newSelections);
   };

   const handleUndo = () => {
      if (historyIndex > 0) {
         setHistoryIndex(historyIndex - 1);
         setSelections(history[historyIndex - 1]);
      }
   };

   const handleRedo = () => {
      if (historyIndex < history.length - 1) {
         setHistoryIndex(historyIndex + 1);
         setSelections(history[historyIndex + 1]);
      }
   };

   const handleSave = async () => {
      setIsSaving(true);
      setSaveMessage(null);

      const config: AvatarConfig = {
         user_id: user?.id || 'guest',
         seed: currentAvatarSeed,
         hair: selections.HAIR,
         face: selections.FACE,
         clothes: selections.CLOTHES,
         makeup: selections.MAKEUP,
         color: selections.COLOR,
         voice_pitch: selections.VOICE_PITCH,
         motion: selections.MOTION
      };

      const success = await saveAvatarConfig(config);

      if (success) {
         setSaveMessage('配置已保存！');
      } else {
         setSaveMessage('保存失败，请重试');
      }

      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2000);
   };

   // Generate dynamic avatar URL based on selections
   const getAvatarUrl = (seedOverride?: string) => {
      const baseSeed = seedOverride || currentAvatarSeed;
      const featureSeed = `${baseSeed}-${selections.HAIR}-${selections.CLOTHES}`;

      const selectedColorObj = COLORS.find(c => c.id === selections.COLOR);
      const colorHex = selectedColorObj ? selectedColorObj.hex.replace('#', '') : 'FFD6A5';

      return `https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?seed=${featureSeed}&hairColor=${colorHex}&shirtColor=${colorHex}&backgroundColor=b6e3f4&backgroundType=gradientLinear&earringsProbability=20`;
   };

   return (
      <div className="bg-orange-50 min-h-screen flex flex-col font-sans text-slate-800 pb-24">
         {/* Header */}
         <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 pt-6 shadow-lg sticky top-0 z-50">
            <div className="flex justify-between items-center mb-4">
               <h1 className="text-xl font-bold flex items-center gap-2">
                  <Layout size={22} className="text-white/90" />
                  虚拟形象工作台
               </h1>
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm disabled:opacity-50"
               >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? '保存中...' : '保存配置'}
               </button>
            </div>

            {/* Save Message */}
            {saveMessage && (
               <div className={`mb-2 text-xs font-medium px-3 py-1 rounded-full inline-block ${saveMessage.includes('失败') ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {saveMessage}
               </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-black/10 rounded-xl backdrop-blur-md">
               {[
                  { id: 'CUSTOM', label: '定制捏脸', icon: User },
                  { id: 'VOICE', label: '声线设置', icon: Mic },
                  { id: 'MOTION', label: '动作库', icon: Sparkles }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-white/80 hover:bg-white/10'}`}
                  >
                     <tab.icon size={16} />
                     {tab.label}
                  </button>
               ))}
            </div>
         </header>

         <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">

            {/* Avatar Library - Always Visible at Top */}
            <section className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
               <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">日漫风格库</h3>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                  {AVATAR_LIBRARY.map((avatar) => (
                     <button
                        key={avatar.id}
                        onClick={() => setCurrentAvatarSeed(avatar.seed)}
                        className={`flex flex-col items-center gap-2 min-w-[60px] group transition-transform active:scale-95`}
                     >
                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all bg-blue-50 ${currentAvatarSeed === avatar.seed ? 'border-primary-500 ring-2 ring-primary-100 ring-offset-2' : 'border-gray-100 group-hover:border-primary-300'}`}>
                           <img src={`https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?seed=${avatar.seed}&backgroundColor=transparent`} alt={avatar.name} />
                        </div>
                        <span className={`text-xs font-medium ${currentAvatarSeed === avatar.seed ? 'text-primary-600' : 'text-slate-500'}`}>{avatar.name}</span>
                     </button>
                  ))}
               </div>
            </section>

            {/* Dynamic Content Area */}
            <div className="flex flex-col lg:flex-row gap-4">

               {/* Left/Top: Avatar Preview */}
               <section className="bg-white rounded-2xl overflow-hidden shadow-card border border-orange-100 relative aspect-[3/4] lg:w-1/2 shrink-0">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>

                  {/* Controls Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                     <button onClick={handleUndo} disabled={historyIndex === 0} className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-slate-600 disabled:opacity-50 hover:bg-white transition-colors">
                        <Undo size={16} />
                     </button>
                     <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-slate-600 disabled:opacity-50 hover:bg-white transition-colors">
                        <Redo size={16} />
                     </button>
                  </div>

                  {/* Avatar Image */}
                  <div className="w-full h-full flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                     <img
                        src={getAvatarUrl()}
                        className="h-full w-full object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-300"
                        alt="Avatar Preview"
                     />
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 text-xs font-medium text-slate-600 shadow-sm whitespace-nowrap">
                     {activeTab === 'CUSTOM' ? '双指缩放 · 360°预览' : activeTab === 'VOICE' ? '正在试听：服装专场' : '动作：打招呼'}
                  </div>
               </section>

               {/* Right/Bottom: Controls */}
               <section className="flex-1 bg-white rounded-2xl shadow-card border border-orange-100 overflow-hidden flex flex-col min-h-[350px]">

                  {/* CUSTOM TAB */}
                  {activeTab === 'CUSTOM' && (
                     <div className="flex flex-col h-full">
                        {/* Sub Tabs */}
                        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
                           {[
                              { id: 'HAIR', label: '发型' },
                              { id: 'FACE', label: '脸型' },
                              { id: 'MAKEUP', label: '妆容' },
                              { id: 'CLOTHES', label: '服装' }
                           ].map(cat => (
                              <button
                                 key={cat.id}
                                 onClick={() => setSubCategory(cat.id as any)}
                                 className={`flex-1 min-w-[80px] py-3 text-sm font-bold relative transition-colors ${subCategory === cat.id ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                 {cat.label}
                                 {subCategory === cat.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-500 rounded-t-full"></div>}
                              </button>
                           ))}
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
                           <div className="grid grid-cols-4 gap-3">
                              {CUSTOMIZE_OPTIONS[subCategory].map((item, index) => (
                                 <button
                                    key={item.id}
                                    onClick={() => updateSelection(subCategory, item.id)}
                                    className={`aspect-square rounded-xl bg-gray-50 border-2 overflow-hidden relative transition-all group ${selections[subCategory] === item.id ? 'border-primary-500 ring-2 ring-primary-100' : 'border-transparent hover:border-orange-200'}`}
                                 >
                                    <img
                                       src={`https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?seed=${currentAvatarSeed}-${item.seed}&backgroundColor=transparent&scale=120`}
                                       className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                       alt="Option"
                                    />
                                    {selections[subCategory] === item.id && (
                                       <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                          <div className="bg-primary-500 text-white rounded-full p-0.5 shadow-sm">
                                             <Check size={12} strokeWidth={3} />
                                          </div>
                                       </div>
                                    )}
                                 </button>
                              ))}
                           </div>

                           {/* Color Palette */}
                           <div className="mt-6">
                              <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
                                 个性配色
                                 <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">头发/服饰</span>
                              </h4>
                              <div className="flex gap-3 flex-wrap">
                                 {COLORS.map(c => (
                                    <button
                                       key={c.id}
                                       onClick={() => updateSelection('COLOR', c.id)}
                                       className={`w-9 h-9 rounded-full shadow-sm border-2 transition-transform ${selections.COLOR === c.id ? 'scale-110 border-slate-800 ring-2 ring-slate-200' : 'border-white hover:scale-105'}`}
                                       style={{ backgroundColor: c.hex }}
                                       title={c.hex}
                                    />
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* VOICE TAB */}
                  {activeTab === 'VOICE' && (
                     <div className="flex flex-col h-full p-5">
                        {/* Slider */}
                        <div className="mb-8">
                           <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                 <User size={16} /> 头神/声调
                              </label>
                              <span className="text-xs font-mono bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{selections.VOICE_PITCH}</span>
                           </div>
                           <input
                              type="range"
                              min="0" max="100"
                              value={selections.VOICE_PITCH}
                              onChange={(e) => updateSelection('VOICE_PITCH', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                           />
                           <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                              <span>低沉</span>
                              <span>清亮</span>
                           </div>
                        </div>

                        {/* Templates List */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                           <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <Layout size={16} /> 场景化文案模板库
                           </h3>
                           <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                              {VOICE_TEMPLATES.map(tpl => (
                                 <div key={tpl.id} className="bg-orange-50 border border-orange-100 p-3 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                       <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded bg-orange-200 flex items-center justify-center text-orange-600">
                                             <Music size={16} />
                                          </div>
                                          <span className="text-xs font-bold text-slate-800">{tpl.title}</span>
                                       </div>
                                       <span className="text-[10px] text-slate-400 bg-white px-1.5 rounded">{tpl.duration}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 pl-10 line-clamp-1">{tpl.content}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* MOTION TAB */}
                  {activeTab === 'MOTION' && (
                     <div className="p-5 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                           <Grid size={16} /> 动作触发列表
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                           {MOTIONS.map(m => (
                              <button
                                 key={m.id}
                                 onClick={() => updateSelection('MOTION', m.id)}
                                 className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selections.MOTION === m.id ? 'bg-primary-50 border-primary-500 text-primary-600' : 'bg-gray-50 border-transparent text-slate-500 hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}
                              >
                                 <span className="text-2xl mb-1 filter drop-shadow-sm">{m.icon}</span>
                                 <span className="text-xs font-bold">{m.label}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

               </section>
            </div>

         </main>
      </div>
   );
};

export default AvatarScreen;
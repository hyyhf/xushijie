import React, { useState, useEffect } from 'react';
import { Undo, Redo, Save, Mic, Sparkles, Layout, Music, User, Loader2, Map, Crown, Wand2, Eye } from 'lucide-react';
import { useUser } from '../src/lib/userContext';
import Avatar3DViewer from '../components/Avatar3DViewer';
import {
   getAvatarConfig,
   saveAvatarConfig,
   getDefaultAvatarConfig,
   AVATAR_LIBRARY,
   AVATAR_STYLES,
   CHARACTER_MODELS,
   SCENE_PRESETS,
   SCENE_EFFECTS,
   COLORS,
   MOTIONS,
   AvatarConfig,
   CharacterModel,
   ScenePreset
} from '../src/services/avatarService';

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
   const [activeTab, setActiveTab] = useState<'CHARACTER' | 'CUSTOM' | 'SCENE' | 'VOICE' | 'MOTION'>('CHARACTER');
   const [subCategory, setSubCategory] = useState<keyof typeof CUSTOMIZE_OPTIONS>('HAIR');
   const [isSaving, setIsSaving] = useState(false);
   const [saveMessage, setSaveMessage] = useState<string | null>(null);
   const [activeStyle, setActiveStyle] = useState('micah');
   const [selectedEffects, setSelectedEffects] = useState<string[]>([]);

   // Selection States
   const [currentAvatarSeed, setCurrentAvatarSeed] = useState('Natsumi');
   const [selectedCharacter, setSelectedCharacter] = useState<CharacterModel | null>(null);
   const [selectedScene, setSelectedScene] = useState<ScenePreset>(SCENE_PRESETS[0]);
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
            setActiveStyle(config.style || 'micah');
            if (config.scene) {
               const scene = SCENE_PRESETS.find(s => s.id === config.scene);
               if (scene) setSelectedScene(scene);
            }
            if (config.characterId) {
               const char = CHARACTER_MODELS.find(c => c.id === config.characterId);
               if (char) setSelectedCharacter(char);
            }
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
         style: activeStyle,
         hair: selections.HAIR,
         face: selections.FACE,
         clothes: selections.CLOTHES,
         makeup: selections.MAKEUP,
         color: selections.COLOR,
         voice_pitch: selections.VOICE_PITCH,
         motion: selections.MOTION,
         scene: selectedScene.id,
         characterId: selectedCharacter?.id || ''
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

   const toggleEffect = (effectId: string) => {
      setSelectedEffects(prev =>
         prev.includes(effectId)
            ? prev.filter(e => e !== effectId)
            : [...prev, effectId]
      );
   };

   // Generate dynamic avatar URL based on selections
   const getAvatarUrl = (seedOverride?: string, styleOverride?: string) => {
      if (selectedCharacter) {
         return selectedCharacter.thumbnailUrl;
      }
      const baseSeed = seedOverride || currentAvatarSeed;
      const style = styleOverride || activeStyle;
      const featureSeed = `${baseSeed}-${selections.HAIR}-${selections.CLOTHES}`;

      const selectedColorObj = COLORS.find(c => c.id === selections.COLOR);
      const colorHex = selectedColorObj ? selectedColorObj.hex.replace('#', '') : 'FFD6A5';

      if (style === 'bottts' || style === 'fun-emoji' || style === 'pixel-art') {
         return `https://api.dicebear.com/9.x/${style}/svg?seed=${featureSeed}&backgroundColor=transparent`;
      }

      return `https://api.dicebear.com/9.x/${style}/svg?seed=${featureSeed}&hairColor=${colorHex}&backgroundColor=transparent`;
   };

   const filteredAvatars = AVATAR_LIBRARY.filter(a => a.style === activeStyle);

   return (
      <div className="bg-slate-950 min-h-screen flex flex-col font-sans text-white pb-24">
         {/* Header */}
         <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-4 pt-5 shadow-lg sticky top-0 z-50">
            <div className="flex justify-between items-center mb-3">
               <h1 className="text-lg font-bold flex items-center gap-2">
                  <Wand2 size={20} className="text-yellow-400" />
                  虚拟主播工作台
                  <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full font-medium">3D</span>
               </h1>
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm disabled:opacity-50 border border-white/10"
               >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? '保存中...' : '保存配置'}
               </button>
            </div>

            {saveMessage && (
               <div className={`mb-2 text-xs font-medium px-3 py-1 rounded-full inline-block ${saveMessage.includes('失败') ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {saveMessage}
               </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl backdrop-blur-md overflow-x-auto no-scrollbar">
               {[
                  { id: 'CHARACTER', label: '角色', icon: Crown },
                  { id: 'CUSTOM', label: '捏脸', icon: User },
                  { id: 'SCENE', label: '场景', icon: Map },
                  { id: 'VOICE', label: '声线', icon: Mic },
                  { id: 'MOTION', label: '动作', icon: Sparkles }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-white/70 hover:bg-white/10'}`}
                  >
                     <tab.icon size={14} />
                     {tab.label}
                  </button>
               ))}
            </div>
         </header>

         <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">

            {/* 3D Avatar Preview */}
            <section className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative aspect-[3/4]">
               <Avatar3DViewer
                  avatarUrl={getAvatarUrl()}
                  sceneBackgroundUrl={selectedScene.backgroundUrl}
                  overlayGradient={selectedScene.overlayGradient}
                  particleColor={selectedScene.particleColor}
                  effects={selectedEffects}
                  glowColor={selectedCharacter?.glowColor || '#a855f7'}
               />

               {/* Controls Overlay */}
               <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button onClick={handleUndo} disabled={historyIndex === 0} className="w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors border border-white/10">
                     <Undo size={16} />
                  </button>
                  <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors border border-white/10">
                     <Redo size={16} />
                  </button>
               </div>

               {/* Bottom Label */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium text-white/90 shadow-sm whitespace-nowrap z-10 flex items-center gap-2">
                  <Eye size={12} />
                  {selectedCharacter ? selectedCharacter.name : '3D 实时预览'} | {selectedScene.name}
               </div>
            </section>

            {/* CHARACTER TAB - Featured Characters */}
            {activeTab === 'CHARACTER' && (
               <div className="space-y-4">
                  {/* Featured Characters */}
                  <section className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                     <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <Crown size={16} />
                        明星角色 (3D)
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                        {CHARACTER_MODELS.map(char => (
                           <button
                              key={char.id}
                              onClick={() => {
                                 setSelectedCharacter(char);
                                 const scene = SCENE_PRESETS.find(s => s.id === char.recommendedScene);
                                 if (scene) setSelectedScene(scene);
                              }}
                              className={`relative rounded-2xl overflow-hidden aspect-[3/4] group transition-all ${selectedCharacter?.id === char.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950 scale-[0.98]' : 'hover:scale-[0.97]'}`}
                           >
                              <div
                                 className="absolute inset-0"
                                 style={{
                                    background: `linear-gradient(135deg, ${char.glowColor}33 0%, transparent 70%)`
                                 }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                 <img
                                    src={char.thumbnailUrl}
                                    alt={char.name}
                                    className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                                 />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                 <div className="flex items-center gap-2">
                                    <span
                                       className="w-2 h-2 rounded-full"
                                       style={{ backgroundColor: char.glowColor }}
                                    />
                                    <span className="text-xs font-bold text-white">{char.name}</span>
                                 </div>
                                 <p className="text-[10px] text-white/60 mt-0.5 line-clamp-1">{char.description}</p>
                                 <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{char.category}</span>
                              </div>
                              {selectedCharacter?.id === char.id && (
                                 <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                    <Sparkles size={12} className="text-black" />
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Style Category */}
                  <section className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                     <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">DiceBear 风格库</h3>
                     <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
                        {AVATAR_STYLES.map(style => (
                           <button
                              key={style.id}
                              onClick={() => {
                                 setActiveStyle(style.id);
                                 setSelectedCharacter(null);
                                 const firstAvatar = AVATAR_LIBRARY.find(a => a.style === style.id);
                                 if (firstAvatar) setCurrentAvatarSeed(firstAvatar.seed);
                              }}
                              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeStyle === style.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
                           >
                              <span>{style.icon}</span>
                              {style.name}
                           </button>
                        ))}
                     </div>

                     {/* Avatars in current style */}
                     <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                        {filteredAvatars.map(avatar => (
                           <button
                              key={avatar.id}
                              onClick={() => {
                                 setCurrentAvatarSeed(avatar.seed);
                                 setSelectedCharacter(null);
                              }}
                              className="flex flex-col items-center gap-2 min-w-[60px] group transition-transform active:scale-95"
                           >
                              <div className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all bg-white/5 ${currentAvatarSeed === avatar.seed && !selectedCharacter ? 'border-purple-400 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-slate-950' : 'border-white/10 group-hover:border-purple-400/50'}`}>
                                 <img src={`https://api.dicebear.com/9.x/${avatar.style}/svg?seed=${avatar.seed}&backgroundColor=transparent`} alt={avatar.name} className="w-full h-full" />
                              </div>
                              <span className={`text-xs font-medium ${currentAvatarSeed === avatar.seed && !selectedCharacter ? 'text-purple-400' : 'text-white/50'}`}>{avatar.name}</span>
                           </button>
                        ))}
                     </div>
                  </section>
               </div>
            )}

            {/* CUSTOM TAB */}
            {activeTab === 'CUSTOM' && (
               <section className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[350px] backdrop-blur-sm">
                  {/* Sub Tabs */}
                  <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                     {[
                        { id: 'HAIR', label: '发型' },
                        { id: 'FACE', label: '脸型' },
                        { id: 'MAKEUP', label: '妆容' },
                        { id: 'CLOTHES', label: '服装' }
                     ].map(cat => (
                        <button
                           key={cat.id}
                           onClick={() => setSubCategory(cat.id as any)}
                           className={`flex-1 min-w-[80px] py-3 text-sm font-bold relative transition-colors ${subCategory === cat.id ? 'text-purple-400' : 'text-white/40 hover:text-white/60'}`}
                        >
                           {cat.label}
                           {subCategory === cat.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-purple-500 rounded-t-full" />}
                        </button>
                     ))}
                  </div>

                  {/* Grid Content */}
                  <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
                     <div className="grid grid-cols-4 gap-3">
                        {CUSTOMIZE_OPTIONS[subCategory].map((item) => (
                           <button
                              key={item.id}
                              onClick={() => {
                                 updateSelection(subCategory, item.id);
                                 setSelectedCharacter(null);
                              }}
                              className={`aspect-square rounded-xl bg-white/5 border-2 overflow-hidden relative transition-all group ${selections[subCategory] === item.id ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent hover:border-white/20'}`}
                           >
                              <img
                                 src={`https://api.dicebear.com/9.x/${activeStyle}/svg?seed=${currentAvatarSeed}-${item.seed}&backgroundColor=transparent&scale=120`}
                                 className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                 alt="Option"
                              />
                              {selections[subCategory] === item.id && (
                                 <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                    <div className="bg-purple-500 text-white rounded-full p-0.5 shadow-sm">
                                       <Sparkles size={12} />
                                    </div>
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>

                     {/* Color Palette */}
                     <div className="mt-6">
                        <h4 className="text-xs font-bold text-white/40 mb-3 flex items-center justify-between">
                           个性配色
                           <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">头发/服饰</span>
                        </h4>
                        <div className="flex gap-3 flex-wrap">
                           {COLORS.map(c => (
                              <button
                                 key={c.id}
                                 onClick={() => updateSelection('COLOR', c.id)}
                                 className={`w-9 h-9 rounded-full shadow-sm border-2 transition-transform ${selections.COLOR === c.id ? 'scale-110 border-white ring-2 ring-white/30' : 'border-white/10 hover:scale-105'}`}
                                 style={{ backgroundColor: c.hex }}
                                 title={c.hex}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* SCENE TAB */}
            {activeTab === 'SCENE' && (
               <div className="space-y-4">
                  {/* Scene Grid */}
                  <section className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                     <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                        <Map size={16} className="text-cyan-400" />
                        直播场景选择
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                        {SCENE_PRESETS.map(scene => (
                           <button
                              key={scene.id}
                              onClick={() => setSelectedScene(scene)}
                              className={`relative rounded-2xl overflow-hidden aspect-[16/10] group transition-all ${selectedScene.id === scene.id ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[0.98]' : 'hover:scale-[0.97] opacity-80 hover:opacity-100'}`}
                           >
                              <img
                                 src={scene.backgroundUrl}
                                 alt={scene.name}
                                 className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0" style={{ background: scene.overlayGradient }} />
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                 <div className="flex items-center gap-1.5">
                                    <span>{scene.icon}</span>
                                    <span className="text-xs font-bold text-white">{scene.name}</span>
                                 </div>
                                 <p className="text-[10px] text-white/60 mt-0.5">{scene.description}</p>
                              </div>
                              {selectedScene.id === scene.id && (
                                 <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                    <Sparkles size={10} className="text-black" />
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Scene Effects */}
                  <section className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                     <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        场景特效
                     </h3>
                     <div className="grid grid-cols-4 gap-3">
                        {SCENE_EFFECTS.map(effect => (
                           <button
                              key={effect.id}
                              onClick={() => toggleEffect(effect.id)}
                              className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedEffects.includes(effect.id)
                                 ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                                 : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
                           >
                              <span className="text-xl">{effect.icon}</span>
                              <span className="text-[10px] font-bold">{effect.name}</span>
                              {selectedEffects.includes(effect.id) && (
                                 <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                              )}
                           </button>
                        ))}
                     </div>
                     <p className="text-[10px] text-white/30 mt-3">建议同时不超过3个特效以保证画面流畅</p>
                  </section>
               </div>
            )}

            {/* VOICE TAB */}
            {activeTab === 'VOICE' && (
               <section className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm flex flex-col h-full">
                  <div className="mb-8">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-white/80 flex items-center gap-2">
                           <Mic size={16} className="text-green-400" /> 音调/声线
                        </label>
                        <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{selections.VOICE_PITCH}</span>
                     </div>
                     <input
                        type="range"
                        min="0" max="100"
                        value={selections.VOICE_PITCH}
                        onChange={(e) => updateSelection('VOICE_PITCH', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                     />
                     <div className="flex justify-between text-[10px] text-white/30 mt-1">
                        <span>低沉</span>
                        <span>清亮</span>
                     </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col">
                     <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                        <Layout size={16} className="text-blue-400" /> 场景化文案模板库
                     </h3>
                     <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                        {VOICE_TEMPLATES.map(tpl => (
                           <div key={tpl.id} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                              <div className="flex justify-between items-start mb-1">
                                 <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                                       <Music size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-white/80">{tpl.title}</span>
                                 </div>
                                 <span className="text-[10px] text-white/30 bg-white/5 px-1.5 rounded">{tpl.duration}</span>
                              </div>
                              <p className="text-[10px] text-white/40 pl-10 line-clamp-1">{tpl.content}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            )}

            {/* MOTION TAB */}
            {activeTab === 'MOTION' && (
               <section className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-pink-400" /> 动作触发列表
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                     {MOTIONS.map(m => (
                        <button
                           key={m.id}
                           onClick={() => updateSelection('MOTION', m.id)}
                           className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selections.MOTION === m.id ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:border-white/10'}`}
                        >
                           <span className="text-2xl mb-1">{m.icon}</span>
                           <span className="text-xs font-bold">{m.label}</span>
                        </button>
                     ))}
                  </div>
               </section>
            )}

         </main>
      </div>
   );
};

export default AvatarScreen;
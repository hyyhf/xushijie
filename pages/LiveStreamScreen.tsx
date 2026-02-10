import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Gift, Send, MoreHorizontal, Gamepad2, Zap, Trophy, Mic, Wand2, ThumbsUp, Rocket, Gem, Car, Crown, Coffee, Signpost, Sparkles } from 'lucide-react';
import { getLiveRoomConfig, LiveRoomConfig } from './LiveRoomCustomizeScreen';
import {
   getAvatarConfig,
   getDefaultAvatarConfig,
   SCENE_PRESETS,
   CHARACTER_MODELS,
   AvatarConfig,
   AVATAR_STYLES
} from '../src/services/avatarService';

interface LiveStreamScreenProps {
   onClose: () => void;
}

// Scene effect options (kept for compatibility)
const effectOptions = [
   { id: 'sparkles', name: '闪光', icon: '✨', color: '#FFD700' },
   { id: 'hearts', name: '爱心', icon: '💕', color: '#ff6b81' },
   { id: 'confetti', name: '彩带', icon: '🎉', color: '#a29bfe' },
   { id: 'stars', name: '星星', icon: '⭐', color: '#ffe135' },
   { id: 'bubbles', name: '气泡', icon: '🫧', color: '#74b9ff' },
   { id: 'fire', name: '火焰', icon: '🔥', color: '#ff7675' },
];

// Particle system
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
            return [...prev.slice(-15), newParticle];
         });
      }, 800);
      return () => clearInterval(interval);
   }, []);

   const getIcon = () => {
      const effect = effectOptions.find(e => e.id === type);
      return effect ? effect.icon : '✨';
   };

   return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         {particles.map(p => (
            <div
               key={p.id}
               className="absolute bottom-0 text-3xl animate-float-up opacity-0"
               style={{
                  left: `${p.left}%`,
                  fontSize: `${p.scale}rem`,
                  animationDuration: '4s',
                  animationTimingFunction: 'ease-out'
               }}
            >
               {getIcon()}
            </div>
         ))}
      </div>
   );
};

const LiveStreamScreen: React.FC<LiveStreamScreenProps> = ({ onClose }) => {
   const [likes, setLikes] = useState(0);
   const [showInteractions, setShowInteractions] = useState(false);
   const [comments, setComments] = useState([
      { user: '小柠檬', text: '主播这件衣服多少钱？' },
      { user: 'Kevin', text: '已下单，求发货！' },
      { user: '爱吃猫的鱼', text: '66666' },
   ]);
   const [inputValue, setInputValue] = useState('');
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const [config, setConfig] = useState<LiveRoomConfig | null>(null);
   const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
   const [showCouponPopup, setShowCouponPopup] = useState(false);

   useEffect(() => {
      const savedConfig = getLiveRoomConfig();
      setConfig(savedConfig);

      // Load avatar config
      const loadAvatar = async () => {
         const av = await getAvatarConfig('guest');
         setAvatarConfig(av || getDefaultAvatarConfig('guest'));
      };
      loadAvatar();

      if (savedConfig.couponEnabled && savedConfig.couponAutoSend) {
         setTimeout(() => setShowCouponPopup(true), 1500);
      }
   }, []);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [comments]);

   useEffect(() => {
      const timer = setInterval(() => {
         const newComments = [
            { user: '路人甲', text: '这个颜色好看！' },
            { user: 'VIP_User', text: '还有库存吗？' },
            { user: '西瓜皮', text: '主播好棒' },
            { user: 'System', text: '用户 "Tom" 送出了跑车' }
         ];
         const randomComment = newComments[Math.floor(Math.random() * newComments.length)];
         setComments(prev => [...prev.slice(-10), randomComment]);
      }, 3000);
      return () => clearInterval(timer);
   }, []);

   const handleSend = () => {
      if (inputValue.trim()) {
         setComments(prev => [...prev, { user: '我', text: inputValue }]);
         setInputValue('');
      }
   };

   const handleLike = () => {
      setLikes(prev => prev + 1);
   };

   // Get avatar display URL
   const getAvatarDisplayUrl = () => {
      if (!avatarConfig) return 'https://api.dicebear.com/9.x/micah/svg?seed=Natsumi&backgroundColor=transparent';

      if (avatarConfig.characterId) {
         const char = CHARACTER_MODELS.find(c => c.id === avatarConfig.characterId);
         if (char) return char.thumbnailUrl;
      }

      const style = avatarConfig.style || 'micah';
      return `https://api.dicebear.com/9.x/${style}/svg?seed=${avatarConfig.seed}&backgroundColor=transparent`;
   };

   // Get scene background
   const getSceneBackground = () => {
      if (!avatarConfig?.scene) return null;
      return SCENE_PRESETS.find(s => s.id === avatarConfig.scene);
   };

   // Get glow color from character or default
   const getGlowColor = () => {
      if (avatarConfig?.characterId) {
         const char = CHARACTER_MODELS.find(c => c.id === avatarConfig.characterId);
         if (char) return char.glowColor;
      }
      return config?.accentColor || '#a855f7';
   };

   const scene = getSceneBackground();
   const accentColor = config?.accentColor || getGlowColor();

   // Support Items Data
   const supportItems = [
      { name: '荧光棒', icon: Wand2, color: 'text-yellow-500' },
      { name: '灯牌', icon: Signpost, color: 'text-blue-500' },
      { name: '666', icon: ThumbsUp, color: 'text-orange-500' },
      { name: '爱心发射', icon: Heart, color: 'text-red-500' },
      { name: '火箭', icon: Rocket, color: 'text-purple-500' },
      { name: '钻石', icon: Gem, color: 'text-cyan-500' },
      { name: '跑车', icon: Car, color: 'text-red-600' },
      { name: '皇冠', icon: Crown, color: 'text-amber-500' },
      { name: '咖啡', icon: Coffee, color: 'text-brown-500' },
      { name: '礼盒', icon: Gift, color: 'text-pink-500' },
   ];

   // Background style - prioritize user's avatar scene
   const getBackgroundStyle = (): React.CSSProperties => {
      // First priority: user's avatar scene
      if (scene) {
         return {
            backgroundImage: `url(${scene.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
         };
      }

      // Second priority: live room custom config
      if (config?.backgroundImage) {
         return {
            backgroundImage: `url(${config.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
         };
      }

      // Fallback: gradient
      return {
         background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
      };
   };

   const getOverlayGradient = () => {
      if (scene) return scene.overlayGradient;
      return 'linear-gradient(135deg, rgba(139,0,255,0.3) 0%, rgba(255,0,128,0.2) 100%)';
   };

   return (
      <div className="absolute inset-0 bg-black z-50 flex flex-col font-sans overflow-hidden">
         {/* Background Layer - User's scene */}
         <div className="absolute inset-0 z-0" style={getBackgroundStyle()}>
            <div className="absolute inset-0" style={{ background: getOverlayGradient() }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
         </div>

         {/* Effects layer */}
         {config?.specialEffects.map(effectId => (
            <ParticleSystem key={effectId} type={effectId} />
         ))}

         {/* Virtual Avatar - center of screen */}
         <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
            <div className="relative animate-avatar-float">
               {/* Glow behind avatar */}
               <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-20 scale-150"
                  style={{ backgroundColor: getGlowColor() }}
               />
               <img
                  src={getAvatarDisplayUrl()}
                  alt="Virtual Host"
                  className="relative w-48 h-48 object-contain drop-shadow-2xl"
                  style={{
                     filter: `drop-shadow(0 0 30px ${getGlowColor()}55)`
                  }}
               />
               {/* Name tag */}
               <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[10px] font-bold whitespace-nowrap backdrop-blur-md border border-white/10"
                  style={{ backgroundColor: `${getGlowColor()}88` }}
               >
                  {avatarConfig?.characterId
                     ? CHARACTER_MODELS.find(c => c.id === avatarConfig.characterId)?.name || '虚拟主播'
                     : '虚拟主播'
                  }
               </div>
            </div>
         </div>

         {/* Coupon popup */}
         {showCouponPopup && config?.couponEnabled && (
            <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in">
               <div className="absolute inset-0 bg-black/50" onClick={() => setShowCouponPopup(false)} />
               <div className="relative z-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 mx-8 animate-in zoom-in duration-300 shadow-2xl">
                  <button
                     onClick={() => setShowCouponPopup(false)}
                     className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                     <X size={18} className="text-gray-600" />
                  </button>
                  <div className="text-center">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift size={32} className="text-white" />
                     </div>
                     <h3 className="text-white text-xl font-bold mb-2">恭喜获得专属优惠券！</h3>
                     <div className="bg-white rounded-2xl p-4 mt-4">
                        <div className="text-4xl font-black text-red-500 mb-1">
                           ¥{config.couponAmount}
                        </div>
                        <p className="text-gray-500 text-sm">满{config.couponMinSpend}元可用</p>
                     </div>
                     <button
                        onClick={() => setShowCouponPopup(false)}
                        className="mt-4 w-full py-3 bg-white text-red-500 rounded-full font-bold active:scale-95 transition-transform"
                     >
                        立即领取
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Top Controls */}
         <div className="relative z-10 pt-4 px-4 flex justify-between items-start">
            {/* Host Info */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-1 pr-4 border border-white/10">
               <div className="w-9 h-9 rounded-full bg-white p-0.5 relative overflow-hidden">
                  <img src={getAvatarDisplayUrl()} className="w-full h-full rounded-full object-contain bg-gradient-to-br from-purple-100 to-blue-100" alt="Host" />
                  <div
                     className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-white text-[8px] px-1 rounded-sm font-bold"
                     style={{ backgroundColor: accentColor }}
                  >
                     LIVE
                  </div>
               </div>
               <div>
                  <h3 className="text-white text-xs font-bold">{config?.hostTitle || '虚视界官方号'}</h3>
                  <p className="text-white/80 text-[10px]">1.2w 在看</p>
               </div>
               <button
                  className="ml-2 text-white text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
               >
                  关注
               </button>
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-4">
               <div className="flex -space-x-2 overflow-hidden">
                  {['Felix', 'Luna', 'Max'].map((name, i) => (
                     <img key={i} src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${name}&backgroundColor=b6e3f4`} className="w-8 h-8 rounded-full border border-white/20" alt="Viewer" />
                  ))}
               </div>
               <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/80 backdrop-blur-sm">
                  <X size={20} />
               </button>
            </div>
         </div>

         {/* Right Sidebar Actions */}
         <div className="absolute right-2 bottom-24 z-20 flex flex-col gap-6 items-center">
            <div className="flex flex-col items-center gap-1">
               <button onClick={handleLike} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
                  <Heart size={24} className={likes > 0 ? "text-red-500 fill-red-500" : "text-white"} />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">{likes}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
               <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle size={24} className="text-white" />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">238</span>
            </div>

            <div className="flex flex-col items-center gap-1">
               <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <Gift size={24} className="text-white" />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">送礼</span>
            </div>

            <div className="flex flex-col items-center gap-1">
               <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <Share2 size={24} className="text-white" />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">分享</span>
            </div>
         </div>

         {/* Bottom Area */}
         <div className="mt-auto relative z-10 px-4 pb-4">
            {/* Welcome + chat */}
            <div className="h-48 w-3/4 overflow-y-auto no-scrollbar mask-image-gradient mb-4 space-y-2">
               <div
                  className="backdrop-blur-sm rounded-lg p-2 inline-block"
                  style={{ backgroundColor: `${accentColor}cc` }}
               >
                  <p className="text-white text-xs font-bold">
                     {config?.welcomeMessage || '欢迎来到虚视界直播间，严禁违规言论！'}
                  </p>
               </div>
               {comments.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                     <div className="bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-xs text-white shadow-sm border border-white/5 inline-block max-w-full break-words">
                        <span className="font-bold mr-2" style={{ color: `${accentColor}aa` }}>{c.user}:</span>
                        {c.text}
                     </div>
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-2">
               <div className="flex-1 h-10 bg-black/40 backdrop-blur-md rounded-full px-4 flex items-center border border-white/10">
                  <input
                     type="text"
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="说点什么..."
                     className="bg-transparent border-none text-white text-sm w-full placeholder-white/50 focus:outline-none"
                  />
               </div>

               <button
                  onClick={() => setShowInteractions(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg shadow-purple-500/30"
               >
                  <Gamepad2 size={20} />
               </button>

               <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: accentColor }}
               >
                  <Send size={18} className="ml-0.5" />
               </button>
               <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <MoreHorizontal size={20} />
               </button>
            </div>
         </div>

         {/* Interactive Gameplay Zone (Bottom Sheet) */}
         {showInteractions && (
            <div className="absolute inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInteractions(false)} />
               <div className="bg-white rounded-t-3xl p-5 relative z-10 animate-in slide-in-from-bottom duration-300 pb-8 border border-white/20 shadow-2xl">
                  <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                     <Zap className="text-primary-500 fill-current" size={20} />
                     互动玩法区
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-3">发送虚拟应援</h4>
                        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
                           {supportItems.map((item, i) => (
                              <button key={i} className="flex flex-col items-center gap-1.5 group">
                                 <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 group-hover:border-primary-500 group-hover:bg-primary-50 transition-all shadow-sm group-active:scale-90">
                                    <item.icon size={24} className={item.color} strokeWidth={2} />
                                 </div>
                                 <span className="text-[10px] font-medium text-slate-600 group-hover:text-primary-500 truncate w-full text-center">{item.name}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <button className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform relative overflow-hidden">
                           <div className="absolute right-0 bottom-0 opacity-[0.08] transform translate-x-1/4 translate-y-1/4">
                              <Trophy size={80} />
                           </div>
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm z-10">
                              <Trophy size={20} className="fill-orange-500/20" />
                           </div>
                           <div className="text-left z-10">
                              <div className="text-sm font-bold text-slate-800">答题赢免单</div>
                              <div className="text-[10px] text-orange-600 font-medium mt-0.5">参与挑战 100%有奖</div>
                           </div>
                        </button>

                        <button className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform relative overflow-hidden">
                           <div className="absolute right-0 bottom-0 opacity-[0.08] transform translate-x-1/4 translate-y-1/4">
                              <Mic size={80} />
                           </div>
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm z-10">
                              <Mic size={20} />
                           </div>
                           <div className="text-left z-10">
                              <div className="text-sm font-bold text-slate-800">连麦砍价</div>
                              <div className="text-[10px] text-blue-600 font-medium mt-0.5">与主播1V1互动</div>
                           </div>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* CSS for animations */}
         <style>{`
                @keyframes float-up {
                    0% { transform: translateY(20px) scale(0.8); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translateY(-80vh) scale(1.2); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-fill-mode: forwards;
                }
                @keyframes avatar-float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-12px) scale(1.02); }
                }
                .animate-avatar-float {
                    animation: avatar-float 3s ease-in-out infinite;
                }
            `}</style>
      </div>
   );
};

export default LiveStreamScreen;
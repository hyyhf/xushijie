import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Gift, Send, MoreHorizontal, Gamepad2, Zap, Trophy, Mic, Wand2, ThumbsUp, Rocket, Gem, Car, Crown, Coffee, Signpost, Sparkles, ShoppingBag, Tag, ChevronDown, Check, Clock, Flame } from 'lucide-react';
import { getLiveRoomConfig, LiveRoomConfig } from './LiveRoomCustomizeScreen';
import {
   getAvatarConfig,
   getDefaultAvatarConfig,
   SCENE_PRESETS,
   CHARACTER_MODELS,
   AvatarConfig,
   AVATAR_STYLES
} from '../src/services/avatarService';
import {
   getLiveProducts,
   getLiveCoupons,
   claimCoupon,
   getUserCoupons,
   isTemplateClaimed,
   CouponTemplate,
   UserCoupon,
   LiveProduct,
} from '../src/services/couponService';
import { addToCart } from '../src/services/cartService';
import { AppScreen } from '../types';

interface LiveStreamScreenProps {
   onClose: () => void;
   onNavigate?: (screen: AppScreen, data?: any) => void;
}

// Scene effect options
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

const LiveStreamScreen: React.FC<LiveStreamScreenProps> = ({ onClose, onNavigate }) => {
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

   // Shopping panel state
   const [showShoppingPanel, setShowShoppingPanel] = useState(false);
   const [shoppingTab, setShoppingTab] = useState<'all' | 'current' | 'coupon'>('all');
   const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
   const [addedProductId, setAddedProductId] = useState<string | null>(null);

   // Coupon state
   const [showCouponPopup, setShowCouponPopup] = useState(false);
   const [couponTemplates, setCouponTemplates] = useState<CouponTemplate[]>([]);
   const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
   const [claimingId, setClaimingId] = useState<string | null>(null);
   const [claimResult, setClaimResult] = useState<{ success: boolean; message: string } | null>(null);
   const [showGrabAnimation, setShowGrabAnimation] = useState(false);
   const [grabCountdown, setGrabCountdown] = useState(0);

   // Toast
   const [toast, setToast] = useState<string | null>(null);

   useEffect(() => {
      const savedConfig = getLiveRoomConfig();
      setConfig(savedConfig);

      // Load avatar config
      const loadAvatar = async () => {
         const av = await getAvatarConfig('guest');
         setAvatarConfig(av || getDefaultAvatarConfig('guest'));
      };
      loadAvatar();

      // Load live products
      const loadProducts = async () => {
         const products = await getLiveProducts('default');
         setLiveProducts(products);
      };
      loadProducts();

      // Load coupons
      const loadCoupons = async () => {
         const templates = await getLiveCoupons('default');
         setCouponTemplates(templates);
         const myCoupons = await getUserCoupons();
         setUserCoupons(myCoupons);
      };
      loadCoupons();
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
            { user: 'System', text: '用户 "Tom" 送出了跑车' },
            { user: '甜甜圈', text: '刚抢到了优惠券，太开心了！' },
            { user: '美丽人生', text: '这个价格太划算了吧' },
         ];
         const randomComment = newComments[Math.floor(Math.random() * newComments.length)];
         setComments(prev => [...prev.slice(-10), randomComment]);
      }, 3000);
      return () => clearInterval(timer);
   }, []);

   const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2000);
   };

   const handleSend = () => {
      if (inputValue.trim()) {
         setComments(prev => [...prev, { user: '我', text: inputValue }]);
         setInputValue('');
      }
   };

   const handleLike = () => {
      setLikes(prev => prev + 1);
   };

   const handleAddToCart = async (product: LiveProduct) => {
      const success = await addToCart(product.product_id, 1, {}, {
         title: product.title,
         price: product.live_price || product.price,
         image_url: product.image_url,
      });
      if (success) {
         setAddedProductId(product.id);
         showToast('已加入购物车');
         setTimeout(() => setAddedProductId(null), 1500);
         // Add a system comment
         setComments(prev => [...prev.slice(-10), {
            user: 'System',
            text: `用户 "我" 抢购了 ${product.title}`
         }]);
      }
   };

   const handleClaimCoupon = async (templateId: string) => {
      setClaimingId(templateId);
      // Show grab animation
      setShowGrabAnimation(true);
      setGrabCountdown(3);

      // Countdown
      for (let i = 3; i > 0; i--) {
         setGrabCountdown(i);
         await new Promise(r => setTimeout(r, 600));
      }
      setShowGrabAnimation(false);

      const result = await claimCoupon(templateId);
      setClaimResult(result);

      if (result.success) {
         // Refresh user coupons
         const myCoupons = await getUserCoupons();
         setUserCoupons(myCoupons);
         // Refresh templates for updated count
         const templates = await getLiveCoupons('default');
         setCouponTemplates(templates);
      }

      setTimeout(() => {
         setClaimResult(null);
         setClaimingId(null);
      }, 2000);
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

   const getSceneBackground = () => {
      if (!avatarConfig?.scene) return null;
      return SCENE_PRESETS.find(s => s.id === avatarConfig.scene);
   };

   const getGlowColor = () => {
      if (avatarConfig?.characterId) {
         const char = CHARACTER_MODELS.find(c => c.id === avatarConfig.characterId);
         if (char) return char.glowColor;
      }
      return config?.accentColor || '#a855f7';
   };

   const scene = getSceneBackground();
   const accentColor = config?.accentColor || getGlowColor();

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

   const getBackgroundStyle = (): React.CSSProperties => {
      if (scene) {
         return {
            backgroundImage: `url(${scene.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
         };
      }
      if (config?.backgroundImage) {
         return {
            backgroundImage: `url(${config.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
         };
      }
      return {
         background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
      };
   };

   const getOverlayGradient = () => {
      if (scene) return scene.overlayGradient;
      return 'linear-gradient(135deg, rgba(139,0,255,0.3) 0%, rgba(255,0,128,0.2) 100%)';
   };

   const currentProducts = liveProducts.filter(p => p.is_current);
   const remainingCoupons = couponTemplates.filter(t => t.claimed_count < t.total_count);

   return (
      <div className="absolute inset-0 bg-black z-50 flex flex-col font-sans overflow-hidden">
         {/* Background Layer */}
         <div className="absolute inset-0 z-0" style={getBackgroundStyle()}>
            <div className="absolute inset-0" style={{ background: getOverlayGradient() }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
         </div>

         {/* Effects layer */}
         {config?.specialEffects.map(effectId => (
            <ParticleSystem key={effectId} type={effectId} />
         ))}

         {/* Virtual Avatar */}
         <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
            <div className="relative animate-avatar-float">
               <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-20 scale-150"
                  style={{ backgroundColor: getGlowColor() }}
               />
               <img
                  src={getAvatarDisplayUrl()}
                  alt="Virtual Host"
                  className="relative w-48 h-48 object-contain drop-shadow-2xl"
                  style={{ filter: `drop-shadow(0 0 30px ${getGlowColor()}55)` }}
               />
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

         {/* Toast */}
         {toast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md animate-in fade-in zoom-in duration-200 flex items-center gap-2">
               <Check size={14} className="text-green-400" />
               {toast}
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

            {/* Close + Viewers */}
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

         {/* Coupon floating banner - left side */}
         {remainingCoupons.length > 0 && (
            <button
               onClick={() => { setShowShoppingPanel(true); setShoppingTab('coupon'); }}
               className="absolute left-3 top-[72px] z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg animate-in slide-in-from-left duration-500"
               style={{ animation: 'coupon-pulse 2s ease-in-out infinite' }}
            >
               <Tag size={12} className="text-white" />
               <span className="text-white text-[11px] font-bold">领券</span>
               <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{remainingCoupons.length}</span>
            </button>
         )}

         {/* Right Sidebar Actions */}
         <div className="absolute right-2 bottom-24 z-20 flex flex-col gap-5 items-center">
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

            {/* Shopping bag button */}
            <div className="flex flex-col items-center gap-1 relative">
               <button
                  onClick={() => { setShowShoppingPanel(true); setShoppingTab('all'); }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg relative"
                  style={{ boxShadow: '0 0 20px rgba(255,107,53,0.5)' }}
               >
                  <ShoppingBag size={24} className="text-white" />
                  {/* Product count badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                     <span className="text-[10px] font-bold text-red-600">{liveProducts.length}</span>
                  </div>
                  {/* Pulse animation */}
                  <div className="absolute inset-0 rounded-full bg-orange-500/40 animate-ping" style={{ animationDuration: '2s' }} />
               </button>
               <span className="text-white text-[10px] font-bold shadow-black drop-shadow-md">购物袋</span>
            </div>

            <div className="flex flex-col items-center gap-1">
               <button
                  onClick={() => setShowInteractions(true)}
                  className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
               >
                  <Gift size={24} className="text-white" />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">互动</span>
            </div>

            <div className="flex flex-col items-center gap-1">
               <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <Share2 size={24} className="text-white" />
               </button>
               <span className="text-white text-xs font-medium shadow-black drop-shadow-md">分享</span>
            </div>
         </div>

         {/* Bottom Area: Chat + Input */}
         <div className="mt-auto relative z-10 px-4 pb-4">
            {/* Current product floating card */}
            {currentProducts.length > 0 && !showShoppingPanel && (
               <button
                  onClick={() => { setShowShoppingPanel(true); setShoppingTab('current'); }}
                  className="mb-3 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-xl p-2 pr-4 border border-white/10 active:scale-[0.98] transition-transform w-fit max-w-[85%]"
               >
                  <img src={currentProducts[0].image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 text-left">
                     <p className="text-white text-xs font-medium line-clamp-1">{currentProducts[0].title}</p>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-orange-400 text-sm font-bold">¥{currentProducts[0].live_price}</span>
                        <span className="text-white/40 text-[10px] line-through">¥{currentProducts[0].price}</span>
                        <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">讲解中</span>
                     </div>
                  </div>
                  <ChevronDown size={14} className="text-white/50 flex-shrink-0 ml-auto" />
               </button>
            )}

            {/* Chat messages */}
            <div className="h-40 w-3/4 overflow-y-auto no-scrollbar mask-image-gradient mb-4 space-y-2">
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
            </div>
         </div>

         {/* ==================== Shopping Panel (Bottom Sheet) ==================== */}
         {showShoppingPanel && (
            <div className="absolute inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
               <div className="absolute inset-0 bg-black/50" onClick={() => setShowShoppingPanel(false)} />
               <div className="relative z-10 bg-white rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300" style={{ maxHeight: '70vh' }}>
                  {/* Handle */}
                  <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

                  {/* Panel Header */}
                  <div className="px-4 py-2 flex items-center justify-between flex-shrink-0">
                     <h3 className="font-bold text-slate-800 text-base">直播间好物</h3>
                     <button onClick={() => setShowShoppingPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-0 px-4 border-b border-gray-100 flex-shrink-0">
                     {[
                        { key: 'all', label: '全部', count: liveProducts.length },
                        { key: 'current', label: '讲解中', count: currentProducts.length },
                        { key: 'coupon', label: '优惠券', count: remainingCoupons.length },
                     ].map(tab => (
                        <button
                           key={tab.key}
                           onClick={() => setShoppingTab(tab.key as any)}
                           className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${shoppingTab === tab.key ? 'text-red-500' : 'text-gray-500'
                              }`}
                        >
                           {tab.label}
                           {tab.count > 0 && (
                              <span className={`ml-1 text-[10px] px-1 py-0.5 rounded-full ${shoppingTab === tab.key ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
                                 }`}>{tab.count}</span>
                           )}
                           {shoppingTab === tab.key && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-500 rounded-full" />
                           )}
                        </button>
                     ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto pb-6">
                     {/* Products Tab */}
                     {(shoppingTab === 'all' || shoppingTab === 'current') && (
                        <div className="p-3 space-y-2">
                           {(shoppingTab === 'current' ? currentProducts : liveProducts).map((product, idx) => (
                              <div
                                 key={product.id}
                                 className={`bg-white rounded-xl p-3 flex gap-3 border ${product.is_current ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                                    } relative overflow-hidden`}
                              >
                                 {/* Product number */}
                                 <div className="absolute top-0 left-0">
                                    <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-br-lg ${product.is_current ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                                       }`}>
                                       {idx + 1}
                                    </div>
                                 </div>

                                 {/* Image */}
                                 <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                    {product.is_current && (
                                       <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white text-[9px] font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
                                          <Flame size={10} /> 讲解中
                                       </div>
                                    )}
                                    {product.tag && !product.is_current && (
                                       <div className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                          {product.tag}
                                       </div>
                                    )}
                                 </div>

                                 {/* Info */}
                                 <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                       <h4 className="text-sm text-slate-700 font-medium line-clamp-2 leading-tight">{product.title}</h4>
                                       <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] text-gray-400">已售 {product.sold_count}</span>
                                          <span className="text-[10px] text-gray-300">|</span>
                                          <span className="text-[10px] text-gray-400">库存 {product.stock_limit - product.sold_count}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-1">
                                       <div>
                                          <div className="flex items-center gap-1">
                                             <span className="bg-red-100 text-red-500 text-[9px] px-1 py-0.5 rounded font-bold">直播价</span>
                                          </div>
                                          <div className="flex items-baseline gap-1.5 mt-0.5">
                                             <span className="text-red-500 text-lg font-bold">¥{product.live_price}</span>
                                             <span className="text-gray-400 text-xs line-through">¥{product.price}</span>
                                          </div>
                                       </div>
                                       <button
                                          onClick={() => handleAddToCart(product)}
                                          disabled={addedProductId === product.id}
                                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${addedProductId === product.id
                                             ? 'bg-green-500 text-white'
                                             : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                                             }`}
                                       >
                                          {addedProductId === product.id ? '✓ 已加入' : '抢购'}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           {shoppingTab === 'current' && currentProducts.length === 0 && (
                              <div className="text-center py-12 text-gray-400 text-sm">暂无正在讲解的商品</div>
                           )}
                        </div>
                     )}

                     {/* Coupons Tab */}
                     {shoppingTab === 'coupon' && (
                        <div className="p-3 space-y-3">
                           {/* Grab banner */}
                           <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-3 text-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                              <p className="text-white text-sm font-bold relative z-10">🎉 直播间专属优惠券</p>
                              <p className="text-white/80 text-[11px] mt-0.5 relative z-10">限量发放，领完即止</p>
                           </div>

                           {couponTemplates.map((coupon) => {
                              const claimed = isTemplateClaimed(coupon.id, userCoupons);
                              const soldOut = coupon.claimed_count >= coupon.total_count;
                              const remaining = coupon.total_count - coupon.claimed_count;
                              const percentClaimed = Math.round((coupon.claimed_count / coupon.total_count) * 100);

                              return (
                                 <div
                                    key={coupon.id}
                                    className={`bg-white rounded-xl border overflow-hidden ${claimed ? 'border-gray-200 opacity-80' : soldOut ? 'border-gray-200 opacity-60' : 'border-red-200'
                                       }`}
                                 >
                                    <div className="flex">
                                       {/* Left: Amount */}
                                       <div className={`w-24 flex flex-col items-center justify-center py-3 relative ${claimed || soldOut ? 'bg-gray-100' : 'bg-gradient-to-b from-red-500 to-orange-500'
                                          }`}>
                                          <span className={`text-2xl font-black ${claimed || soldOut ? 'text-gray-400' : 'text-white'}`}>
                                             ¥{coupon.discount_amount}
                                          </span>
                                          <span className={`text-[10px] mt-0.5 ${claimed || soldOut ? 'text-gray-400' : 'text-white/80'}`}>
                                             满{coupon.min_spend}可用
                                          </span>
                                          {/* Dashed border */}
                                          <div className={`absolute right-0 top-2 bottom-2 border-r border-dashed ${claimed || soldOut ? 'border-gray-200' : 'border-white/30'
                                             }`} />
                                       </div>

                                       {/* Right: Info + Button */}
                                       <div className="flex-1 p-3 flex flex-col justify-between">
                                          <div>
                                             <h4 className="text-sm font-bold text-slate-700">{coupon.title}</h4>
                                             <div className="flex items-center gap-2 mt-1">
                                                <Clock size={10} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-400">
                                                   {new Date(coupon.end_time).toLocaleDateString()} 到期
                                                </span>
                                             </div>
                                          </div>
                                          <div className="flex items-center justify-between mt-2">
                                             {/* Progress bar */}
                                             <div className="flex-1 mr-3">
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                   <div
                                                      className={`h-full rounded-full transition-all ${claimed || soldOut ? 'bg-gray-300' : 'bg-gradient-to-r from-orange-400 to-red-500'
                                                         }`}
                                                      style={{ width: `${percentClaimed}%` }}
                                                   />
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-0.5">
                                                   {soldOut ? '已领完' : `剩余${remaining}张`}
                                                </p>
                                             </div>
                                             <button
                                                onClick={() => !claimed && !soldOut && handleClaimCoupon(coupon.id)}
                                                disabled={claimed || soldOut || claimingId === coupon.id}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${claimed
                                                   ? 'bg-gray-100 text-gray-400'
                                                   : soldOut
                                                      ? 'bg-gray-100 text-gray-400'
                                                      : claimingId === coupon.id
                                                         ? 'bg-orange-100 text-orange-500'
                                                         : 'bg-gradient-to-r from-red-500 to-orange-500 text-white active:scale-95 shadow-sm'
                                                   }`}
                                             >
                                                {claimed ? '已领取' : soldOut ? '已领完' : claimingId === coupon.id ? '抢券中...' : '领券抢购'}
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}

                           {couponTemplates.length === 0 && (
                              <div className="text-center py-12 text-gray-400 text-sm">暂无可领取的优惠券</div>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Go to cart button */}
                  {shoppingTab !== 'coupon' && onNavigate && (
                     <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
                        <button
                           onClick={() => {
                              setShowShoppingPanel(false);
                              onNavigate(AppScreen.CART);
                           }}
                           className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-bold active:scale-[0.98] transition-transform shadow-lg flex items-center justify-center gap-2"
                        >
                           <ShoppingBag size={16} />
                           去购物车结算
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* ==================== Grab Animation Overlay ==================== */}
         {showGrabAnimation && (
            <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce">
                     <span className="text-white text-4xl font-black">{grabCountdown}</span>
                  </div>
                  <p className="text-white text-lg font-bold">正在抢券...</p>
               </div>
            </div>
         )}

         {/* ==================== Claim Result Toast ==================== */}
         {claimResult && !showGrabAnimation && (
            <div className="absolute inset-0 z-[80] flex items-center justify-center animate-in fade-in zoom-in duration-300">
               <div className="absolute inset-0 bg-black/40" onClick={() => setClaimResult(null)} />
               <div className="relative z-10 bg-white rounded-2xl p-6 mx-10 shadow-2xl text-center animate-in zoom-in duration-300">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${claimResult.success ? 'bg-green-100' : 'bg-red-100'
                     }`}>
                     {claimResult.success ? (
                        <Check size={32} className="text-green-500" />
                     ) : (
                        <X size={32} className="text-red-500" />
                     )}
                  </div>
                  <h3 className={`text-lg font-bold ${claimResult.success ? 'text-green-600' : 'text-red-600'}`}>
                     {claimResult.success ? '🎉 抢券成功！' : '抢券失败'}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{claimResult.message}</p>
                  <button
                     onClick={() => setClaimResult(null)}
                     className="mt-4 px-6 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 active:scale-95 transition-transform"
                  >
                     知道了
                  </button>
               </div>
            </div>
         )}

         {/* ==================== Interactive Gameplay Zone ==================== */}
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
                @keyframes coupon-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
      </div>
   );
};

export default LiveStreamScreen;
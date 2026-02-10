import React, { useState } from 'react';
import { Bell, Menu, Search, Play, Volume2, Maximize2, ChevronRight, Zap, Gift, ShoppingBag, Smile } from 'lucide-react';
import { AppScreen } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);

  const liveStreams = [
    {
      id: 1,
      title: "职场穿搭专场",
      subtitle: "高级感西装外套",
      rank: 1,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      id: 2,
      title: "美妆护肤精选",
      subtitle: "敏感肌修护套装",
      rank: 2,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop",
      videoUrl: "https://www.w3schools.com/html/movie.mp4"
    }
  ];

  const hotProducts = [
    {
      id: 1,
      name: 'MAC 哑光唇膏 #316',
      tag: '热销',
      sales: '2380+',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: '兰蔻小黑瓶面部精华',
      tag: '爆款',
      sales: '1890+',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: '修身西装外套 黑色',
      tag: '新品',
      sales: '1200+',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&h=100&fit=crop'
    }
  ];

  const communityPosts = [
    {
      id: 1,
      title: '虚拟主播上身试穿效果太赞了！',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mia&backgroundColor=b6e3f4',
      user: '小仙女Mia',
      likes: 328,
      hot: true
    },
    {
      id: 2,
      title: '分享我的日常护肤步骤',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=400&fit=crop',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo&backgroundColor=ffd5dc',
      user: '护肤达人Leo',
      likes: 215,
      hot: false
    }
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-lg font-bold tracking-tight leading-none">虚视界</h1>
            <span className="text-slate-400 text-[10px] font-medium tracking-wide">虚拟带货平台</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-600 hover:text-primary-500 transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-slate-600 hover:text-primary-500 transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索虚拟主播、商品"
            className="w-full bg-gray-100 text-sm rounded-full py-3 pl-10 pr-4 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400"
          />
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        </div>
      </div>

      {/* Main Content */}
      <main className="space-y-6 px-4 mt-4">

        {/* Live Highlights */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-slate-900 text-lg font-bold flex items-center gap-2">
                直播高光
                <span className="px-1.5 py-0.5 bg-primary-500 text-white text-[10px] rounded font-bold">LIVE</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">月度排名前三商家</p>
            </div>
            <button
              onClick={() => onNavigate(AppScreen.LIVE_ROOM_CUSTOMIZE)}
              className="text-slate-500 text-xs flex items-center bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              主播风格 <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-2xl overflow-hidden shadow-card relative border border-gray-100 flex flex-col">
                <div className="relative aspect-[4/5] bg-gray-200">
                  {playingVideoId === stream.id ? (
                    <video
                      src={stream.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <>
                      <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm font-bold">TOP {stream.rank}</div>
                      <img src={stream.image} alt={stream.title} className="w-full h-full object-cover" />

                      {/* Play Overlay */}
                      <div
                        className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer group"
                        onClick={() => setPlayingVideoId(stream.id)}
                      >
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                          <Play size={20} fill="white" className="text-white ml-1" />
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                        <div className="flex justify-end text-white/90">
                          <div className="flex gap-2">
                            <Volume2 size={14} />
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{stream.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-xs text-slate-500 truncate">{stream.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hot Products */}
        <section
          onClick={() => onNavigate(AppScreen.HOT_PRODUCTS)}
          className="cursor-pointer transition-transform active:scale-[0.99]"
        >
          <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-4 border border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-slate-900 font-bold flex items-center gap-2">
                <Zap size={18} className="text-primary-500 fill-current" />
                热门推荐区
              </h2>
              <div className="text-xs text-slate-400 flex items-center">
                更多 <ChevronRight size={14} />
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pointer-events-none">
              {hotProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 flex items-center gap-3 w-48 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <img src={product.image} className="w-12 h-12 rounded-lg object-cover" alt={product.name} />
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-800 truncate w-24">{product.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-orange-500 bg-orange-50 px-1 rounded">{product.tag}</span>
                      <span className="text-[10px] text-slate-400">{product.sales}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Zone */}
        <section className="grid grid-cols-2 gap-3">
          <div
            onClick={() => onNavigate(AppScreen.AVATAR)}
            className="bg-white p-4 rounded-2xl shadow-card border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-blue-50 rounded-full -mr-6 -mt-6"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-2">
                <Gift size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-800">赢免单大奖</h3>
              <p className="text-[10px] text-slate-400 mt-1">答题挑战与虚拟道具</p>
            </div>
          </div>
          <div
            onClick={() => onNavigate(AppScreen.AVATAR)}
            className="bg-white p-4 rounded-2xl shadow-card border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-purple-50 rounded-full -mr-6 -mt-6"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-2">
                <Smile size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-800">虚拟形象</h3>
              <p className="text-[10px] text-slate-400 mt-1">定制您的专属替身</p>
            </div>
          </div>
        </section>

        {/* Community Feed */}
        <section
          onClick={() => onNavigate(AppScreen.COMMUNITY)}
          className="cursor-pointer group"
        >
          <h2 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-500" />
            消费者社区
            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors ml-auto" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm pb-2 hover:shadow-md transition-shadow">
                <div className="relative h-32 bg-gray-100">
                  <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                  {post.hot && <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">热评</span>}
                </div>
                <div className="px-2 pt-2">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{post.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1">
                      <img src={post.avatar} className="w-4 h-4 rounded-full" alt={post.user} />
                      <span className="text-[10px] text-slate-500">{post.user}</span>
                    </div>
                    <span className="text-[10px] text-slate-300">{post.likes} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomeScreen;
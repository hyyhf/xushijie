import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, TrendingUp, MoreHorizontal, MapPin, Activity, ChevronRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useUser } from '../src/lib/userContext';
import { getMerchantProfile, getDashboardStats, DashboardStats, MerchantProfile } from '../src/services/merchantService';

const MerchantScreen: React.FC = () => {
   const { user } = useUser();
   const [profile, setProfile] = useState<MerchantProfile | null>(null);
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   // Load merchant data
   useEffect(() => {
      const loadData = async () => {
         setIsLoading(true);
         const [merchantProfile, dashboardStats] = await Promise.all([
            getMerchantProfile(user?.id || ''),
            getDashboardStats(user?.id || '')
         ]);
         setProfile(merchantProfile);
         setStats(dashboardStats);
         setIsLoading(false);
      };
      loadData();
   }, [user?.id]);

   // Simulate realtime viewer updates
   useEffect(() => {
      const interval = setInterval(async () => {
         const newStats = await getDashboardStats(user?.id || '');
         setStats(newStats);
      }, 5000);
      return () => clearInterval(interval);
   }, [user?.id]);

   if (isLoading || !stats) {
      return (
         <div className="bg-gray-50 min-h-screen pb-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-500" size={32} />
         </div>
      );
   }

   return (
      <div className="bg-gray-50 min-h-screen pb-24 font-sans">
         {/* Header Section */}
         <header className="bg-gradient-to-br from-[#FF6B00] to-[#FF8E3D] text-white pt-6 pb-32 px-6 rounded-b-[2.5rem] shadow-glow relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -ml-20 -mb-10 pointer-events-none"></div>

            {/* Navigation Bar */}
            <div className="relative z-10 flex justify-between items-center mb-8">
               <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors">
                  <ArrowLeft size={20} strokeWidth={2.5} />
               </button>
               <h1 className="text-lg font-bold tracking-wide">商家数据中心</h1>
               <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md relative hover:bg-white/30 transition-colors">
                  <Bell size={20} strokeWidth={2.5} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
               </button>
            </div>

            {/* Real-time Monitor Section */}
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <Activity className="text-white" size={24} strokeWidth={2.5} />
                     <h2 className="text-2xl font-bold tracking-tight">实时监控</h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                     </span>
                     <span className="text-xs font-bold text-white tracking-wide">直播中</span>
                  </div>
               </div>

               <div className="mt-4">
                  <p className="text-orange-100 text-xs font-medium mb-1 opacity-90">当前在线人数 (Peak Viewers)</p>
                  <div className="flex items-end gap-3">
                     <span className="text-6xl font-bold tracking-tighter leading-none">
                        {stats.currentViewers.toLocaleString()}
                     </span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                     <TrendingUp size={14} className="text-white" />
                     <span className="text-xs font-bold text-white">较昨日同时段 +{stats.viewersChange}%</span>
                  </div>
               </div>
            </div>
         </header>

         {/* Floating Stats Cards */}
         <div className="px-5 -mt-20 relative z-20">
            <div className="flex gap-4">
               {/* CVR Card */}
               <div className="flex-1 bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400">转化率 (CVR)</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight mb-3">{stats.cvr}%</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full" style={{ width: `${stats.cvr * 10}%` }}></div>
                  </div>
               </div>

               {/* Avg Stay Card */}
               <div className="flex-1 bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400">人均停留</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight mb-3">{stats.avgStayTime}</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full w-[80%] rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>

         <main className="px-5 mt-5 space-y-5">
            {/* User Persona Chart */}
            <section className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 text-base">用户画像分布</h3>
                  <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={20} /></button>
               </div>

               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart
                        data={stats.ageDistribution}
                        layout="vertical"
                        barSize={12}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                     >
                        <XAxis type="number" hide />
                        <YAxis
                           dataKey="name"
                           type="category"
                           axisLine={false}
                           tickLine={false}
                           width={40}
                           tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip
                           cursor={{ fill: 'transparent' }}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        />
                        {/* Background Track */}
                        <Bar
                           dataKey="value"
                           fill="#FF6B00"
                           radius={[6, 6, 6, 6]}
                           background={{ fill: '#F1F5F9', radius: 6 }}
                        />
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Gender Legend */}
               <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     {stats.genderDistribution.map((g, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <span className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                           <span className="text-xs font-bold text-slate-500">{g.gender} {g.percentage}%</span>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Geo Heatmap */}
            <section className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-base">地域分布热力</h3>
                  <MapPin size={18} className="text-slate-400" />
               </div>
               <div className="h-40 bg-blue-50/50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-blue-50 group">
                  {/* Map Background Placeholder */}
                  <div
                     className="absolute inset-0 opacity-30 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                     style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')" }}
                  ></div>

                  {/* Floating Tag */}
                  <div className="relative z-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-bold text-primary-600 flex items-center gap-2 border border-white/50">
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                     </span>
                     Top 1: {stats.topRegion}
                  </div>

                  <div className="absolute bottom-3 right-3">
                     <button className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-primary-500 transition-colors">
                        <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
            </section>
         </main>
      </div>
   );
};

export default MerchantScreen;
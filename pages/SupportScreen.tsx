import React from 'react';
import { ArrowLeft, Bell, Search, ShieldCheck, ChevronRight, AlertCircle, Package, Truck, MoreHorizontal, UploadCloud } from 'lucide-react';

const SupportScreen: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <header className="bg-primary-500 pt-4 pb-12 px-5 rounded-b-[2rem] shadow-lg relative overflow-hidden text-white">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
         <div className="flex items-center justify-between mb-6 relative z-10">
            <button className="hover:bg-white/20 p-2 rounded-full transition"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-bold tracking-wide">安全与服务中心</h1>
            <button className="hover:bg-white/20 p-2 rounded-full transition"><Bell size={20}/></button>
         </div>
         
         {/* Search */}
         <div className="bg-white rounded-full flex items-center px-4 py-2.5 shadow-sm">
            <Search className="text-gray-400 mr-2" size={18} />
            <input type="text" placeholder="搜索安全指引或服务问题..." className="bg-transparent w-full text-sm text-slate-800 placeholder-gray-400 outline-none" />
         </div>
      </header>

      <main className="px-4 -mt-8 relative z-10 space-y-4">
         {/* Verification Status */}
         <section className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h2 className="text-base font-bold text-slate-800">商家认证状态</h2>
                     <p className="text-xs text-slate-400">保障权益，合规经营</p>
                  </div>
               </div>
               <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-200">已认证</span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center divide-x divide-gray-200">
               <div className="flex flex-col px-2 w-1/3 text-center">
                  <span className="text-[10px] text-slate-400 mb-1">信用评分</span>
                  <span className="text-xl font-bold text-primary-500">98.5</span>
               </div>
               <div className="flex flex-col px-2 w-1/3 text-center">
                  <span className="text-[10px] text-slate-400 mb-1">保证金</span>
                  <span className="text-sm font-bold text-slate-800">¥20,000</span>
               </div>
               <div className="flex flex-col px-2 w-1/3 text-center">
                  <span className="text-[10px] text-slate-400 mb-1">有效期</span>
                  <span className="text-sm font-bold text-slate-800">24.12.31</span>
               </div>
            </div>
         </section>

         {/* Tools Grid */}
         <section className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-card flex flex-col justify-between h-40 relative overflow-hidden group border border-gray-100">
               <div className="absolute right-[-20px] top-[-20px] w-20 h-20 bg-blue-50 rounded-full transition-transform group-hover:scale-110"></div>
               <div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
                     <span className="material-icons-round font-bold text-lg">face</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-slate-800">虚拟形象合规</h3>
                  <p className="text-[10px] text-slate-400 leading-tight">形象版权检测与违规排查</p>
               </div>
               <div className="mt-2 flex items-center text-blue-600 text-xs font-medium">
                  立即检测 <ChevronRight size={14} />
               </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card flex flex-col justify-between h-40 relative overflow-hidden group border border-gray-100">
               <div className="absolute right-[-20px] top-[-20px] w-20 h-20 bg-orange-50 rounded-full transition-transform group-hover:scale-110"></div>
               <div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3 text-primary-500">
                     <span className="material-icons-round font-bold text-lg">qr_code</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-slate-800">直播间二维码</h3>
                  <p className="text-[10px] text-slate-400 leading-tight">生成专属直播入口码</p>
               </div>
               <div className="mt-2 flex items-center text-primary-500 font-medium text-xs">
                  生成代码 <ChevronRight size={14} />
               </div>
            </div>
         </section>

         {/* After Sales */}
         <section className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-5 shadow-card border border-orange-100">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-base font-bold flex items-center text-slate-800">
                  <span className="bg-primary-100 p-1 rounded mr-2 text-primary-600"><ShieldCheck size={16}/></span>
                  消费者售后通道
               </h2>
               <a href="#" className="text-xs text-primary-600 font-medium flex items-center">
                  查看历史 <ChevronRight size={14} />
               </a>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
               {[
                 { icon: Truck, label: '物流异常' },
                 { icon: Package, label: '商品破损' },
                 { icon: AlertCircle, label: '质量问题' },
                 { icon: MoreHorizontal, label: '其他' }
               ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                     <button className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2 text-orange-500 hover:bg-orange-50 transition-colors">
                        <item.icon size={20} />
                     </button>
                     <span className="text-[10px] text-slate-500">{item.label}</span>
                  </div>
               ))}
            </div>

            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center">
               <UploadCloud className="text-gray-400 mb-1" size={28} />
               <p className="text-xs font-medium text-slate-700">快速举证上传</p>
               <p className="text-[10px] text-slate-400 mt-0.5">支持图片/视频，保障消费者权益</p>
               <button className="mt-3 bg-primary-500 text-white text-xs px-6 py-2 rounded-full font-bold shadow-md shadow-orange-500/20">
                  上传凭证
               </button>
            </div>
         </section>

         {/* FAQ */}
         <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-500 ml-1">常见问题</h3>
            <div className="bg-white rounded-xl shadow-card divide-y divide-gray-50">
               {['如何提高虚拟主播的互动率？', '直播间违禁词汇速查表', '虚拟形象版权申请流程'].map((q, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                     <span className="text-sm text-slate-700">{q}</span>
                     <ChevronRight className="text-gray-300" size={16} />
                  </button>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
};

export default SupportScreen;
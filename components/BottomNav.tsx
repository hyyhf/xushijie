import React from 'react';
import { Home, Video, ShoppingBag, User, BarChart2, ShieldCheck, LogOut, Radio } from 'lucide-react';
import { AppScreen, UserRole } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setCurrentScreen, userRole, onLogout }) => {
  const navItemClass = (screen: AppScreen) =>
    `flex flex-col items-center gap-1 transition-colors ${currentScreen === screen ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'}`;

  if (userRole === UserRole.MERCHANT) {
    return (
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-8 z-50 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
        <ul className="flex justify-between items-center">
          <li>
            <button onClick={() => setCurrentScreen(AppScreen.MERCHANT_DASHBOARD)} className={navItemClass(AppScreen.MERCHANT_DASHBOARD)}>
              <BarChart2 size={24} strokeWidth={currentScreen === AppScreen.MERCHANT_DASHBOARD ? 2.5 : 2} />
              <span className="text-[10px] font-medium">数据</span>
            </button>
          </li>
          <li>
            <button onClick={() => setCurrentScreen(AppScreen.SUPPORT)} className={navItemClass(AppScreen.SUPPORT)}>
              <ShieldCheck size={24} strokeWidth={currentScreen === AppScreen.SUPPORT ? 2.5 : 2} />
              <span className="text-[10px] font-medium">服务</span>
            </button>
          </li>
          <li className="-mt-8">
            <button className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-full shadow-lg shadow-orange-500/40 hover:scale-105 transition-transform">
              <Video size={28} fill="currentColor" />
            </button>
          </li>
          <li>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <ShoppingBag size={24} />
              <span className="text-[10px] font-medium">选品</span>
            </button>
          </li>
          <li>
            <button onClick={onLogout} className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500">
              <LogOut size={24} />
              <span className="text-[10px] font-medium">退出</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-8 z-50 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      <ul className="flex justify-between items-center">
        <li>
          <button onClick={() => setCurrentScreen(AppScreen.HOME)} className={navItemClass(AppScreen.HOME)}>
            <Home size={24} strokeWidth={currentScreen === AppScreen.HOME ? 2.5 : 2} />
            <span className="text-[10px] font-medium">首页</span>
          </button>
        </li>
        <li>
          <button onClick={() => setCurrentScreen(AppScreen.AVATAR)} className={navItemClass(AppScreen.AVATAR)}>
            <User size={24} strokeWidth={currentScreen === AppScreen.AVATAR ? 2.5 : 2} />
            <span className="text-[10px] font-medium">捏脸</span>
          </button>
        </li>
        <li className="-mt-8 relative z-10">
          <button
            onClick={() => setCurrentScreen(AppScreen.LIVE_STREAM)}
            className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-tr from-primary-600 to-primary-400 text-white rounded-full shadow-lg shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all group"
          >
            <Radio size={24} className="group-hover:animate-pulse" />
          </button>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary-500 whitespace-nowrap">我的直播</span>
        </li>
        <li>
          <button onClick={() => setCurrentScreen(AppScreen.SUPPORT)} className={navItemClass(AppScreen.SUPPORT)}>
            <ShieldCheck size={24} strokeWidth={currentScreen === AppScreen.SUPPORT ? 2.5 : 2} />
            <span className="text-[10px] font-medium">服务</span>
          </button>
        </li>
        <li>
          <button onClick={() => setCurrentScreen(AppScreen.PROFILE)} className={navItemClass(AppScreen.PROFILE)}>
            <User size={24} strokeWidth={currentScreen === AppScreen.PROFILE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">我</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
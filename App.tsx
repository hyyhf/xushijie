import React, { useState, useEffect } from 'react';
import { AppScreen, UserRole } from './types';
import LoginScreen from './pages/LoginScreen';
import HomeScreen from './pages/HomeScreen';
import AvatarScreen from './pages/AvatarScreen';
import MerchantScreen from './pages/MerchantScreen';
import SupportScreen from './pages/SupportScreen';
import HotProductsScreen from './pages/HotProductsScreen';
import CommunityScreen from './pages/CommunityScreen';
import LiveStreamScreen from './pages/LiveStreamScreen';
import ProfileScreen from './pages/ProfileScreen';
import LiveRoomCustomizeScreen from './pages/LiveRoomCustomizeScreen';
import ProductDetailScreen from './pages/ProductDetailScreen';
import CartScreen from './pages/CartScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import PaymentScreen from './pages/PaymentScreen';
import OrderListScreen from './pages/OrderListScreen';
import OrderDetailScreen from './pages/OrderDetailScreen';
import BottomNav from './components/BottomNav';
import { UserProfile, getCurrentUser, onAuthStateChange, signOut } from './src/services/authService';
import { UserContext } from './src/lib/userContext';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Shopping navigation data
  const [navData, setNavData] = useState<any>(null);

  // Navigation helper that supports passing data
  const handleNavigate = (screen: AppScreen, data?: any) => {
    setNavData(data || null);
    setCurrentScreen(screen);
  };

  // Check for existing session on app load
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking for current user...');
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('User check timed out after 3000ms');
            resolve(null);
          }, 3000); // 3 second timeout
        });

        const currentUser = await Promise.race([getCurrentUser(), timeoutPromise]);

        if (currentUser) {
          console.log('User session found:', currentUser.id);
          setUser(currentUser);
          setUserRole(currentUser.role as UserRole);
          if (currentUser.role === UserRole.MERCHANT) {
            setCurrentScreen(AppScreen.MERCHANT_DASHBOARD);
          } else {
            setCurrentScreen(AppScreen.HOME);
          }
        } else {
          console.log('No existing user session found (or check timed out).');
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((profile) => {
      console.log('Auth state changed:', profile ? 'Logged In' : 'Logged Out');
      if (profile) {
        setUser(profile);
        setUserRole(profile.role as UserRole);
      } else {
        setUser(null);
        setUserRole(UserRole.GUEST);
        setCurrentScreen(AppScreen.LOGIN);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = (role: UserRole, profile?: UserProfile) => {
    setUserRole(role);
    if (profile) {
      setUser(profile);
    }
    if (role === UserRole.MERCHANT) {
      setCurrentScreen(AppScreen.MERCHANT_DASHBOARD);
    } else {
      setCurrentScreen(AppScreen.HOME);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserRole(UserRole.GUEST);
    setCurrentScreen(AppScreen.LOGIN);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} />;
      case AppScreen.HOME:
        return <HomeScreen onNavigate={handleNavigate} />;
      case AppScreen.HOT_PRODUCTS:
        return <HotProductsScreen onNavigate={handleNavigate} />;
      case AppScreen.COMMUNITY:
        return <CommunityScreen onNavigate={handleNavigate} />;
      case AppScreen.LIVE_STREAM:
        return <LiveStreamScreen onClose={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.AVATAR:
        return <AvatarScreen />;
      case AppScreen.MERCHANT_DASHBOARD:
        return <MerchantScreen />;
      case AppScreen.SUPPORT:
        return <SupportScreen />;
      case AppScreen.PROFILE:
        return <ProfileScreen onNavigate={handleNavigate} onLogout={handleLogout} />;
      case AppScreen.LIVE_ROOM_CUSTOMIZE:
        return <LiveRoomCustomizeScreen onNavigate={handleNavigate} />;

      // Shopping screens
      case AppScreen.PRODUCT_DETAIL:
        return <ProductDetailScreen productId={navData?.productId || ''} onNavigate={handleNavigate} />;
      case AppScreen.CART:
        return <CartScreen onNavigate={handleNavigate} />;
      case AppScreen.CHECKOUT:
        return <CheckoutScreen checkoutItems={navData?.items || []} onNavigate={handleNavigate} />;
      case AppScreen.PAYMENT:
        return <PaymentScreen orderId={navData?.orderId || ''} total={navData?.total || 0} payMethod={navData?.payMethod || 'alipay'} onNavigate={handleNavigate} />;
      case AppScreen.ORDER_LIST:
        return <OrderListScreen onNavigate={handleNavigate} />;
      case AppScreen.ORDER_DETAIL:
        return <OrderDetailScreen orderId={navData?.orderId || ''} onNavigate={handleNavigate} />;

      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  const hideNav = currentScreen === AppScreen.LOGIN
    || currentScreen === AppScreen.LIVE_STREAM
    || currentScreen === AppScreen.PRODUCT_DETAIL
    || currentScreen === AppScreen.CART
    || currentScreen === AppScreen.CHECKOUT
    || currentScreen === AppScreen.PAYMENT
    || currentScreen === AppScreen.ORDER_LIST
    || currentScreen === AppScreen.ORDER_DETAIL;
  const showNav = !hideNav;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-xl mx-auto mb-4 animate-pulse"></div>
            <p className="text-slate-400 text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      <div className="min-h-screen bg-gray-50 flex justify-center items-start">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
          {/* Main Content Area */}
          <main className={`flex-1 overflow-y-auto no-scrollbar ${showNav ? 'pb-24' : ''}`}>
            {renderScreen()}
          </main>

          {/* Bottom Navigation */}
          {showNav && (
            <BottomNav
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </UserContext.Provider>
  );
}
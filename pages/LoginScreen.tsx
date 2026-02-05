import React, { useState } from 'react';
import { UserRole } from '../types';
import { Box, Store, ArrowRight, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp, UserProfile } from '../src/services/authService';

interface LoginScreenProps {
  onLogin: (role: UserRole, profile?: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'CONSUMER' | 'MERCHANT'>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Consumer form state
  const [consumerEmail, setConsumerEmail] = useState('');
  const [consumerPassword, setConsumerPassword] = useState('');
  const [consumerConfirmPassword, setConsumerConfirmPassword] = useState('');

  // Merchant form state  
  const [merchantEmail, setMerchantEmail] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [merchantConfirmPassword, setMerchantConfirmPassword] = useState('');

  // Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleConsumerLogin = async () => {
    setError(null);

    // Validate inputs
    if (!consumerEmail.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!validateEmail(consumerEmail)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!consumerPassword) {
      setError('请输入密码');
      return;
    }
    if (!validatePassword(consumerPassword)) {
      setError('密码长度至少6位');
      return;
    }

    if (isRegisterMode) {
      if (consumerPassword !== consumerConfirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register new user
        const signUpResult = await signUp(consumerEmail, consumerPassword, UserRole.CONSUMER);
        if (signUpResult.success && signUpResult.user) {
          onLogin(UserRole.CONSUMER, signUpResult.user);
        } else {
          setError(signUpResult.error || '注册失败，请稍后重试');
        }
      } else {
        // Login existing user
        const result = await signIn(consumerEmail, consumerPassword);
        if (result.success && result.user) {
          onLogin(result.user.role as UserRole, result.user);
        } else {
          setError(result.error || '登录失败，请检查邮箱和密码');
        }
      }
    } catch (err) {
      setError('操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantLogin = async () => {
    setError(null);

    // Validate inputs
    if (!merchantEmail.trim()) {
      setError('请输入管理员邮箱');
      return;
    }
    if (!validateEmail(merchantEmail)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!merchantPassword) {
      setError('请输入密码');
      return;
    }
    if (!validatePassword(merchantPassword)) {
      setError('密码长度至少6位');
      return;
    }

    if (isRegisterMode) {
      if (merchantPassword !== merchantConfirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register new merchant
        const signUpResult = await signUp(merchantEmail, merchantPassword, UserRole.MERCHANT);
        if (signUpResult.success && signUpResult.user) {
          onLogin(UserRole.MERCHANT, signUpResult.user);
        } else {
          setError(signUpResult.error || '注册失败，请稍后重试');
        }
      } else {
        // Login existing merchant
        const result = await signIn(merchantEmail, merchantPassword);
        if (result.success && result.user) {
          onLogin(UserRole.MERCHANT, result.user);
        } else {
          setError(result.error || '登录失败，请检查邮箱和密码');
        }
      }
    } catch (err) {
      setError('操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
  };

  return (
    <div className="h-full w-full bg-white relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className={`absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b transition-colors duration-500 ${activeTab === 'CONSUMER' ? 'from-orange-50 to-white' : 'from-slate-50 to-white'} -z-10`} />

      {/* Slider View Container */}
      <div className={`flex w-[200%] h-full transition-transform duration-500 ease-in-out ${activeTab === 'MERCHANT' ? '-translate-x-1/2' : 'translate-x-0'}`}>

        {/* Consumer Section */}
        <section className="w-1/2 h-full px-8 py-10 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Box className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">虚视界</h2>
          </div>

          <div className="mt-2">
            <h1 className="text-3xl font-bold leading-tight text-slate-900">
              {isRegisterMode ? '创建账号' : '欢迎回来'}，<br />
              <span className="text-primary-500">{isRegisterMode ? '加入' : '发现'}</span>新视界
            </h1>
            <p className="text-slate-500 mt-3 text-sm">
              {isRegisterMode ? '注册以开始探索虚拟直播与精选好物' : '登录以探索最新的虚拟直播与精选好物'}
            </p>
          </div>

          {error && activeTab === 'CONSUMER' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full bg-white border-none h-14 rounded-2xl pl-12 pr-6 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500 shadow-sm outline-none transition-all"
                  placeholder="输入您的邮箱地址"
                  value={consumerEmail}
                  onChange={(e) => setConsumerEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase">密码</label>
                {!isRegisterMode && <a href="#" className="text-xs text-primary-500 font-medium">忘记密码?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-white border-none h-14 rounded-2xl pl-12 pr-12 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500 shadow-sm outline-none transition-all"
                  placeholder={isRegisterMode ? "设置密码（至少6位）" : "输入登录密码"}
                  value={consumerPassword}
                  onChange={(e) => setConsumerPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white border-none h-14 rounded-2xl pl-12 pr-6 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500 shadow-sm outline-none transition-all"
                    placeholder="再次输入密码"
                    value={consumerConfirmPassword}
                    onChange={(e) => setConsumerConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleConsumerLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-orange-600 text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isRegisterMode ? '注册中...' : '登录中...'}
                </>
              ) : (
                isRegisterMode ? '立即注册' : '登录'
              )}
            </button>
          </div>

          <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
            <div className="text-slate-400 text-xs">
              {isRegisterMode ? '已有账号?' : '还没有账号?'}
              <button onClick={toggleMode} className="text-primary-500 font-bold ml-1">
                {isRegisterMode ? '立即登录' : '立即注册'}
              </button>
            </div>
            <button onClick={() => { setActiveTab('MERCHANT'); setError(null); }} className="flex items-center gap-1 text-slate-400 hover:text-primary-500 transition-colors group">
              <span className="text-xs font-bold">商家登录</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Merchant Section */}
        <section className="w-1/2 h-full px-8 py-10 flex flex-col bg-white overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Store className="text-slate-500" size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              虚视界 · <span className="text-primary-500">商家中心</span>
            </h2>
          </div>

          <div className="mt-2">
            <h1 className="text-3xl font-bold leading-tight text-slate-900">
              {isRegisterMode ? '商家入驻' : '欢迎回来'}，<br />
              <span className="text-primary-500">{isRegisterMode ? '开启' : '掌控'}</span>您的卖场
            </h1>
            <p className="text-slate-500 mt-3 text-sm">
              {isRegisterMode ? '注册成为商家，开启虚拟直播带货之旅' : '登录商户后台，管理您的虚拟直播间与商品'}
            </p>
          </div>

          {!isRegisterMode && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
              <div className="bg-white text-primary-500 p-1.5 rounded-lg shadow-sm">
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary-600">新入驻商家专属权益</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  完成实名认证即享 0 元入驻及万元级流量精准扶持计划。
                </p>
              </div>
            </div>
          )}

          {error && activeTab === 'MERCHANT' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">管理员邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full bg-slate-50 border-none h-14 rounded-2xl pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="输入管理员邮箱"
                  value={merchantEmail}
                  onChange={(e) => setMerchantEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase">安全密码</label>
                {!isRegisterMode && <a href="#" className="text-xs text-primary-500 font-medium">重置密码</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border-none h-14 rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder={isRegisterMode ? "设置密码（至少6位）" : "输入后台管理密码"}
                  value={merchantPassword}
                  onChange={(e) => setMerchantPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-50 border-none h-14 rounded-2xl pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="再次输入密码"
                    value={merchantConfirmPassword}
                    onChange={(e) => setMerchantConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleMerchantLogin}
              disabled={isLoading}
              className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isRegisterMode ? '注册中...' : '登录中...'}
                </>
              ) : (
                isRegisterMode ? '申请入驻' : '商家登录'
              )}
            </button>
          </div>

          <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
            <button onClick={() => { setActiveTab('CONSUMER'); setError(null); }} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold">返回消费者</span>
            </button>
            <div className="text-slate-400 text-xs">
              {isRegisterMode ? '已有账号?' : '还没有商家账号?'}
              <button onClick={toggleMode} className="text-primary-500 font-bold ml-1">
                {isRegisterMode ? '立即登录' : '申请入驻'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LoginScreen;
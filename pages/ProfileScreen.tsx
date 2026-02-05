import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Camera, Heart, MessageCircle, Grid3X3, Bookmark, LogOut, Edit2, ChevronRight } from 'lucide-react';
import { AppScreen } from '../types';
import { useUser } from '../src/lib/userContext';
import { getPosts, Post } from '../src/services/postService';
import { signOut } from '../src/services/authService';

interface ProfileScreenProps {
    onNavigate: (screen: AppScreen) => void;
    onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onLogout }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'saved'>('posts');
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load user's posts
    useEffect(() => {
        const loadUserPosts = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            const posts = await getPosts({ userId: user.id });
            // Filter posts by current user
            const myPosts = posts.filter(p => p.user_id === user.id);
            setUserPosts(myPosts);
            setIsLoading(false);
        };
        loadUserPosts();
    }, [user?.id]);

    const handleLogout = async () => {
        await signOut();
        onLogout();
    };

    const stats = {
        posts: userPosts.length,
        following: 128,
        followers: 256
    };

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header */}
            <header className="bg-gradient-to-b from-primary-50 to-white">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => onNavigate(AppScreen.HOME)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">我的</h1>
                    <button className="w-8 h-8 flex items-center justify-center text-slate-600">
                        <Settings size={22} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-6 py-6 text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 p-0.5">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                <img
                                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Camera size={16} />
                        </button>
                    </div>

                    {/* Username */}
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                        {user?.username || '用户'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
                        ID: {user?.id?.slice(0, 8) || '未登录'}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 mb-6">
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{stats.posts}</p>
                            <p className="text-xs text-slate-400">动态</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{stats.following}</p>
                            <p className="text-xs text-slate-400">关注</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{stats.followers}</p>
                            <p className="text-xs text-slate-400">粉丝</p>
                        </div>
                    </div>

                    {/* Edit Profile Button */}
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                        <Edit2 size={16} />
                        编辑资料
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-3 text-center text-sm font-bold transition-colors relative ${activeTab === 'posts' ? 'text-primary-500' : 'text-slate-400'}`}
                >
                    <Grid3X3 size={20} className="mx-auto mb-1" />
                    动态
                    {activeTab === 'posts' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('likes')}
                    className={`flex-1 py-3 text-center text-sm font-bold transition-colors relative ${activeTab === 'likes' ? 'text-primary-500' : 'text-slate-400'}`}
                >
                    <Heart size={20} className="mx-auto mb-1" />
                    喜欢
                    {activeTab === 'likes' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 py-3 text-center text-sm font-bold transition-colors relative ${activeTab === 'saved' ? 'text-primary-500' : 'text-slate-400'}`}
                >
                    <Bookmark size={20} className="mx-auto mb-1" />
                    收藏
                    {activeTab === 'saved' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full" />}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'posts' && (
                    <>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : userPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Grid3X3 className="text-gray-400" size={28} />
                                </div>
                                <h3 className="text-slate-700 font-bold mb-2">暂无动态</h3>
                                <p className="text-slate-400 text-sm">快去发布你的第一条动态吧！</p>
                                <button
                                    onClick={() => onNavigate(AppScreen.COMMUNITY)}
                                    className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full text-sm font-bold hover:bg-primary-600 transition-colors"
                                >
                                    去发布
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1">
                                {userPosts.map((post) => (
                                    <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2">
                                                <p className="text-xs text-slate-600 line-clamp-3">{post.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'likes' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-gray-400" size={28} />
                        </div>
                        <h3 className="text-slate-700 font-bold mb-2">暂无喜欢</h3>
                        <p className="text-slate-400 text-sm">你喜欢的内容会显示在这里</p>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bookmark className="text-gray-400" size={28} />
                        </div>
                        <h3 className="text-slate-700 font-bold mb-2">暂无收藏</h3>
                        <p className="text-slate-400 text-sm">你收藏的内容会显示在这里</p>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="px-4 mt-4 space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="text-blue-500" size={20} />
                        </div>
                        <span className="font-medium text-slate-700">我的消息</span>
                    </div>
                    <ChevronRight className="text-slate-400" size={20} />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Settings className="text-orange-500" size={20} />
                        </div>
                        <span className="font-medium text-slate-700">设置</span>
                    </div>
                    <ChevronRight className="text-slate-400" size={20} />
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <LogOut className="text-red-500" size={20} />
                        </div>
                        <span className="font-medium text-red-600">退出登录</span>
                    </div>
                    <ChevronRight className="text-red-400" size={20} />
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;

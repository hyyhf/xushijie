import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Heart, MessageCircle, Share2, Plus, Loader2, X, Image, Send } from 'lucide-react';
import { AppScreen } from '../types';
import { getPosts, likePost, unlikePost, createPost, Post } from '../src/services/postService';
import { useUser } from '../src/lib/userContext';

interface CommunityScreenProps {
   onNavigate: (screen: AppScreen) => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ onNavigate }) => {
   const [activeTab, setActiveTab] = useState('recommend');
   const [posts, setPosts] = useState<Post[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useUser();

   // Create post modal state
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [newPostContent, setNewPostContent] = useState('');
   const [newPostImageUrl, setNewPostImageUrl] = useState('');
   const [newPostTags, setNewPostTags] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Load posts
   const loadPosts = async () => {
      setIsLoading(true);
      const data = await getPosts({
         tab: activeTab as 'recommend' | 'follow' | 'local',
         userId: user?.id
      });
      setPosts(data);
      setIsLoading(false);
   };

   useEffect(() => {
      loadPosts();
   }, [activeTab, user?.id]);

   // Handle like toggle
   const handleLike = async (post: Post) => {
      if (!user?.id) return;

      // Optimistic update
      setPosts(prev => prev.map(p => {
         if (p.id === post.id) {
            return {
               ...p,
               is_liked: !p.is_liked,
               likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
            };
         }
         return p;
      }));

      // API call
      if (post.is_liked) {
         await unlikePost(post.id, user.id);
      } else {
         await likePost(post.id, user.id);
      }
   };

   // Handle create post
   const handleCreatePost = async () => {
      if (!user?.id || !newPostContent.trim()) return;

      setIsSubmitting(true);

      // Parse tags from input
      const tags = newPostTags
         .split(/[,，\s]+/)
         .filter(tag => tag.trim())
         .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      const newPost = await createPost({
         userId: user.id,
         content: newPostContent.trim(),
         imageUrl: newPostImageUrl.trim() || undefined,
         tags: tags.length > 0 ? tags : undefined
      });

      if (newPost) {
         // Add new post to the beginning of the list
         setPosts(prev => [newPost, ...prev]);
         // Reset form and close modal
         setNewPostContent('');
         setNewPostImageUrl('');
         setNewPostTags('');
         setShowCreateModal(false);
      } else {
         // If database save failed, create a local mock post
         const mockPost: Post = {
            id: `local-${Date.now()}`,
            user_id: user.id,
            username: user.username || '我',
            avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            content: newPostContent.trim(),
            image_url: newPostImageUrl.trim() || null,
            tags: tags,
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            created_at: new Date().toISOString()
         };
         setPosts(prev => [mockPost, ...prev]);
         setNewPostContent('');
         setNewPostImageUrl('');
         setNewPostTags('');
         setShowCreateModal(false);
      }

      setIsSubmitting(false);
   };

   return (
      <div className="bg-white min-h-screen pb-24">
         {/* Create Post Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
               <div className="bg-white w-full max-w-md rounded-t-3xl animate-slide-up">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                     <button
                        onClick={() => setShowCreateModal(false)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700"
                     >
                        <X size={22} />
                     </button>
                     <h3 className="font-bold text-slate-800">发布动态</h3>
                     <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || isSubmitting}
                        className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                     >
                        {isSubmitting ? (
                           <Loader2 className="animate-spin" size={16} />
                        ) : (
                           <Send size={16} />
                        )}
                        发布
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 space-y-4">
                     {/* Content Input */}
                     <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="分享你的想法..."
                        className="w-full h-32 p-3 bg-gray-50 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-primary-500/20 border border-gray-100"
                        autoFocus
                     />

                     {/* Image URL Input */}
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-slate-400">
                           <Image size={20} />
                        </div>
                        <input
                           type="text"
                           value={newPostImageUrl}
                           onChange={(e) => setNewPostImageUrl(e.target.value)}
                           placeholder="图片链接（可选）"
                           className="flex-1 h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 border border-gray-100"
                        />
                     </div>

                     {/* Image Preview */}
                     {newPostImageUrl && (
                        <div className="relative">
                           <img
                              src={newPostImageUrl}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-xl bg-gray-100"
                              onError={(e) => {
                                 (e.target as HTMLImageElement).style.display = 'none';
                              }}
                           />
                           <button
                              onClick={() => setNewPostImageUrl('')}
                              className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                           >
                              <X size={14} />
                           </button>
                        </div>
                     )}

                     {/* Tags Input */}
                     <input
                        type="text"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        placeholder="标签（用空格或逗号分隔，如：好物推荐 OOTD）"
                        className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 border border-gray-100"
                     />

                     {/* Quick Tags */}
                     <div className="flex flex-wrap gap-2">
                        {['好物推荐', '日常分享', 'OOTD', '虚拟试穿', '美妆'].map(tag => (
                           <button
                              key={tag}
                              onClick={() => setNewPostTags(prev => prev ? `${prev} ${tag}` : tag)}
                              className="px-3 py-1 bg-orange-50 text-primary-500 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors"
                           >
                              #{tag}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Header */}
         <header className="bg-white sticky top-0 z-40 border-b border-gray-50">
            <div className="flex items-center justify-between px-4 py-3">
               <button
                  onClick={() => onNavigate(AppScreen.HOME)}
                  className="w-8 h-8 flex items-center justify-center -ml-2 text-slate-600 active:scale-95 transition-transform"
               >
                  <ArrowLeft size={22} />
               </button>

               <div className="flex gap-6 font-bold text-base">
                  <button
                     onClick={() => setActiveTab('follow')}
                     className={`relative pb-1 ${activeTab === 'follow' ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                     关注
                     {activeTab === 'follow' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-500 rounded-full"></span>}
                  </button>
                  <button
                     onClick={() => setActiveTab('recommend')}
                     className={`relative pb-1 ${activeTab === 'recommend' ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                     推荐
                     {activeTab === 'recommend' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-500 rounded-full"></span>}
                  </button>
                  <button
                     onClick={() => setActiveTab('local')}
                     className={`relative pb-1 ${activeTab === 'local' ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                     同城
                     {activeTab === 'local' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-500 rounded-full"></span>}
                  </button>
               </div>

               {/* Right side buttons: Plus and Search */}
               <div className="flex items-center gap-1">
                  <button
                     onClick={() => setShowCreateModal(true)}
                     className="w-8 h-8 flex items-center justify-center text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                  >
                     <Plus size={22} strokeWidth={2.5} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-600">
                     <Search size={22} />
                  </button>
               </div>
            </div>
         </header>

         {/* Feed */}
         <main className="bg-gray-50 min-h-screen">
            {isLoading ? (
               <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-primary-500" size={32} />
               </div>
            ) : posts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Search className="text-gray-400" size={28} />
                  </div>
                  <h3 className="text-slate-700 font-bold mb-2">暂无动态</h3>
                  <p className="text-slate-400 text-sm mb-4">快来发布第一条动态吧！</p>
                  <button
                     onClick={() => setShowCreateModal(true)}
                     className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-bold text-sm hover:bg-primary-600 transition-colors"
                  >
                     发布动态
                  </button>
               </div>
            ) : (
               <div className="masonry-grid p-2 space-y-3">
                  {posts.map((post) => (
                     <div key={post.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                        {/* User Header */}
                        <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-2">
                              <img src={post.avatar_url} className="w-8 h-8 rounded-full border border-gray-100" alt="Avatar" />
                              <span className="text-xs font-bold text-slate-800">{post.username}</span>
                           </div>
                           {post.user_id !== user?.id && (
                              <button className="text-[10px] font-bold text-primary-500 border border-primary-500 px-2 py-0.5 rounded-full hover:bg-primary-50">
                                 关注
                              </button>
                           )}
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                           {post.image_url && (
                              <img src={post.image_url} className="w-full h-64 object-cover rounded-xl mb-3 bg-gray-100" alt="Post" />
                           )}
                           <p className="text-sm text-slate-800 leading-relaxed font-medium">
                              {post.content}
                           </p>
                           {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                 {post.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                                       {tag}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-slate-400">
                           <button className="flex items-center gap-1 hover:text-slate-600">
                              <Share2 size={18} />
                           </button>
                           <div className="flex gap-4">
                              <button className="flex items-center gap-1 hover:text-slate-600">
                                 <MessageCircle size={18} />
                                 <span className="text-xs font-medium">{post.comments_count}</span>
                              </button>
                              <button
                                 onClick={() => handleLike(post)}
                                 className={`flex items-center gap-1 group ${post.is_liked ? 'text-red-500' : 'hover:text-red-500'}`}
                              >
                                 <Heart size={18} className={post.is_liked ? 'fill-current' : 'group-hover:fill-current'} />
                                 <span className="text-xs font-medium">{post.likes_count}</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>

         {/* Add slide-up animation style */}
         <style>{`
            @keyframes slide-up {
               from {
                  transform: translateY(100%);
               }
               to {
                  transform: translateY(0);
               }
            }
            .animate-slide-up {
               animation: slide-up 0.3s ease-out;
            }
         `}</style>
      </div>
   );
};

export default CommunityScreen;
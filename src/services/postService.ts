import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Post {
    id: string;
    user_id: string;
    username: string;
    avatar_url: string;
    content: string;
    image_url: string | null;
    tags: string[];
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    created_at: string;
}

export interface Comment {
    id: string;
    user_id: string;
    username: string;
    avatar_url: string;
    content: string;
    created_at: string;
}

// Get posts with pagination
export async function getPosts(options?: {
    tab?: 'recommend' | 'follow' | 'local';
    limit?: number;
    offset?: number;
    userId?: string; // current user ID for checking likes
}): Promise<Post[]> {
    if (!isSupabaseConfigured || !supabase) {
        console.log('[PostService] Supabase not configured, returning mock data');
        return getMockPosts();
    }

    try {
        console.log('[PostService] Fetching posts from Supabase...');

        // Add timeout to the request (10 seconds)
        const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => {
                console.warn('[PostService] Request timed out after 10000ms');
                resolve({ data: null, error: { message: 'Request timed out' } });
            }, 10000)
        );

        const fetchPromise = supabase
            .from('posts')
            .select(`
        *,
        profiles!posts_user_id_fkey(username, avatar_url),
        post_likes(count),
        post_comments(count)
      `)
            .order('created_at', { ascending: false })
            .limit(options?.limit || 20);

        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        const { data, error } = result;

        if (error) {
            console.error('[PostService] Error fetching posts:', error.message);
            return getMockPosts(); // Return mock data on error
        }

        if (!data || data.length === 0) {
            console.log('[PostService] No posts found in database');
            return getMockPosts(); // Return mock data when no posts
        }

        console.log(`[PostService] Found ${data.length} posts`);

        // Check if current user has liked each post
        let userLikes: Set<string> = new Set();
        if (options?.userId) {
            try {
                const { data: likes } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', options.userId);

                if (likes) {
                    userLikes = new Set(likes.map((l: any) => l.post_id));
                }
            } catch {
                // Ignore likes error
            }
        }

        return data.map((post: any) => ({
            id: post.id,
            user_id: post.user_id,
            username: post.profiles?.username || 'User',
            avatar_url: post.profiles?.avatar_url || `https://picsum.photos/50/50?random=${post.id}`,
            content: post.content,
            image_url: post.image_url,
            tags: post.tags || [],
            likes_count: post.post_likes?.[0]?.count || 0,
            comments_count: post.post_comments?.[0]?.count || 0,
            is_liked: userLikes.has(post.id),
            created_at: post.created_at
        }));
    } catch (err) {
        console.error('[PostService] Unexpected error:', err);
        return getMockPosts(); // Return mock data on any error
    }
}

// Create a new post
export async function createPost(data: {
    userId: string;
    content: string;
    imageUrl?: string;
    tags?: string[];
}): Promise<Post | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data: post, error } = await supabase
            .from('posts')
            .insert({
                user_id: data.userId,
                content: data.content,
                image_url: data.imageUrl || null,
                tags: data.tags || []
            })
            .select(`*, profiles!posts_user_id_fkey(username, avatar_url)`)
            .single();

        if (error || !post) return null;

        return {
            id: post.id,
            user_id: post.user_id,
            username: post.profiles?.username || 'User',
            avatar_url: post.profiles?.avatar_url || '',
            content: post.content,
            image_url: post.image_url,
            tags: post.tags || [],
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            created_at: post.created_at
        };
    } catch {
        return null;
    }
}

// Like a post
export async function likePost(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return true; // Mock success
    }

    try {
        const { error } = await supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: userId });

        return !error;
    } catch {
        return false;
    }
}

// Unlike a post
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return true; // Mock success
    }

    try {
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        return !error;
    } catch {
        return false;
    }
}

// Get comments for a post
export async function getComments(postId: string): Promise<Comment[]> {
    if (!isSupabaseConfigured || !supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('post_comments')
            .select(`*, profiles!post_comments_user_id_fkey(username, avatar_url)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error || !data) return [];

        return data.map((c: any) => ({
            id: c.id,
            user_id: c.user_id,
            username: c.profiles?.username || 'User',
            avatar_url: c.profiles?.avatar_url || '',
            content: c.content,
            created_at: c.created_at
        }));
    } catch {
        return [];
    }
}

// Add a comment
export async function addComment(postId: string, userId: string, content: string): Promise<Comment | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('post_comments')
            .insert({ post_id: postId, user_id: userId, content })
            .select(`*, profiles!post_comments_user_id_fkey(username, avatar_url)`)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            user_id: data.user_id,
            username: data.profiles?.username || 'User',
            avatar_url: data.profiles?.avatar_url || '',
            content: data.content,
            created_at: data.created_at
        };
    } catch {
        return null;
    }
}

// Mock data
function getMockPosts(): Post[] {
    return Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-post-${i}`,
        user_id: `mock-user-${i}`,
        username: `User_${i + 100}`,
        avatar_url: `https://picsum.photos/50/50?random=${i + 200}`,
        content: i % 2 === 0
            ? '今天的虚拟试穿效果太惊艳了！完全看不出是AI生成的，衣服质感无敌👍'
            : '新入手的这款口红，在虚拟直播间看着不错，实物更美！集美们冲鸭！',
        image_url: `https://picsum.photos/400/500?random=${i + 300}`,
        tags: ['#虚拟试穿', '#好物推荐', '#OOTD'],
        likes_count: 100 + i * 15,
        comments_count: 20 + i,
        is_liked: false,
        created_at: new Date().toISOString()
    }));
}

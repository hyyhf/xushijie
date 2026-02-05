-- Supabase Schema for 虚视界 (Virtual Horizon)
-- Run this in Supabase SQL Editor

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'CONSUMER' CHECK (role IN ('CONSUMER', 'MERCHANT')),
  username TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  sales INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  tag TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6. Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Avatar configs table
CREATE TABLE IF NOT EXISTS avatar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  seed TEXT DEFAULT 'Natsumi',
  hair TEXT DEFAULT 'hair-0',
  face TEXT DEFAULT 'face-0',
  clothes TEXT DEFAULT 'cloth-0',
  makeup TEXT DEFAULT 'makeup-0',
  color TEXT DEFAULT 'c2',
  voice_pitch INT DEFAULT 50,
  motion TEXT DEFAULT 'm1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Merchant profiles table
CREATE TABLE IF NOT EXISTS merchant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  shop_name TEXT,
  credit_score DECIMAL(4,1) DEFAULT 98.5,
  deposit DECIMAL(10,2) DEFAULT 20000.00,
  verified BOOLEAN DEFAULT false,
  verified_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('logistics', 'damage', 'quality', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'closed')),
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products: public read
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Posts: public read, authenticated create/update/delete own
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Post likes: public read, authenticated create/delete own
CREATE POLICY "Likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post comments: public read, authenticated create/delete own
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Avatar configs: users can read/write own
CREATE POLICY "Users can view own avatar config" ON avatar_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatar config" ON avatar_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar config" ON avatar_configs FOR UPDATE USING (auth.uid() = user_id);

-- Merchant profiles: owner can read/write, public can view verified
CREATE POLICY "Public can view verified merchants" ON merchant_profiles FOR SELECT USING (verified = true OR auth.uid() = user_id);
CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Merchants can insert own profile" ON merchant_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support tickets: users can read/write own
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'CONSUMER'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO categories (name, display_order) VALUES
  ('全部', 0),
  ('美妆个护', 1),
  ('时尚穿搭', 2),
  ('数码3C', 3),
  ('家居生活', 4),
  ('美食饮品', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (title, price, category_id, image_url, sales, rating, tag) VALUES
  ('主播同款高级感西装外套', 299.00, (SELECT id FROM categories WHERE name = '时尚穿搭'), 'https://picsum.photos/300/300?random=101', 520, 4.8, '直播特价'),
  ('夏季清爽控油定妆散粉', 89.00, (SELECT id FROM categories WHERE name = '美妆个护'), 'https://picsum.photos/300/300?random=102', 1230, 4.9, '新品'),
  ('无线蓝牙降噪耳机', 399.00, (SELECT id FROM categories WHERE name = '数码3C'), 'https://picsum.photos/300/300?random=103', 890, 4.7, ''),
  ('ins风北欧简约落地灯', 259.00, (SELECT id FROM categories WHERE name = '家居生活'), 'https://picsum.photos/300/300?random=104', 340, 4.6, '直播特价'),
  ('网红零食大礼包', 69.00, (SELECT id FROM categories WHERE name = '美食饮品'), 'https://picsum.photos/300/300?random=105', 2100, 4.8, '新品'),
  ('高端精华液护肤套装', 599.00, (SELECT id FROM categories WHERE name = '美妆个护'), 'https://picsum.photos/300/300?random=106', 670, 4.9, '直播特价'),
  ('潮流运动休闲卫衣', 189.00, (SELECT id FROM categories WHERE name = '时尚穿搭'), 'https://picsum.photos/300/300?random=107', 450, 4.5, ''),
  ('智能手表运动健康监测', 899.00, (SELECT id FROM categories WHERE name = '数码3C'), 'https://picsum.photos/300/300?random=108', 380, 4.8, '新品'),
  ('日式手工陶瓷餐具套装', 159.00, (SELECT id FROM categories WHERE name = '家居生活'), 'https://picsum.photos/300/300?random=109', 210, 4.7, ''),
  ('有机坚果混合装', 49.00, (SELECT id FROM categories WHERE name = '美食饮品'), 'https://picsum.photos/300/300?random=110', 1560, 4.6, '直播特价')
ON CONFLICT DO NOTHING;

-- Create a system user for sample posts (if not exists)
-- This creates a placeholder profile that can be used for sample content
DO $$
DECLARE
  system_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users if the table exists and user doesn't exist
  -- Note: In production, you should create real users through Supabase Auth
  
  -- Insert system profile
  INSERT INTO profiles (id, role, username, avatar_url)
  VALUES (system_user_id, 'CONSUMER', '虚视界官方', 'https://picsum.photos/50/50?random=avatar1')
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert sample posts
  INSERT INTO posts (user_id, content, image_url, tags) VALUES
    (system_user_id, '今天的虚拟试穿效果太惊艳了！完全看不出是AI生成的，衣服质感无敌👍 这个功能真的太棒了，再也不用担心网购踩雷！', 'https://picsum.photos/400/500?random=301', ARRAY['#虚拟试穿', '#好物推荐', '#OOTD']),
    (system_user_id, '新入手的这款口红，在虚拟直播间看着不错，实物更美！集美们冲鸭！颜色饱和度很高，持久度也不错，强烈推荐！', 'https://picsum.photos/400/500?random=302', ARRAY['#美妆', '#口红推荐', '#种草']),
    (system_user_id, '虚拟主播的穿搭分享来啦～这套西装外套真的超有气场，职场小白必备！质量超越预期，好评！', 'https://picsum.photos/400/500?random=303', ARRAY['#职场穿搭', '#西装', '#显瘦']),
    (system_user_id, '周末居家必备好物分享！这款北欧风落地灯氛围感拉满，拍照超出片，客厅瞬间高级起来！', 'https://picsum.photos/400/500?random=304', ARRAY['#家居', '#好物分享', '#氛围感']),
    (system_user_id, '终于收到心心念念的蓝牙耳机了！降噪效果一流，通勤神器，音质也很棒，性价比之王！', 'https://picsum.photos/400/500?random=305', ARRAY['#数码', '#耳机测评', '#好物'])
  ON CONFLICT DO NOTHING;
  
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors (e.g., if foreign key constraint fails due to missing auth.users entry)
  RAISE NOTICE 'Sample data insertion skipped: %', SQLERRM;
END $$;


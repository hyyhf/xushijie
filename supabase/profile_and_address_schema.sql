-- Add missing fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  detail TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_addresses (Drop first to avoid errors)
DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (Drop first to avoid errors)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

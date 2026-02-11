-- Live Shopping & Coupon System Schema
-- Run this in Supabase SQL Editor

-- 1. Coupon templates (主播设置的优惠券模板)
CREATE TABLE IF NOT EXISTS coupon_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed', 'percent')),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 100,
  claimed_count INT NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  live_room_id TEXT,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User coupons (用户已领取的优惠券)
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_template_id UUID REFERENCES coupon_templates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE(user_id, coupon_template_id)
);

-- 3. Live products (直播间关联商品)
CREATE TABLE IF NOT EXISTS live_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_room_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  live_price DECIMAL(10,2),
  sort_order INT DEFAULT 0,
  is_current BOOLEAN DEFAULT false,
  stock_limit INT DEFAULT 999,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend orders table with coupon fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES user_coupons(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupon_templates_live ON coupon_templates(live_room_id);
CREATE INDEX IF NOT EXISTS idx_coupon_templates_active ON coupon_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON user_coupons(status);
CREATE INDEX IF NOT EXISTS idx_live_products_room ON live_products(live_room_id);

-- Enable RLS
ALTER TABLE coupon_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Coupon templates: public read
CREATE POLICY "Coupon templates viewable by everyone" ON coupon_templates FOR SELECT USING (true);
CREATE POLICY "Creators can manage coupon templates" ON coupon_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update coupon templates" ON coupon_templates FOR UPDATE USING (auth.uid() = created_by);

-- User coupons: users can read/claim own
CREATE POLICY "Users can view own coupons" ON user_coupons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim coupons" ON user_coupons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coupons" ON user_coupons FOR UPDATE USING (auth.uid() = user_id);

-- Live products: public read
CREATE POLICY "Live products viewable by everyone" ON live_products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage live products" ON live_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert sample coupon templates for the default live room
INSERT INTO coupon_templates (title, type, discount_amount, min_spend, total_count, claimed_count, live_room_id, is_active) VALUES
  ('新人专享券', 'fixed', 10, 50, 200, 45, 'default', true),
  ('直播间满减券', 'fixed', 30, 200, 100, 23, 'default', true),
  ('限时折扣券', 'fixed', 50, 300, 50, 12, 'default', true),
  ('超级大额券', 'fixed', 100, 500, 20, 5, 'default', true)
ON CONFLICT DO NOTHING;

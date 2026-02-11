-- Insert mock live products into real Supabase tables
-- This ensures that products bought from live stream have valid UUIDs and exist in the products table
-- enabling proper order creation and foreign key constraints.

DO $$
DECLARE
  cat_beauty UUID;
  cat_fashion UUID;
  cat_digital UUID;
  cat_food UUID;
  cat_home UUID;
  p_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_beauty FROM categories WHERE name = '美妆个护' LIMIT 1;
  SELECT id INTO cat_fashion FROM categories WHERE name = '时尚穿搭' LIMIT 1;
  SELECT id INTO cat_digital FROM categories WHERE name = '数码3C' LIMIT 1;
  SELECT id INTO cat_food FROM categories WHERE name = '美食饮品' LIMIT 1;
  SELECT id INTO cat_home FROM categories WHERE name = '家居生活' LIMIT 1;

  -- 1. MAC 哑光唇膏 (Beauty)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('MAC 哑光唇膏 #316 热门色号', 230, cat_beauty, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop', 2380, 4.9, '直播特价', 230, 999, 'MAC 热门色号，显白不拔干')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 189, 0, true, 50, 23);

  -- 2. 兰蔻小黑瓶 (Beauty)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('兰蔻小黑瓶面部精华 100ml', 849, cat_beauty, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop', 1890, 4.8, '爆款', 849, 999, '强韧肌底，修护精华')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 699, 1, false, 30, 12);

  -- 3. 修身西装外套 (Fashion)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('修身西装外套 黑色百搭款', 399, cat_fashion, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop', 1560, 4.7, '新品', 399, 999, '职场必备，干练显瘦')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 299, 2, false, 100, 45);

  -- 4. Sony WH-1000XM5 (Digital)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('Sony WH-1000XM5 降噪耳机', 2699, cat_digital, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop', 980, 4.9, '新品', 2699, 50, '行业领先降噪，超长续航')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 2199, 3, false, 20, 8);

  -- 5. 夏季清爽控油定妆散粉 (Beauty)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('夏季清爽控油定妆散粉', 89, cat_beauty, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', 3200, 4.6, '直播特价', 89, 999, '轻薄控油，持久定妆')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 59, 4, false, 200, 156);

  -- 6. 进口混合坚果大礼包 (Food)
  INSERT INTO products (title, price, category_id, image_url, sales, rating, tag, original_price, stock, description)
  VALUES ('进口混合坚果大礼包 1000g', 68, cat_food, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop', 5600, 4.5, '热销', 68, 999, '营养健康，每日一把')
  RETURNING id INTO p_id;

  INSERT INTO live_products (live_room_id, product_id, live_price, sort_order, is_current, stock_limit, sold_count)
  VALUES ('default', p_id, 39, 5, false, 500, 312);

END $$;

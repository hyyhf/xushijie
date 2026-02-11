-- Add snapshot fields to order_items to support mock products and historical data accuracy
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records if possible (optional, might not work for mock items but good for real ones)
UPDATE order_items 
SET 
  title = products.title,
  price = products.price,
  image_url = products.image_url
FROM products
WHERE order_items.product_id = products.id AND order_items.title IS NULL;

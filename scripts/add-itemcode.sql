-- Add item code field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS itemcode TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_itemcode ON products(itemcode);

-- Add comment for documentation
COMMENT ON COLUMN products.itemcode IS 'Unique item code/SKU for the product';

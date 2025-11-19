/*
  # Add Botika RBT Menu Items
  
  This migration adds all pharmacy menu items for Botika RBT.
  Items are added in alphabetical order.
  All items use the built-in "all" category (categories are not used for display).
*/

-- Ensure required base tables exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create categories table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💊',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table if not exists
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text NOT NULL,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create variations table if not exists
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create add_ons table if not exists
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create site_settings table if not exists
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated admin access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function for updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for site_settings if not exists
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings if they don't exist
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'Botika RBT', 'text', 'The name of the pharmacy'),
  ('site_logo', '/logo.png', 'image', 'The logo image URL for the site'),
  ('site_description', 'Bulong Para sa Kaayusan Mo', 'text', 'Short description of the pharmacy'),
  ('currency', '₱', 'text', 'Currency symbol for prices'),
  ('currency_code', 'PHP', 'text', 'Currency code for payments'),
  ('delivery_enabled', 'true', 'boolean', 'Enable or disable delivery service option for customers')
ON CONFLICT (id) DO NOTHING;

-- Create helper function for menu items
CREATE OR REPLACE FUNCTION get_or_create_menu_item(
  item_name text,
  item_description text,
  item_price decimal,
  item_category text,
  item_popular boolean DEFAULT false
) RETURNS uuid AS $$
DECLARE
  item_id uuid;
BEGIN
  SELECT id INTO item_id FROM menu_items WHERE name = item_name AND category = item_category LIMIT 1;
  IF item_id IS NULL THEN
    INSERT INTO menu_items (name, description, base_price, category, popular, available)
    VALUES (item_name, item_description, item_price, item_category, false, true)
    RETURNING id INTO item_id;
  ELSE
    UPDATE menu_items 
    SET description = item_description, base_price = item_price, popular = false
    WHERE id = item_id;
  END IF;
  RETURN item_id;
END;
$$ LANGUAGE plpgsql;

-- Clean up duplicate menu items before inserting
-- This removes duplicates based on (name, category), keeping the one with the earliest created_at
-- Variations and add-ons are automatically deleted via CASCADE
DELETE FROM menu_items
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY created_at ASC) as rn
    FROM menu_items
    WHERE category = 'all'
  ) t
  WHERE t.rn > 1  -- Keep only the first (oldest) duplicate
);

-- Insert menu items in alphabetical order
DO $$
DECLARE
  item_id uuid;
BEGIN
  -- 1. Antacids & Proton Pump Inhibitors (All Preparations)
  item_id := get_or_create_menu_item(
    'Antacids & Proton Pump Inhibitors (All Preparations)',
    'Medications for acid reflux and stomach ulcers',
    0.00,
    'all',
    false
  );

  -- 2. Anti-allergy - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Anti-allergy - Syrup & Suspension',
    'Liquid allergy medications in syrup and suspension form',
    0.00,
    'all',
    false
  );

  -- 3. Anti-allergy - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Anti-allergy - Tablet & Capsule',
    'Allergy medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 4. Anti-allergy / Steroids - Creams & Ointments
  item_id := get_or_create_menu_item(
    'Anti-allergy / Steroids - Creams & Ointments',
    'Topical allergy and steroid preparations',
    0.00,
    'all',
    false
  );

  -- 5. Anti-Angina (Chest Pain)
  item_id := get_or_create_menu_item(
    'Anti-Angina (Chest Pain)',
    'Medications for chest pain and angina',
    0.00,
    'all',
    false
  );

  -- 6. Anti-asthma - Nebules & Respules
  item_id := get_or_create_menu_item(
    'Anti-asthma - Nebules & Respules',
    'Asthma medications in nebulizer form',
    0.00,
    'all',
    false
  );

  -- 7. Anti-asthma - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Anti-asthma - Syrup & Suspension',
    'Liquid asthma medications',
    0.00,
    'all',
    false
  );

  -- 8. Anti-asthma - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Anti-asthma - Tablet & Capsule',
    'Asthma medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 9. Antibacterial - Creams & Ointments
  item_id := get_or_create_menu_item(
    'Antibacterial - Creams & Ointments',
    'Topical antibacterial preparations',
    0.00,
    'all',
    false
  );

  -- 10. Antibiotics - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Antibiotics - Syrup & Suspension',
    'Liquid antibiotic medications',
    0.00,
    'all',
    false
  );

  -- 11. Antibiotics - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Antibiotics - Tablet & Capsule',
    'Antibiotic medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 12. Antichinergics & Antispasmodics
  item_id := get_or_create_menu_item(
    'Antichinergics & Antispasmodics',
    'Medications for muscle spasms and cholinergic conditions',
    0.00,
    'all',
    false
  );

  -- 13. Anticholesterol / Antihyperlipidemic
  item_id := get_or_create_menu_item(
    'Anticholesterol / Antihyperlipidemic',
    'Medications to lower cholesterol and lipid levels',
    0.00,
    'all',
    false
  );

  -- 14. Anti-constipation / Stool Softening Preparations
  item_id := get_or_create_menu_item(
    'Anti-constipation / Stool Softening Preparations',
    'Medications for constipation relief',
    0.00,
    'all',
    false
  );

  -- 15. Anti-dehydration Preparations
  item_id := get_or_create_menu_item(
    'Anti-dehydration Preparations',
    'Oral rehydration solutions and electrolytes',
    0.00,
    'all',
    false
  );

  -- 16. Antidiabetic
  item_id := get_or_create_menu_item(
    'Antidiabetic',
    'Medications for diabetes management',
    0.00,
    'all',
    false
  );

  -- 17. Anti-diarrhea
  item_id := get_or_create_menu_item(
    'Anti-diarrhea',
    'Medications for diarrhea treatment',
    0.00,
    'all',
    false
  );

  -- 18. Antifibrinolytic (Bleeding)
  item_id := get_or_create_menu_item(
    'Antifibrinolytic (Bleeding)',
    'Medications to control bleeding',
    0.00,
    'all',
    false
  );

  -- 19. Antifungal - Creams & Ointments
  item_id := get_or_create_menu_item(
    'Antifungal - Creams & Ointments',
    'Topical antifungal preparations',
    0.00,
    'all',
    false
  );

  -- 20. Antihypertensive
  item_id := get_or_create_menu_item(
    'Antihypertensive',
    'Medications for high blood pressure',
    0.00,
    'all',
    false
  );

  -- 21. Antipyretic - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Antipyretic - Syrup & Suspension',
    'Liquid fever-reducing medications',
    0.00,
    'all',
    false
  );

  -- 22. Antipyretic - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Antipyretic - Tablet & Capsule',
    'Fever-reducing medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 23. Antiseptics & Disinfectants
  item_id := get_or_create_menu_item(
    'Antiseptics & Disinfectants',
    'Cleaning and disinfecting solutions',
    0.00,
    'all',
    false
  );

  -- 24. Antithrombotics (Blood Thinner)
  item_id := get_or_create_menu_item(
    'Antithrombotics (Blood Thinner)',
    'Medications to prevent blood clots',
    0.00,
    'all',
    false
  );

  -- 25. Antivertigo - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Antivertigo - Syrup & Suspension',
    'Liquid medications for vertigo and dizziness',
    0.00,
    'all',
    false
  );

  -- 26. Antivertigo - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Antivertigo - Tablet & Capsule',
    'Vertigo medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 27. Child Care Necessities
  item_id := get_or_create_menu_item(
    'Child Care Necessities',
    'Essential products for child care',
    0.00,
    'all',
    false
  );

  -- 28. Cosmetics (All Preparations)
  item_id := get_or_create_menu_item(
    'Cosmetics (All Preparations)',
    'Cosmetic and beauty products',
    0.00,
    'all',
    false
  );

  -- 29. Cough & Cold (Mucolytics) - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Cough & Cold (Mucolytics) - Syrup & Suspension',
    'Liquid cough and cold medications',
    0.00,
    'all',
    false
  );

  -- 30. Cough & Cold (Mucolytics) - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Cough & Cold (Mucolytics) - Tablet & Capsule',
    'Cough and cold medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 31. Dry Cells & Batteries
  item_id := get_or_create_menu_item(
    'Dry Cells & Batteries',
    'Batteries and power cells',
    0.00,
    'all',
    false
  );

  -- 32. Feminine Hygiene Preparations
  item_id := get_or_create_menu_item(
    'Feminine Hygiene Preparations',
    'Products for feminine hygiene',
    0.00,
    'all',
    false
  );

  -- 33. Food & Herbal Supplements - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Food & Herbal Supplements - Tablet & Capsule',
    'Herbal and food supplements',
    0.00,
    'all',
    false
  );

  -- 34. Galenicals (Liniments, Rubs etc.)
  item_id := get_or_create_menu_item(
    'Galenicals (Liniments, Rubs etc.)',
    'Topical preparations like liniments and rubs',
    0.00,
    'all',
    false
  );

  -- 35. Herbal Coffee Mix
  item_id := get_or_create_menu_item(
    'Herbal Coffee Mix',
    'Herbal coffee preparations',
    0.00,
    'all',
    false
  );

  -- 36. Hepa & Renal Drug Preparations
  item_id := get_or_create_menu_item(
    'Hepa & Renal Drug Preparations',
    'Medications for liver and kidney conditions',
    0.00,
    'all',
    false
  );

  -- 37. Medical Supplies & Devices (Including Patches)
  item_id := get_or_create_menu_item(
    'Medical Supplies & Devices (Including Patches)',
    'Medical devices and supplies including patches',
    0.00,
    'all',
    false
  );

  -- 38. Milk Products
  item_id := get_or_create_menu_item(
    'Milk Products',
    'Milk and dairy products',
    0.00,
    'all',
    false
  );

  -- 39. Ophthalmic (Eye) Preparations
  item_id := get_or_create_menu_item(
    'Ophthalmic (Eye) Preparations',
    'Eye medications and preparations',
    0.00,
    'all',
    false
  );

  -- 40. Oral Contraceptives - Tablets
  item_id := get_or_create_menu_item(
    'Oral Contraceptives - Tablets',
    'Birth control tablets',
    0.00,
    'all',
    false
  );

  -- 41. Otic (Ear) Preparations
  item_id := get_or_create_menu_item(
    'Otic (Ear) Preparations',
    'Ear medications and preparations',
    0.00,
    'all',
    false
  );

  -- 42. Pain Reliever - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Pain Reliever - Syrup & Suspension',
    'Liquid pain relief medications',
    0.00,
    'all',
    false
  );

  -- 43. Pain Reliever - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Pain Reliever - Tablet & Capsule',
    'Pain relief medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 44. Pregnancy & Lactation Preparations - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Pregnancy & Lactation Preparations - Tablet & Capsule',
    'Medications and supplements for pregnancy and breastfeeding',
    0.00,
    'all',
    false
  );

  -- 45. Steroids - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Steroids - Syrup & Suspension',
    'Liquid steroid medications',
    0.00,
    'all',
    false
  );

  -- 46. Steroids - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Steroids - Tablet & Capsule',
    'Steroid medications in tablet and capsule form',
    0.00,
    'all',
    false
  );

  -- 47. Vitamins - Syrup & Suspension
  item_id := get_or_create_menu_item(
    'Vitamins - Syrup & Suspension',
    'Liquid vitamin supplements',
    0.00,
    'all',
    false
  );

  -- 48. Vitamins - Tablet & Capsule
  item_id := get_or_create_menu_item(
    'Vitamins - Tablet & Capsule',
    'Vitamin supplements in tablet and capsule form',
    0.00,
    'all',
    false
  );

END $$;

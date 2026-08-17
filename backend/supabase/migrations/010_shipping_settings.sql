CREATE TABLE IF NOT EXISTS shipping_settings (
  id TEXT PRIMARY KEY DEFAULT 'default-shipping-settings',
  free_shipping_threshold INTEGER NOT NULL DEFAULT 5000,
  standard_shipping_fee INTEGER NOT NULL DEFAULT 299,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping settings are publicly readable" ON shipping_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update shipping settings" ON shipping_settings
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can insert shipping settings" ON shipping_settings
  FOR INSERT WITH CHECK (true);

INSERT INTO shipping_settings (free_shipping_threshold, standard_shipping_fee, currency, is_active)
SELECT 5000, 299, 'INR', true
WHERE NOT EXISTS (
  SELECT 1 FROM shipping_settings WHERE is_active = true
);

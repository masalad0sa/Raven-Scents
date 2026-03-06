-- ═══════════════════════════════════════════════════════════
-- LuxeScent Seed Data — All 15 Products + Variants + Coupons
-- Run AFTER 001_schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Coupons
INSERT INTO coupons (code, discount_pct, max_uses, is_active) VALUES
('LUXE10', 10, 1000, true),
('WELCOME15', 15, 500, true),
('SCENT20', 20, 200, true)
ON CONFLICT (code) DO NOTHING;

-- Products
INSERT INTO products (name, slug, short_desc, description, price, compare_price, images, category, gender, scent_family, concentration, sillage, longevity, tags, notes_top, notes_middle, notes_base, rating, review_count, is_featured, is_bestseller, is_new) VALUES

('Noir Sauvage', 'luxescent-noir-sauvage',
 'An ambroxan surge — raw wilderness bottled in bergamot and cedar.',
 'Noir Sauvage opens with electrifying Calabrian bergamot before settling into a rich ambroxan heart anchored by violet wood and cedar.',
 9500, 11000,
 ARRAY['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80','https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80'],
 'eau-de-parfum','masculine','Woody Aromatic','EDP','heavy','8–12 hours',
 ARRAY['fresh','woody','aromatic','bergamot'],
 ARRAY['Bergamot','Pepper','Lavender'],
 ARRAY['Sichuan Pepper','Elemi','Geranium'],
 ARRAY['Ambroxan','Cedar','Labdanum'],
 4.8, 2847, true, true, false),

('Blanc Absolu', 'luxescent-blanc-absolu',
 'The first abstract floral — powdery, timeless, pure.',
 'Blanc Absolu is our flagship floral. Aldehydes lift a bouquet of rose and jasmine over vetiver and sandalwood.',
 14500, NULL,
 ARRAY['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80','https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80'],
 'parfum','feminine','Floral Aldehydic','Parfum','heavy','10–14 hours',
 ARRAY['floral','powdery','classic','aldehydic'],
 ARRAY['Aldehydes','Bergamot','Neroli'],
 ARRAY['Rose','Jasmine','Iris'],
 ARRAY['Vetiver','Sandalwood','Civet','Vanilla'],
 4.9, 5612, true, true, false),

('Dark Opium', 'luxescent-dark-opium',
 'Coffee-kissed vanilla and floral darkness — addictively sensual.',
 'Dark Opium is our boldest gourmand — an intoxicating oriental floral with coffee and vanilla soul.',
 8200, 9500,
 ARRAY['https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80','https://images.unsplash.com/photo-1624454002501-5ed70fd7f9aa?w=800&q=80'],
 'eau-de-parfum','feminine','Oriental Gourmand','EDP','heavy','8–10 hours',
 ARRAY['coffee','vanilla','floral','gourmand','sweet'],
 ARRAY['Pink Pepper','Orange Blossom','Pear'],
 ARRAY['Coffee','Jasmine','Bitter Almond'],
 ARRAY['Vanilla','Patchouli','White Musk','Cedarwood'],
 4.7, 3241, true, true, false),

('Bleu Profond', 'luxescent-bleu-profond',
 'Cedar, sandalwood, white musk — structured, expressive masculinity.',
 'Free, sensual and expressive. Bleu Profond is our aromatic-woody signature for the modern man.',
 12000, NULL,
 ARRAY['https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?w=800&q=80','https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80'],
 'eau-de-parfum','masculine','Aromatic Woody','EDP','moderate','7–10 hours',
 ARRAY['cedar','woody','fresh','aromatic'],
 ARRAY['Citrus','Mint','Pink Pepper'],
 ARRAY['Ginger','Nutmeg','Jasmine'],
 ARRAY['Incense','Cedar','Sandalwood','Vetiver'],
 4.8, 4105, false, true, false),

('Joie de Vivre', 'luxescent-joie-de-vivre',
 'Luminous iris and praline — a bright declaration of joyful living.',
 'Life is beautiful. Joie de Vivre celebrates that truth through luminous iris, radiant praline, and warm sandalwood.',
 7500, NULL,
 ARRAY['https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80','https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80'],
 'eau-de-parfum','feminine','Oriental Floral','EDP','moderate','7–9 hours',
 ARRAY['iris','praline','gourmand','floral','warm'],
 ARRAY['Blackcurrant','Pear'],
 ARRAY['Iris','Jasmine','Orange Blossom'],
 ARRAY['Praline','Vanilla','Sandalwood','Patchouli'],
 4.6, 2890, false, false, false),

('Coupable', 'luxescent-coupable',
 'Mandarin, pink pepper, and patchouli — unapologetically sensual.',
 'Coupable is for those who live by their own rules. Mandarin, geranium, and patchouli with a touch of amber.',
 8800, NULL,
 ARRAY['https://images.unsplash.com/photo-1542038374332-e5b4a073cba2?w=800&q=80','https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80'],
 'eau-de-parfum','feminine','Oriental Floral','EDP','moderate','6–8 hours',
 ARRAY['mandarin','patchouli','floral','sensual'],
 ARRAY['Pink Pepper','Mandarin Orange','Bergamot'],
 ARRAY['Geranium','Lilac','Rose'],
 ARRAY['Patchouli','Amber','Musk'],
 4.5, 1987, false, false, false),

('Aqua Marina', 'luxescent-aqua-marina',
 'The ocean in a bottle — aquatic, mineral, meditative.',
 'Aqua Marina speaks of the timeless connection between land and sea. Marine sage and rosemary with incense base.',
 8900, NULL,
 ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80','https://images.unsplash.com/photo-1547212371-eb5e6a4b590c?w=800&q=80'],
 'eau-de-parfum','masculine','Aquatic','EDP','moderate','7–9 hours',
 ARRAY['aquatic','fresh','marine','incense'],
 ARRAY['Calabrian Bergamot','Sea Notes','Green Tangerine'],
 ARRAY['Sage','Rosemary','Incense'],
 ARRAY['Patchouli','Labdanum','Mineral Musk'],
 4.7, 3567, false, true, false),

('Oud Bouquet', 'luxescent-oud-bouquet',
 'Dark rose and smoky oud from the Arabian nights.',
 'Smoky Assam oud blended with Turkish rose absolute and saffron.' ,
 18500, NULL,
 ARRAY['https://images.unsplash.com/photo-1588776814546-1ffbb172c5e4?w=800&q=80','https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80'],
 'parfum','unisex','Woody Oriental','Parfum','heavy','12–16 hours',
 ARRAY['oud','rose','saffron','smoky','oriental'],
 ARRAY['Saffron','Bergamot','Pink Pepper'],
 ARRAY['Turkish Rose','Oud','Incense'],
 ARRAY['Sandalwood','Amber','Vetiver','Musk'],
 4.9, 421, true, false, true),

('Velvet Rose', 'luxescent-velvet-rose',
 'Fresh Turkish roses softened with peony and white musk.',
 'A bouquet of Bulgarian and Turkish roses woven with delicate peony and white musk.',
 11500, NULL,
 ARRAY['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80','https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80'],
 'eau-de-parfum','feminine','Floral','EDP','moderate','6–8 hours',
 ARRAY['rose','floral','fresh','peony','feminine'],
 ARRAY['Bergamot','Lychee','Raspberry'],
 ARRAY['Bulgarian Rose','Turkish Rose','Peony'],
 ARRAY['Musk','Amber','Sandalwood'],
 4.7, 312, false, false, true),

('Green Cedar', 'luxescent-green-cedar',
 'Forest-fresh vetiver, cedar, and cold mineral air.',
 'Inspired by a walk through an ancient cedar forest after rain.',
 10500, NULL,
 ARRAY['https://images.unsplash.com/photo-1594035491768-73b0cbb7c0fa?w=800&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
 'eau-de-toilette','unisex','Woody Aromatic','EDT','light','4–6 hours',
 ARRAY['cedar','green','fresh','woody','vetiver'],
 ARRAY['Grapefruit','Basil','Green Leaves'],
 ARRAY['Cedar','Vetiver','Juniper'],
 ARRAY['Oakmoss','Amber','Musk'],
 4.6, 178, false, false, true),

('Mademoiselle Bold', 'luxescent-mademoiselle-bold',
 'Bold bergamot, patchouli, and rose — free, fresh, and daring.',
 'A modern, daring fragrance — bright bergamot and orange with rose-jasmine heart and patchouli base.',
 13500, NULL,
 ARRAY['https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80','https://images.unsplash.com/photo-1542038374332-e5b4a073cba2?w=800&q=80'],
 'eau-de-parfum','feminine','Oriental Floral','EDP','moderate','7–9 hours',
 ARRAY['orange','patchouli','floral','modern','bold'],
 ARRAY['Bergamot','Orange','Grapefruit'],
 ARRAY['Rose','Jasmine','Mimosa'],
 ARRAY['Patchouli','Vetiver','Vanilla','White Musk'],
 4.8, 4872, false, false, false),

('Code Homme', 'luxescent-code-homme',
 'Bergamot, olive, and spiced honey — elegantly, confidently masculine.',
 'Deep oriental woody. Green bergamot and honey on leather and guaiac wood.',
 8500, NULL,
 ARRAY['https://images.unsplash.com/photo-1600612253971-6d69a4498dce?w=800&q=80','https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'],
 'eau-de-parfum','masculine','Oriental Woody','EDP','moderate','8–10 hours',
 ARRAY['bergamot','honey','woody','oriental','masculine'],
 ARRAY['Bergamot','Grapefruit'],
 ARRAY['Orange Blossom','Honey','Olive'],
 ARRAY['Leather','Guaiac Wood','Tobacco'],
 4.7, 2134, false, false, false),

('Eau Tendre', 'luxescent-eau-tendre',
 'Light, airy citrus and jasmine — fragility in bloom.',
 'Round, aerial and deeply sensual. Grapefruit quince top notes with jasmine heart.',
 11000, NULL,
 ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80','https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80'],
 'eau-de-toilette','feminine','Citrus Floral','EDT','light','4–6 hours',
 ARRAY['citrus','jasmine','fresh','light','floral'],
 ARRAY['Grapefruit','Quince'],
 ARRAY['Jasmine','Hyacinth'],
 ARRAY['Cedarmoss','Musk','Amber'],
 4.6, 3210, false, false, false),

('Le Roi', 'luxescent-le-roi',
 'Pineapple and birch smoke — the king of fragrances.',
 'Pineapple and blackcurrant give way to smoky, woody birch — a legend in every spray.',
 42000, 48000,
 ARRAY['https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80','https://images.unsplash.com/photo-1600612253971-6d69a4498dce?w=800&q=80'],
 'eau-de-parfum','masculine','Fruity Woody','EDP','heavy','10–14 hours',
 ARRAY['pineapple','birch','smoky','fruity','premium'],
 ARRAY['Pineapple','Bergamot','Apple','Blackcurrant'],
 ARRAY['Birch','Patchouli','Rose','Jasmine'],
 ARRAY['Musk','Oakmoss','Ambergris','Vanilla'],
 4.9, 1876, true, false, false),

('Midnight Smoke', 'luxescent-midnight-smoke',
 'Burning iris, incense, and dark leather for night owls.',
 'Smoky incense and leather anchor an unexpected iris heart. Mysterious, confident, unforgettable.',
 15500, NULL,
 ARRAY['https://images.unsplash.com/photo-1488382739463-537bfc87a90c?w=800&q=80','https://images.unsplash.com/photo-1594035491768-73b0cbb7c0fa?w=800&q=80'],
 'parfum','unisex','Leather','Parfum','heavy','12+ hours',
 ARRAY['iris','leather','incense','smoky','dark'],
 ARRAY['Bergamot','Nutmeg','Cardamom'],
 ARRAY['Iris','Orris','Incense'],
 ARRAY['Leather','Oud','Smoke','Benzoin'],
 4.8, 245, true, false, true);

-- Product Variants (insert after products)
DO $$
DECLARE
  p_id UUID;
BEGIN
  SELECT id INTO p_id FROM products WHERE slug='luxescent-noir-sauvage';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 5500, 12, 'LUX-NS-30'), (p_id, 60, 9500, 8, 'LUX-NS-60'), (p_id, 100, 13500, 5, 'LUX-NS-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-blanc-absolu';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 9500, 6, 'LUX-BA-30'), (p_id, 50, 14500, 4, 'LUX-BA-50'), (p_id, 100, 22000, 3, 'LUX-BA-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-dark-opium';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 5200, 15, 'LUX-DO-30'), (p_id, 50, 8200, 10, 'LUX-DO-50'), (p_id, 90, 11500, 6, 'LUX-DO-90');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-bleu-profond';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 50, 8500, 9, 'LUX-BP-50'), (p_id, 100, 12000, 7, 'LUX-BP-100'), (p_id, 150, 16500, 3, 'LUX-BP-150');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-joie-de-vivre';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 4500, 14, 'LUX-JV-30'), (p_id, 50, 7500, 8, 'LUX-JV-50'), (p_id, 75, 10500, 5, 'LUX-JV-75');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-coupable';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 5500, 10, 'LUX-CO-30'), (p_id, 50, 8800, 7, 'LUX-CO-50'), (p_id, 75, 12000, 4, 'LUX-CO-75');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-aqua-marina';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 40, 5800, 11, 'LUX-AM-40'), (p_id, 75, 8900, 8, 'LUX-AM-75'), (p_id, 125, 12500, 5, 'LUX-AM-125');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-oud-bouquet';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 11500, 5, 'LUX-OB-30'), (p_id, 50, 18500, 3, 'LUX-OB-50'), (p_id, 100, 32000, 2, 'LUX-OB-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-velvet-rose';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 6500, 12, 'LUX-VR-30'), (p_id, 60, 11500, 7, 'LUX-VR-60'), (p_id, 100, 17000, 4, 'LUX-VR-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-green-cedar';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 50, 7200, 18, 'LUX-GC-50'), (p_id, 100, 10500, 12, 'LUX-GC-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-mademoiselle-bold';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 35, 8500, 8, 'LUX-MB-35'), (p_id, 50, 13500, 5, 'LUX-MB-50'), (p_id, 100, 19500, 3, 'LUX-MB-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-code-homme';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 5000, 13, 'LUX-CH-30'), (p_id, 60, 8500, 9, 'LUX-CH-60'), (p_id, 110, 12000, 5, 'LUX-CH-110');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-eau-tendre';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 50, 8000, 10, 'LUX-ET-50'), (p_id, 100, 11000, 7, 'LUX-ET-100'), (p_id, 150, 14500, 4, 'LUX-ET-150');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-le-roi';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 50, 28000, 4, 'LUX-LR-50'), (p_id, 100, 42000, 2, 'LUX-LR-100');

  SELECT id INTO p_id FROM products WHERE slug='luxescent-midnight-smoke';
  INSERT INTO product_variants (product_id, size, price, stock, sku) VALUES
    (p_id, 30, 9500, 6, 'LUX-MS-30'), (p_id, 60, 15500, 4, 'LUX-MS-60'), (p_id, 100, 24000, 2, 'LUX-MS-100');
END $$;

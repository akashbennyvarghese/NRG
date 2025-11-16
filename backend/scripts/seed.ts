import { query } from '../config/database.js';
import { hashPassword } from '../utils/auth.js';

const seedDatabase = async () => {
  console.log('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('admin@123');
    const adminResult = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@nrg.com', adminPassword, 'Admin', 'User', 'admin']
    );
    console.log('✓ Admin user created/updated');

    // Create categories
    const categories = [
      { name: 'Batteries', slug: 'batteries', icon: '🔋' },
      { name: 'Solar Panels', slug: 'solar-panels', icon: '☀️' },
      { name: 'Accessories', slug: 'accessories', icon: '🔌' },
    ];

    for (const cat of categories) {
      await query(
        `INSERT INTO categories (name, slug, icon, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.slug, cat.icon]
      );
    }
    console.log('✓ Categories created');

    // Create brands
    const brands = [
      { name: 'Luminous', slug: 'luminous' },
      { name: 'Exide', slug: 'exide' },
      { name: 'Sukam', slug: 'sukam' },
      { name: 'Aditya', slug: 'aditya' },
      { name: 'Microtek', slug: 'microtek' },
    ];

    for (const brand of brands) {
      await query(
        `INSERT INTO brands (name, slug, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (name) DO NOTHING`,
        [brand.name, brand.slug]
      );
    }
    console.log('✓ Brands created');

    // Get category and brand IDs
    const catResult = await query('SELECT id, slug FROM categories WHERE slug = $1', ['batteries']);
    const brandResult = await query('SELECT id FROM brands WHERE slug = $1', ['luminous']);

    if (catResult.rows.length > 0 && brandResult.rows.length > 0) {
      const categoryId = catResult.rows[0].id;
      const brandId = brandResult.rows[0].id;

      // Create sample product
      const productResult = await query(
        `INSERT INTO products 
         (name, sku, description, category_id, brand_id, base_price, offer_price, warranty_months, is_draft, is_active, specifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, true, $9)
         ON CONFLICT (sku) DO NOTHING
         RETURNING id`,
        [
          'Luminous 100Ah Lithium Battery',
          'LUM-LITH-100',
          'High-performance 100Ah LiFePO4 lithium battery for solar systems',
          categoryId,
          brandId,
          45000,
          42000,
          10,
          JSON.stringify({
            capacity: '100Ah',
            voltage: '48V',
            chemistry: 'LiFePO4',
            dimensions: '650x230x240mm',
            weight: '28kg',
          }),
        ]
      );

      if (productResult.rows.length > 0) {
        const productId = productResult.rows[0].id;

        // Add variant
        await query(
          `INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (sku) DO NOTHING`,
          [
            productId,
            'LUM-LITH-100-VAR1',
            '100Ah 48V',
            JSON.stringify({ capacity: '100Ah', voltage: '48V' }),
            42000,
            25,
          ]
        );

        // Add product image
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
           VALUES ($1, $2, $3, true, 0)
           ON CONFLICT DO NOTHING`,
          [
            productId,
            'https://via.placeholder.com/500x500?text=Luminous+100Ah+Battery',
            'Luminous 100Ah Lithium Battery',
          ]
        );

        console.log('✓ Sample product and variant created');
      }
    }

    // Create sample coupons
    await query(
      `INSERT INTO coupons (code, discount_type, discount_value, is_active, valid_from, valid_until)
       VALUES ($1, $2, $3, true, NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT (code) DO NOTHING`,
      ['WELCOME10', 'percentage', 10]
    );

    await query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, is_active, valid_from, valid_until)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT (code) DO NOTHING`,
      ['SUMMER20', 'percentage', 20, 5000]
    );

    console.log('✓ Sample coupons created');

    console.log('✅ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Email: admin@nrg.com');
    console.log('Password: admin@123');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

seedDatabase().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

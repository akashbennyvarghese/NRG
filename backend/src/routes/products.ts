import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all products with filters
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, brand, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT p.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
      WHERE p.is_draft = false AND p.is_active = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND p.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (brand) {
      sql += ` AND p.brand_id = $${paramIndex}`;
      params.push(brand);
      paramIndex++;
    }

    if (minPrice) {
      sql += ` AND p.offer_price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      sql += ` AND p.offer_price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({
      products: result.rows,
      page,
      limit,
      total: result.rowCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productResult = await query(
      `SELECT * FROM products WHERE id = $1 AND is_draft = false`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Get images
    const imagesResult = await query(
      'SELECT id, image_url, alt_text, is_primary FROM product_images WHERE product_id = $1 ORDER BY display_order',
      [id]
    );

    // Get variants
    const variantsResult = await query(
      'SELECT id, name, sku, attributes, price, stock_quantity FROM product_variants WHERE product_id = $1',
      [id]
    );

    // Get reviews
    const reviewsResult = await query(
      `SELECT r.id, r.rating, r.title, r.comment, u.first_name, r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      ...product,
      images: imagesResult.rows,
      variants: variantsResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products with auto-suggestions
router.get('/search/suggestions', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || String(q).length < 2) {
      return res.json([]);
    }

    const result = await query(
      `SELECT DISTINCT name FROM products 
       WHERE is_draft = false AND name ILIKE $1 
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json(result.rows.map((r) => r.name));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;

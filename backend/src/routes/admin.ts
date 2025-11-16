import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { generateSKU } from '../utils/auth.js';

const router = Router();

// Product Management
// Create product
router.post('/products', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category_id, brand_id, base_price, offer_price, warranty_months, description, specifications } = req.body;

    if (!name || !category_id || !base_price) {
      return res.status(400).json({ error: 'name, category_id, and base_price are required' });
    }

    const sku = generateSKU('PRD');

    const result = await query(
      `INSERT INTO products (name, sku, category_id, brand_id, base_price, offer_price, warranty_months, description, specifications, created_by, is_draft)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING id, sku`,
      [name, sku, category_id, brand_id, base_price, offer_price || base_price, warranty_months, description, JSON.stringify(specifications || {}), req.user?.userId]
    );

    res.status(201).json({
      message: 'Product created in draft mode',
      productId: result.rows[0].id,
      sku: result.rows[0].sku,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.patch('/products/:productId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    let sql = 'UPDATE products SET ';
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_by') {
        sql += `${key} = $${paramIndex}, `;
        params.push(value);
        paramIndex++;
      }
    }

    sql += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id`;
    params.push(productId);

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Publish product
router.post('/products/:productId/publish', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    await query(
      'UPDATE products SET is_draft = false, is_active = true WHERE id = $1',
      [productId]
    );

    res.json({ message: 'Product published successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish product' });
  }
});

// Add product variant
router.post('/products/:productId/variants', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { name, attributes, price, weight, dimensions_length, dimensions_width, dimensions_height, stock_quantity } = req.body;

    const sku = generateSKU('VAR');

    const result = await query(
      `INSERT INTO product_variants 
       (product_id, sku, name, attributes, price, weight, dimensions_length, dimensions_width, dimensions_height, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [productId, sku, name, JSON.stringify(attributes || {}), price, weight, dimensions_length, dimensions_width, dimensions_height, stock_quantity]
    );

    res.status(201).json({
      message: 'Variant created successfully',
      variantId: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// Add product image
router.post('/products/:productId/images', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { image_url, alt_text, display_order, is_primary } = req.body;

    await query(
      `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, image_url, alt_text, display_order || 0, is_primary || false]
    );

    res.json({ message: 'Image added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Inventory Management
router.patch('/inventory/:variantId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { variantId } = req.params;
    const { adjustment, action } = req.body;

    const currentResult = await query(
      'SELECT stock_quantity FROM product_variants WHERE id = $1',
      [variantId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    let newStock = currentResult.rows[0].stock_quantity;

    if (action === 'add') {
      newStock += adjustment;
    } else if (action === 'remove') {
      newStock -= adjustment;
    }

    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await query(
      'UPDATE product_variants SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStock, variantId]
    );

    res.json({ message: 'Stock updated', newStock });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Order Management
router.get('/orders', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ` AND order_status = $${params.length + 1}`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:orderId/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    await query(
      'UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, orderId]
    );

    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Add shipment
router.post('/orders/:orderId/shipment', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { tracking_number, carrier, estimated_delivery } = req.body;

    await query(
      `INSERT INTO shipments (order_id, tracking_number, carrier, estimated_delivery, shipment_status)
       VALUES ($1, $2, $3, $4, 'shipped')`,
      [orderId, tracking_number, carrier, estimated_delivery]
    );

    // Update order status to shipped
    await query(
      'UPDATE orders SET order_status = $1 WHERE id = $2',
      ['shipped', orderId]
    );

    res.json({ message: 'Shipment created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Analytics
router.get('/analytics/sales', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    let sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE order_status != 'cancelled'
    `;
    const params: any[] = [];

    if (from) {
      sql += ` AND created_at >= $${params.length + 1}`;
      params.push(from);
    }

    if (to) {
      sql += ` AND created_at <= $${params.length + 1}`;
      params.push(to);
    }

    sql += ` GROUP BY DATE(created_at) ORDER BY date DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get top selling products
router.get('/analytics/top-products', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.name, 
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE oi.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

export default router;

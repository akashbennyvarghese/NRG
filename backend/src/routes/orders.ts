import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId } from '../utils/auth.js';

const router = Router();

// Create order from cart
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { shipping_address_id, billing_address_id, coupon_code, notes } = req.body;

    // Get cart items
    const cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.userId]
    );

    if (!cartResult.rows[0]) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const cartId = cartResult.rows[0].id;

    const itemsResult = await query(
      `SELECT ci.quantity, pv.id as variant_id, pv.price, p.name
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of itemsResult.rows) {
      subtotal += item.price * item.quantity;
    }

    let discount = 0;
    if (coupon_code) {
      const couponResult = await query(
        'SELECT discount_type, discount_value FROM coupons WHERE code = $1 AND is_active = true',
        [coupon_code]
      );

      if (couponResult.rows[0]) {
        const coupon = couponResult.rows[0];
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
        } else {
          discount = coupon.discount_value;
        }
      }
    }

    const shipping_fee = 0; // Can be calculated based on address
    const tax = 0; // Can be calculated based on tax rules
    const total = subtotal - discount + shipping_fee + tax;

    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const orderResult = await query(
      `INSERT INTO orders 
       (order_number, user_id, shipping_address_id, billing_address_id, 
        subtotal, shipping_fee, tax_amount, discount_amount, total_amount, coupon_code, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, order_number`,
      [
        orderNumber, req.user.userId, shipping_address_id, billing_address_id,
        subtotal, shipping_fee, tax, discount, total, coupon_code, notes
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of itemsResult.rows) {
      await query(
        `INSERT INTO order_items (order_id, variant_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.variant_id, item.name, item.quantity, item.price, item.price * item.quantity]
      );
    }

    // Clear cart
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      orderNumber,
      total,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      `SELECT id, order_number, order_status, payment_status, total_amount, created_at
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:orderId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { orderId } = req.params;

    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    // Get shipment info
    const shipmentResult = await query(
      'SELECT * FROM shipments WHERE order_id = $1',
      [orderId]
    );

    res.json({
      ...order,
      items: itemsResult.rows,
      shipment: shipmentResult.rows[0] || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Cancel order
router.post('/:orderId/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { orderId } = req.params;

    const orderResult = await query(
      'SELECT payment_status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Can only cancel if payment is pending or refund if payment is completed
    await query(
      'UPDATE orders SET order_status = $1 WHERE id = $2',
      ['cancelled', orderId]
    );

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;

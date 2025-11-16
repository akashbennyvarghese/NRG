import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get user's cart
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get or create cart
    let cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.userId]
    );

    let cartId = cartResult.rows[0]?.id;

    if (!cartId) {
      const createResult = await query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [req.user.userId]
      );
      cartId = createResult.rows[0].id;
    }

    // Get cart items with product details
    const itemsResult = await query(
      `SELECT ci.id, ci.quantity, 
              pv.id as variant_id, pv.name, pv.sku, pv.price,
              p.id as product_id, p.name as product_name
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.added_at DESC`,
      [cartId]
    );

    res.json({
      cartId,
      items: itemsResult.rows,
      itemCount: itemsResult.rowCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { variant_id, quantity } = req.body;

    if (!variant_id || !quantity) {
      return res.status(400).json({ error: 'variant_id and quantity are required' });
    }

    // Get or create cart
    let cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.userId]
    );

    let cartId = cartResult.rows[0]?.id;

    if (!cartId) {
      const createResult = await query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [req.user.userId]
      );
      cartId = createResult.rows[0].id;
    }

    // Check if item already exists in cart
    const existingResult = await query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [cartId, variant_id]
    );

    if (existingResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingResult.rows[0].quantity + quantity;
      await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existingResult.rows[0].id]
      );
    } else {
      // Add new item
      await query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
        [cartId, variant_id, quantity]
      );
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Remove item from cart
router.delete('/items/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Update cart item quantity
router.patch('/items/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2',
      [quantity, itemId]
    );

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Clear cart
router.delete('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.userId]
    );

    if (cartResult.rows.length > 0) {
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;

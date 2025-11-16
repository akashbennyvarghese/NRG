import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    // Get order details
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        order_id: orderId,
        customer_email: order.user_id,
      },
    });

    // Save payment record
    await query(
      `INSERT INTO payments (order_id, razorpay_order_id, payment_status)
       VALUES ($1, $2, 'pending')`,
      [orderId, razorpayOrder.id]
    );

    res.json({
      orderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'NRG E-Commerce',
      description: `Order #${order.order_number}`,
      prefill: {
        email: order.user_id,
      },
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Get payment from DB
    const paymentResult = await query(
      'SELECT * FROM payments WHERE razorpay_order_id = $1',
      [razorpay_order_id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update payment in DB
    await query(
      `UPDATE payments 
       SET razorpay_payment_id = $1, razorpay_signature = $2, payment_status = $3, verified = true
       WHERE razorpay_order_id = $4`,
      [razorpay_payment_id, razorpay_signature, razorpayPayment.status, razorpay_order_id]
    );

    if (razorpayPayment.status === 'captured') {
      // Update order status
      await query(
        'UPDATE orders SET payment_status = $1, order_status = $2 WHERE id = $3',
        ['completed', 'confirmed', orderId]
      );

      res.json({
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        status: 'captured',
      });
    } else {
      res.status(400).json({ error: 'Payment not captured' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Process refund
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { paymentId, amount } = req.body;

    // Get payment details
    const paymentResult = await query(
      'SELECT * FROM payments WHERE razorpay_payment_id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round((amount || payment.amount) * 100),
    });

    // Update payment status
    await query(
      'UPDATE payments SET payment_status = $1 WHERE razorpay_payment_id = $2',
      ['refunded', paymentId]
    );

    res.json({
      message: 'Refund processed successfully',
      refundId: refund.id,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

export default router;

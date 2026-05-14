const express = require('express');
const Order   = require('../models/Order');
const auth    = require('../middleware/auth');

const router = express.Router();

// Place order (login required)
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const order = new Order({
      user: req.user.id,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      status: 'Pending',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const Product = require('../models/Product');
const User    = require('../models/User');   // ✅ Fix: User import add kiya
const auth    = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search)   query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product — Admin only
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product — Admin only
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
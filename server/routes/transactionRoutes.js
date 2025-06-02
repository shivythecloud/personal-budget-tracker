const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth'); // Your JWT middleware

router.get('/', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW TRANSACTION
router.post('/', verifyToken, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,          // Spread existing fields (description, amount, etc.)
      userId: req.userId    // Attach the user's ID
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete transaction (user)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId  // Ensure user owns this transaction
    });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

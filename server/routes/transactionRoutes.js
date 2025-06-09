const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const transactionController = require('../controllers/transactionControllers');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');

router.get('/sumary', transactionController.getDashboardStats);

router.get('/', verifyToken, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = { userId: req.userId };


    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }


    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));


    const total = await Transaction.countDocuments(query);


    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });


  } catch (err) {
    console.error('GET /transactions error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


router.post(
  '/',
  verifyToken,
  [
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be "income" or "expense"'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format (use YYYY-MM-DD)')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }


    try {
      const transaction = new Transaction({
        ...req.body,
        userId: req.userId
      });


      await transaction.save();


      res.status(201).json({
        success: true,
        data: transaction
      });


    } catch (err) {
      console.error('POST /transactions error:', err);
      res.status(400).json({
        success: false,
        error: 'Failed to create transaction',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);


router.put(
  '/:id',
  verifyToken,
  [
    body('amount')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Amount must be positive'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }


    try {
      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true, runValidators: true }
      );


      if (!transaction) {
        console.warn(`Update failed - Transaction ${req.params.id} not found for user ${req.userId}`);
        return res.status(404).json({
          success: false,
          error: 'Transaction not found or unauthorized'
        });
      }


      res.json({
        success: true,
        data: transaction
      });


    } catch (err) {
      console.error(`PUT /transactions/${req.params.id} error:`, err);
      res.status(500).json({
        success: false,
        error: 'Failed to update transaction',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);


router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });


    if (!transaction) {
      console.warn(`Delete failed - Transaction ${req.params.id} not found for user ${req.userId}`);
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or unauthorized'
      });
    }


    console.log(`Transaction ${req.params.id} deleted by user ${req.userId}`);
    res.json({
      success: true,
      data: { id: req.params.id }
    });


  } catch (err) {
    console.error(`DELETE /transactions/${req.params.id} error:`, err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


module.exports = router;

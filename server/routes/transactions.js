const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth'); // Your JWT auth middleware

router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      startDate, 
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { userId: req.user.id };
    
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('category', 'name type color icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Transaction.countDocuments(query)
    ]);
    
    const totals = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpense = totals.find(t => t._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpense;
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalTransactions: total,
        hasNext: skip + limitNum < total,
        hasPrev: page > 1
      },
      summary: {
        totalIncome,
        totalExpense,
        balance
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
    .populate('category', 'name type color icon')
    .select('-__v');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { 
      description, 
      amount, 
      type, 
      category, 
      date, 
      notes, 
      tags, 
      paymentMethod,
      isRecurring,
      recurringFrequency
    } = req.body;

    if (!description || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Description, amount, type, and category are required'
      });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    // Verify category exists and belongs to user
    const categoryDoc = await Category.findOne({
      _id: category,
      userId: req.user.id
    });
    
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    if (categoryDoc.type !== type) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must match category type'
      });
    }
    
    const transaction = new Transaction({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: date || new Date(),
      notes: notes?.trim(),
      tags: tags || [],
      paymentMethod,
      isRecurring: isRecurring || false,
      recurringFrequency,
      userId: req.user.id
    });
    
    await transaction.save();
    
    await transaction.populate('category', 'name type color icon');
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      description, 
      amount, 
      category, 
      date, 
      notes, 
      tags, 
      paymentMethod,
      isRecurring,
      recurringFrequency
    } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (category && category !== transaction.category.toString()) {
      const categoryDoc = await Category.findOne({
        _id: category,
        userId: req.user.id
      });
      
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      if (categoryDoc.type !== transaction.type) {
        return res.status(400).json({
          success: false,
          message: 'New category type must match transaction type'
        });
      }
    }
    
    // Update fields
    if (description) transaction.description = description.trim();
    if (amount) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      transaction.amount = parseFloat(amount);
    }
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes?.trim();
    if (tags) transaction.tags = tags;
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (isRecurring !== undefined) transaction.isRecurring = isRecurring;
    if (recurringFrequency) transaction.recurringFrequency = recurringFrequency;
    
    await transaction.save();
    
    await transaction.populate('category', 'name type color icon');
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
});

router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    // Get category breakdown
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: {
            categoryId: '$category',
            categoryName: '$categoryInfo.name',
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    const income = stats.find(s => s._id === 'income') || { total: 0, count: 0, avgAmount: 0 };
    const expense = stats.find(s => s._id === 'expense') || { total: 0, count: 0, avgAmount: 0 };
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        summary: {
          totalIncome: income.total,
          totalExpense: expense.total,
          balance: income.total - expense.total,
          transactionCount: income.count + expense.count,
          avgIncome: income.avgAmount,
          avgExpense: expense.avgAmount
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction statistics'
    });
  }
});

module.exports = router;

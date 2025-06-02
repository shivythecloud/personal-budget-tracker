const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth'); // Your JWT auth middleware

// CRUD routes for transactions

// GET all transactions with pagination, filters, and sorting
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
    
    if (type && ['income', 'expense'].includes(type)) query.type = type;
    if (category) query.category = category;
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
      summary: { totalIncome, totalExpense, balance }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching transactions' });
  }
});

// POST a new transaction
router.post('/', auth, async (req, res) => {
  const { description, amount, type, category, date, notes, tags, paymentMethod, isRecurring, recurringFrequency } = req.body;
  
  try {
    if (!description || !amount || !type || !category) {
      return res.status(400).json({ success: false, message: 'Description, amount, type, and category are required' });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either income or expense' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }
    
    const categoryDoc = await Category.findOne({ _id: category, userId: req.user.id });
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }
    if (categoryDoc.type !== type) {
      return res.status(400).json({ success: false, message: 'Transaction type must match category type' });
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
    res.status(201).json({ success: true, message: 'Transaction created successfully', data: transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating transaction' });
  }
});

// DELETE a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting transaction' });
  }
});

// PUT (update) a transaction
router.put('/:id', auth, async (req, res) => {
  const { description, amount, type, category, date, notes, tags, paymentMethod, isRecurring, recurringFrequency } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    transaction.description = description || transaction.description;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.notes = notes || transaction.notes;
    transaction.tags = tags || transaction.tags;
    transaction.paymentMethod = paymentMethod || transaction.paymentMethod;
    transaction.isRecurring = isRecurring || transaction.isRecurring;
    transaction.recurringFrequency = recurringFrequency || transaction.recurringFrequency;

    await transaction.save();
    await transaction.populate('category', 'name type color icon');
    res.json({ success: true, message: 'Transaction updated successfully', data: transaction });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating transaction' });
  }
});

// Monthly Summary Route
router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const stats = await Transaction.aggregate([
      { $match: { userId: req.user.id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
    const totalExpense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpense;

    res.json({ success: true, data: { totalIncome, totalExpense, balance } });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching monthly summary' });
  }
});

// Weekly Summary Route
router.get('/summary/weekly', auth, async (req, res) => {
  try {
    const { year, week } = req.query;
    const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
    const endOfWeek = new Date(year, 0, 7 + (week - 1) * 7);

    const stats = await Transaction.aggregate([
      { $match: { userId: req.user.id, date: { $gte: startOfWeek, $lte: endOfWeek } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
    const totalExpense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpense;

    res.json({ success: true, data: { totalIncome, totalExpense, balance } });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching weekly summary' });
  }
});

// Quarterly Summary Route
router.get('/summary/quarterly', auth, async (req, res) => {
  try {
    const { year, quarter } = req.query;
    const startOfQuarter = new Date(year, (quarter - 1) * 3, 1);
    const endOfQuarter = new Date(year, quarter * 3, 0);

    const stats = await Transaction.aggregate([
      { $match: { userId: req.user.id, date: { $gte: startOfQuarter, $lte: endOfQuarter } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
    const totalExpense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpense;

    res.json({ success: true, data: { totalIncome, totalExpense, balance } });
  } catch (error) {
    console.error('Get quarterly summary error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching quarterly summary' });
  }
});

module.exports = router;

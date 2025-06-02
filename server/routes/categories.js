const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth'); // Your JWT auth middleware

router.get('/', auth, async (req, res) => {
  try {
    const { type, active } = req.query;
    
    const query = { userId: req.user.id };
    
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('-__v').populate('transactionCount');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense'
      });
    }
    
    // Check for duplicate
    const existingCategory = await Category.findOne({
      name: name.trim(),
      type,
      userId: req.user.id
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `${type} category with this name already exists`
      });
    }
    
    const category = new Category({
      name: name.trim(),
      type,
      color,
      icon,
      userId: req.user.id
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
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
      message: 'Server error while creating category'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color, icon, isActive } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check for duplicate 
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        type: category.type,
        userId: req.user.id,
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: `${category.type} category with this name already exists`
        });
      }
    }
    
    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
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
      message: 'Server error while updating category'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check transactions
    const transactionCount = await Transaction.countDocuments({
      category: req.params.id,
      userId: req.user.id
    });
    
    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${transactionCount} associated transactions. Consider deactivating instead.`
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

  userid: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  description: {
    type: String,
    required: [true, 'Transaction description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense'],
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  }
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return this.type === 'expense' ? -Math.abs(this.amount) : Math.abs(this.amount);
});

// ensures category belongs to user
transactionSchema.pre('validate', async function(next) {
  if (this.category && this.userId) {
    const Category = mongoose.model('Category');
    const category = await Category.findOne({ 
      _id: this.category, 
      userId: this.userId 
    });
    
    if (!category) {
      return next(new Error('Category not found or does not belong to user'));
    }

    if (category.type !== this.type) {
      return next(new Error('Transaction type must match category type'));
    }
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);

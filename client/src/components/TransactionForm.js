import React, { useState } from 'react';
import axios from 'axios';
import { useData } from './DataProvider';

const TransactionForm = () => {
  const { categories, fetchTransactions } = useData();
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transactions', form);
      setForm({ description: '', amount: '', type: 'expense', category: '' });
      fetchTransactions();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select name="category" value={form.category} onChange={handleChange}>
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
      <button type="submit">Add</button>
    </form>
  );
};

export default TransactionForm;

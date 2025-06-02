import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      fetchTransactions(); 
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    fetchTransactions(); 
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Transactions</h2>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx._id} className="border p-2 rounded">
            {tx.description} - ${tx.amount}
            <button
              onClick={() => handleDelete(tx._id)}
              className="ml-4 text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <p>Total Income: ${totalIncome}</p>
        <p>Total Expenses: ${totalExpense}</p>
        <p>Balance: ${balance}</p>
      </div>
    </div>
  );
}



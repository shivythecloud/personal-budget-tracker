import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);


  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions');
      // Sort transactions by most recent date
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sorted);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };


  // Delete handler
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      fetchTransactions(); // Refresh list
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };


  useEffect(() => {
    fetchTransactions();
  }, []);


  // Format date safely
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };


  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);


  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);


  const balance = totalIncome - totalExpense;


  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>


      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Category</th>
              <th className="p-2">Type</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{formatDate(tx.date)}</td>
                <td className="p-2">{tx.description || '-'}</td>
                <td className="p-2">{tx.category || '-'}</td>
                <td className="p-2 capitalize">{tx.type || '-'}</td>
                <td className="p-2 text-right">${(tx.amount || 0).toFixed(2)}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => handleDelete(tx._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                  {/* Future: Add edit functionality here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="mt-6 text-right space-y-1 text-sm text-gray-700">
        <p><strong>Total Income:</strong> ${totalIncome.toFixed(2)}</p>
        <p><strong>Total Expenses:</strong> ${totalExpense.toFixed(2)}</p>
        <p><strong>Balance:</strong> ${balance.toFixed(2)}</p>
      </div>
    </div>
  );
}





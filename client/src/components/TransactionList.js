import React from 'react';
import { useData } from './DataProvider';

export default function TransactionList() {
  const { transactions } = useData();

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Transactions</h2>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx._id} className="border p-2 rounded">
            {tx.description} - ${tx.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

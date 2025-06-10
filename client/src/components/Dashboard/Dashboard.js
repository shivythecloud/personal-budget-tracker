import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // <-- fixed path
import { LogOut, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { DataProvider } from '../DataProvider';
import TransactionList from '../TransactionList';
import CategoryList from '../CategoryList';


const DashboardContent = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/transactions/summary');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };


    fetchStats();
  }, []);


  const handleLogout = () => logout();


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
          <div className="flex space-x-4 items-center">
            <span className="text-gray-700">Welcome, {user?.name}!</span>
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-500">Income</h3>
              <ArrowUpCircle className="text-green-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">${stats.income.toFixed(2)}</p>
          </div>


          {/* Expense Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-500">Expense</h3>
              <ArrowDownCircle className="text-red-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">${stats.expense.toFixed(2)}</p>
          </div>


          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-500">Balance</h3>
              <Wallet className="text-blue-500" size={24} />
            </div>
            <p className={`mt-2 text-3xl font-bold ${
              stats.balance >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              ${stats.balance.toFixed(2)}
            </p>
          </div>
        </div>


        {/* Welcome Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
          <p className="text-gray-600">
            Track your income and expenses to better manage your budget.
          </p>
        </div>


        {/* Data Sections */}
        <TransactionList />
        <CategoryList />
      </div>
    </div>
  );
};


export default function Dashboard() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  );
}

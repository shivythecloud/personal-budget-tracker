import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { DataProvider } from './DataProvider';
import TransactionList from './TransactionList';
import CategoryList from './CategoryList';

const DashboardContent = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
          <div className="flex space-x-4 items-center">
            <span className="text-gray-700">Welcome, {user?.name}!</span>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Welcome Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Budget Dashboard</h2>
          <p className="text-gray-600 mb-4">You're successfully authenticated! Here's your account info:</p>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
          </div>
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

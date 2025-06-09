import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import PrivateRoute from './components/PrivateRoute'; 
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <>
                  <nav className="navbar">
                    <h1>Personal Budget Tracker</h1>
                    <div className="nav-actions">
                      <span>Welcome, {user?.email}</span>
                      <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                  </nav>
                  <Dashboard user={user} />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/users"
            element={
              <PrivateRoute>
                <>
                  <nav className="navbar">
                    <h1>User Management</h1>
                    <div className="nav-actions">
                      <button onClick={() => window.location.href = '/dashboard'}>Dashboard</button>
                      <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                  </nav>
                  <main>
                    <UserForm />
                    <UserList />
                  </main>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

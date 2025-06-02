import React, { useState, useEffect } from 'react';

const UserForm = ({ onUserSaved, selectedUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Pre-fill form if editing
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
      });
    } else {
      setFormData({ name: '', email: '' });
    }
  }, [selectedUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const method = selectedUser ? 'PUT' : 'POST';
      const url = selectedUser
        ? `http://localhost:5000/api/users/${selectedUser._id}`
        : 'http://localhost:5000/api/users';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save user');
      const data = await res.json();

      setMessage(`User ${selectedUser ? 'updated' : 'created'} successfully!`);
      setFormData({ name: '', email: '' });
      onUserSaved(); // refresh list

    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{selectedUser ? 'Edit User' : 'Create User'}</h3>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      /><br />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      /><br />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default UserForm;

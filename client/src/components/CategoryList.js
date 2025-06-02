import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  // Fetch categories on initial load
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  // Delete a category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories(); // Refresh list after delete
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories when component mounts
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category._id} className="border p-2 rounded">
            {category.name}
            <button
              onClick={() => handleDelete(category._id)}
              className="ml-4 text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}



import React, { useState } from 'react';
import axios from 'axios';
import { useData } from './DataProvider';

const CategoryForm = () => {
  const { fetchCategories } = useData();
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/categories', { name });
      setName('');
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Category</h3>
      <input
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default CategoryForm;



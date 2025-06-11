import { Select } from 'antd';
import React from 'react';


const CategoryFilter = ({ categories, onCategoryChange }) => {
  return (
    <Select
      placeholder="Filter by category"
      style={{ width: 200 }}
      allowClear
      onChange={onCategoryChange}
      options={[
        { value: null, label: 'All Categories' },
        ...categories.map(category => ({
          value: category._id, // Using _id to match your MongoDB schema
          label: category.name,
        }))
      ]}
    />
  );
};


export default CategoryFilter;

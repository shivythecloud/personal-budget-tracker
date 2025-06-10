import React from 'react';


export default function CategoryFilter({ value, onChange, categories }) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="category" className="text-sm text-gray-600">
        Category:
      </label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}





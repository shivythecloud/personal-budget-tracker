import React from 'react';
import { useData } from './DataProvider';

export default function CategoryList() {
  const { categories } = useData();

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id} className="border p-2 rounded">
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}


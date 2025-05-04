// Category.js
import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from './categories';
import './Category.css';

const Category = () => {
  return (
    <div className="category-container">
      {categories.map((category) => (
        <div key={category.name} className="category-card">
          {/* Link to category using name as URL parameter */}
          <Link to={`/category/${encodeURIComponent(category.name)}`}>
            <img src={category.image} alt={category.name} className="category-image" />
            <h3>{category.name}</h3>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Category;
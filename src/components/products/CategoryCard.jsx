import React from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../common/CloudinaryImage';
import '../../components/css/CategoryCard.css'; 

function CategoryCard({ category }) {
  const categoryName = category.name;
  const shopUrl = `/shop?category=${encodeURIComponent(categoryName)}`;

  return (
    <Link to={shopUrl} className="category-card-link">
      <div className="category-card">
        <div className="category-image-container">
          {category.image ? (
            <CloudinaryImage
              src={category.image}
              alt={categoryName}
              width={220}
              height={220}
              crop="scale"           // NO cropping - entire image visible
              quality="auto"
              format="auto"
              className="category-image"
              responsive={true}      // Enable responsive images
              mobileWidth={150}      // 150x150 on mobile for 3-column layout
              mobileHeight={150}
            />
          ) : (
            <div className="no-image-placeholder">
              <i className="fas fa-image"></i>
            </div>
          )}
        </div>
        <div className="category-info">
          <h3 className="category-name">{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</h3>
          <span className="category-count">{category.count || 0} items</span>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
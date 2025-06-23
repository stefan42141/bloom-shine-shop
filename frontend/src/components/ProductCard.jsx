import React, { useState } from 'react';
import '../styles/components/ProductCard.css';

const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Изображение товара */}
      <div className="product-image-container">
        <img 
          src={product.images[currentImageIndex]} 
          alt={product.name}
          className="product-image"
        />
        
        {/* Индикаторы изображений */}
        {product.images.length > 1 && (
          <div className="image-indicators">
            {product.images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => handleImageChange(index)}
              />
            ))}
          </div>
        )}

        {/* Бейдж "Новинка" или "Хит" */}
        {product.badge && (
          <div className={`product-badge ${product.badge.type}`}>
            {product.badge.text}
          </div>
        )}

        {/* Overlay с действиями */}
        <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
          <button 
            className="action-btn quick-view-btn"
            onClick={() => onQuickView(product)}
          >
            👁️ Швидкий перегляд
          </button>
          <button 
            className="action-btn add-to-cart-btn"
            onClick={handleAddToCart}
          >
            🛒 Додати в кошик
          </button>
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.shortDescription}</p>
        
        {/* Рейтинг */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`star ${i < product.rating ? 'filled' : ''}`}
              >
                ⭐
              </span>
            ))}
          </div>
          <span className="rating-count">({product.reviewsCount})</span>
        </div>

        {/* Цена */}
        <div className="product-price">
          {product.oldPrice && (
            <span className="old-price">{product.oldPrice} ₴</span>
          )}
          <span className="current-price">{product.price} ₴</span>
        </div>

        {/* Дополнительные опции */}
        <div className="product-options">
          {product.sizes && (
            <div className="size-options">
              {product.sizes.map(size => (
                <button key={size} className="size-btn">{size}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
import React, { useState } from 'react';
import '../styles/components/ProductCard.css';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onQuickView, 
  luxury = false,
  compact = false,
  className = '' 
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Обработка добавления в корзину
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      await onAddToCart(product);
      // Показать анимацию успеха
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      setIsLoading(false);
    }
  };

  // Обработка добавления в избранное
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Здесь будет API запрос для добавления/удаления из избранного
  };

  // Обработка быстрого просмотра
  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  // Генерация звезд рейтинга
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      const filled = index < Math.floor(rating);
      const half = index < rating && index >= Math.floor(rating);
      
      return (
        <span 
          key={index} 
          className={`rating-star ${filled ? 'filled' : ''} ${half ? 'half' : ''}`}
        >
          ⭐
        </span>
      );
    });
  };

  // Получение изображений товара
  const getProductImages = () => {
    if (product.images?.gallery && product.images.gallery.length > 0) {
      return [product.images.main, ...product.images.gallery];
    }
    return [product.images?.main || product.images?.thumbnail || ''];
  };

  const images = getProductImages();
  const hasMultipleImages = images.length > 1;

  // Генерация бейджей
  const renderBadges = () => {
    const badges = [];
    
    if (product.badge) {
      badges.push(
        <span key="main" className={`product-badge ${product.badge.type || 'default'}`}>
          {product.badge.text}
        </span>
      );
    }
    
    if (product.discount && product.discount > 0) {
      badges.push(
        <span key="discount" className="product-badge sale">
          -{product.discount}%
        </span>
      );
    }
    
    if (product.luxury) {
      badges.push(
        <span key="luxury" className="product-badge premium">
          💎 LUXURY
        </span>
      );
    }
    
    return badges;
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('uk-UA').format(price);
  };

  return (
    <article 
      className={`
        product-card 
        ${luxury || product.luxury ? 'premium' : ''} 
        ${compact ? 'compact' : ''}
        ${className}
      `}
      onClick={handleQuickView}
    >
      {/* ИЗОБРАЖЕНИЕ */}
      <div className="product-image-container">
        <img 
          src={images[currentImageIndex]} 
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/2a2a2a/d4af37?text=🌙';
          }}
        />

        {/* Overlay с действиями */}
        <div className="product-image-overlay">
          <button 
            className="quick-view-button"
            onClick={handleQuickView}
            aria-label={`Швидкий перегляд ${product.name}`}
          >
            👁️ Швидкий перегляд
          </button>
        </div>

        {/* Бейджи */}
        <div className="product-badges">
          {renderBadges()}
        </div>

        {/* Кнопка избранного */}
        <button 
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Видалити з улюблених' : 'Додати в улюблені'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        {/* Индикаторы изображений */}
        {hasMultipleImages && (
          <div className="image-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`image-indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                aria-label={`Показати зображення ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* КОНТЕНТ */}
      <div className="product-content">
        {/* Категория */}
        <div className="product-category">
          {product.category}
        </div>

        {/* Название */}
        <h3 className="product-title">
          {product.name}
        </h3>

        {/* Описание */}
        {!compact && (
          <p className="product-description">
            {product.shortDescription}
          </p>
        )}

        {/* Ароматический профиль */}
        {product.aromaticProfile && (
          <div className="aromatic-info">
            {product.aromaticProfile.family && (
              <span className="aromatic-family">
                🌿 {product.aromaticProfile.family}
              </span>
            )}
            
            {product.aromaticProfile.middleNotes && product.aromaticProfile.middleNotes.length > 0 && (
              <div className="aromatic-notes">
                <span className="notes-label">Ноти:</span>
                <div className="notes-tags">
                  {product.aromaticProfile.middleNotes.slice(0, 3).map((note, index) => (
                    <span key={index} className="note-tag">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Рейтинг */}
        <div className="product-rating">
          <div className="rating-stars">
            {renderStars(product.rating?.average || product.rating || 0)}
          </div>
          <span className="rating-value">
            {(product.rating?.average || product.rating || 0).toFixed(1)}
          </span>
          <span className="rating-count">
            ({product.reviewsCount || product.rating?.count || 0})
          </span>
        </div>

        {/* Дополнительная информация */}
        {product.ingredients && (
          <div className="product-features">
            <span className="feature-item">
              <span className="feature-icon">📦</span>
              {product.ingredients.length} предметів
            </span>
            {product.luxury && (
              <span className="feature-item">
                <span className="feature-icon">💎</span>
                Преміум якість
              </span>
            )}
          </div>
        )}

        {/* Цена */}
        <div className="product-price">
          {product.oldPrice && (
            <span className="price-original">
              {formatPrice(product.oldPrice)} ₴
            </span>
          )}
          <span className="price-current">
            {formatPrice(product.price)} ₴
          </span>
          {product.discount && product.discount > 0 && (
            <span className="price-discount">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Варианты */}
        {product.variants && product.variants.length > 0 && (
          <div className="product-variants">
            <span className="variants-label">Варіанти:</span>
            <div className="variants-options">
              {product.variants.slice(0, 4).map((variant, index) => (
                <button
                  key={index}
                  className="variant-option"
                  style={variant.color ? { '--variant-color': variant.color } : {}}
                  title={variant.name}
                >
                  {variant.size || ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="product-actions">
          <button 
            className={`add-to-cart-button ${isLoading ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={isLoading || !product.inStock}
            aria-label={`Додати ${product.name} в кошик`}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Додається...
              </>
            ) : !product.inStock ? (
              <>
                <span>❌</span>
                Немає в наявності
              </>
            ) : (
              <>
                <span>🛒</span>
                Додати в кошик
              </>
            )}
          </button>

          <button 
            className="quick-buy-button"
            onClick={handleQuickView}
            aria-label={`Швидка покупка ${product.name}`}
          >
            ⚡
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
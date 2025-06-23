import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProducts } from '../data/mockProducts';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Product.css';

const Product = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await getProductById(id);
      setProduct(productData);
      
      // Устанавливаем размер по умолчанию
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
      
      // Загружаем похожие товары
      loadRelatedProducts(productData.category);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (category) => {
    try {
      const allProducts = await getProducts();
      const related = allProducts
        .filter(p => p.id !== id && p.category === category)
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (err) {
      console.error('Помилка завантаження схожих товарів:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    
    const cartItem = {
      ...product,
      selectedSize,
      quantity
    };
    
    onAddToCart(cartItem);
    
    // Показываем уведомление
    alert(`${product.name} додано до кошика!`);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`);
  };

  if (isLoading) {
    return (
      <div className="product-page loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-image"></div>
            <div className="loading-details">
              <div className="loading-line"></div>
              <div className="loading-line short"></div>
              <div className="loading-line"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page error">
        <div className="container">
          <div className="error-content">
            <h2>🌸 Товар не знайдено</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/catalog')} className="back-btn">
              ← Повернутися до каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Головна</span>
          <span className="breadcrumb-separator">›</span>
          <span onClick={() => navigate('/catalog')} className="breadcrumb-link">Каталог</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="product-details">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-box.jpg';
                }}
              />
              {product.badge && (
                <div className={`product-badge ${product.badge.type}`}>
                  {product.badge.text}
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleImageChange(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
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
              <span className="rating-text">
                {product.rating} ({product.reviewsCount} відгуків)
              </span>
            </div>

            {/* Price */}
            <div className="product-price">
              {product.oldPrice && (
                <span className="old-price">{product.oldPrice} ₴</span>
              )}
              <span className="current-price">{product.price} ₴</span>
              {product.oldPrice && (
                <span className="discount-percent">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Description */}
            <div className="product-description">
              <p>{product.shortDescription}</p>
              
              {product.fullDescription && (
                <div className="full-description">
                  {showFullDescription ? (
                    <>
                      <p>{product.fullDescription}</p>
                      <button 
                        className="description-toggle"
                        onClick={() => setShowFullDescription(false)}
                      >
                        Згорнути ↑
                      </button>
                    </>
                  ) : (
                    <button 
                      className="description-toggle"
                      onClick={() => setShowFullDescription(true)}
                    >
                      Детальніше ↓
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selection">
                <h4>Розмір:</h4>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-selection">
              <h4>Кількість:</h4>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✅ В наявності' : '❌ Немає в наявності'}
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? '🛒 Додати в кошик' : '❌ Немає в наявності'}
              </button>
              
              <button className="buy-now-btn">
                ⚡ Купити зараз
              </button>
              
              <button className="favorite-btn">
                🤍 В улюблені
              </button>
            </div>

            {/* Features */}
            <div className="product-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <span>Безкоштовна доставка від 1000 ₴</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Гарантія свіжості</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💳</span>
                <span>Оплата при отриманні</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📞</span>
                <span>Підтримка 24/7</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h4>Теги:</h4>
                <div className="tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2 className="section-title">🌺 Схожі товари</h2>
            <div className="products-grid">
              {relatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={onAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Product;
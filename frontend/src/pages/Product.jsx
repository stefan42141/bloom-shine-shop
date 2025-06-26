import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/pages/Product.css';

const Product = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Премиальные размеры
  const luxurySizes = [
    { id: 'small', name: 'Міні', description: 'Елегантна мініатюра', price: 0, icon: '🌸' },
    { id: 'medium', name: 'Стандарт', description: 'Класичний розмір', price: 0, icon: '🌺' },
    { id: 'large', name: 'Преміум', description: 'Розкішна композиція', price: 1000, icon: '👑' },
    { id: 'xl', name: 'Люкс', description: 'Грандіозна розкіш', price: 2500, icon: '💎' }
  ];

  // Мок данные товара
  const getProductById = async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: productId,
      name: 'Midnight Embrace Luxury Box',
      category: 'Преміальні бокси',
      shortDescription: 'Преміальний бокс для створення містичної атмосфери з чорними трояндами та золотими акцентами',
      fullDescription: `Ексклюзивна колекція "Midnight Embrace" створена для тих, хто цінує справжню розкіш та витонченість. 
      
      Кожен бокс майстерно виготовлений вручну з найякісніших матеріалів та оздоблений золотими акцентами. Чорні троянди преміум-класу доповнені рідкісними квітами та кристалами Swarovski.
      
      Ця композиція ідеально підходить для особливих моментів та створення незабутньої атмосфери романтики та таємничості.`,
      
      price: 4299,
      oldPrice: 4999,
      
      images: [
        'https://via.placeholder.com/800x800/2a2a2a/d4af37?text=🌸+Main',
        'https://via.placeholder.com/800x800/1a1a1a/d4af37?text=🌹+Detail+1',
        'https://via.placeholder.com/800x800/0f0f0f/d4af37?text=💎+Detail+2',
        'https://via.placeholder.com/800x800/2d2d2d/d4af37?text=✨+Detail+3',
        'https://via.placeholder.com/800x800/1e1e1e/d4af37?text=👑+Detail+4'
      ],
      
      rating: 4.9,
      reviewsCount: 127,
      inStock: true,
      stockQuantity: 8,
      
      badge: { type: 'premium', text: 'Limited Edition' },
      luxury: true,
      
      features: [
        { icon: '🌹', title: 'Преміальні троянди', description: 'Рідкісні чорні троянди з еквадорських плантацій' },
        { icon: '💎', title: 'Кристали Swarovski', description: 'Справжні австрійські кристали ручної роботи' },
        { icon: '🎨', title: 'Авторський дизайн', description: 'Ексклюзивна композиція від топ-флористів' },
        { icon: '📦', title: 'Преміум упаковка', description: 'Розкішна подарункова упаковка з золотим тисненням' },
        { icon: '🚚', title: 'VIP доставка', description: 'Експрес-доставка з холодильним транспортом' },
        { icon: '🎯', title: 'Гарантія свіжості', description: '7 днів гарантії збереження первинного вигляду' }
      ],
      
      specifications: [
        { label: 'Розмір боксу', value: '30 x 30 x 15 см' },
        { label: 'Матеріал', value: 'Натуральна шкіра преміум-класу' },
        { label: 'Кількість квітів', value: '25-30 троянд' },
        { label: 'Країна походження', value: 'Еквадор' },
        { label: 'Термін свіжості', value: '7-10 днів' },
        { label: 'Вага', value: '2.5 кг' }
      ],
      
      careInstructions: [
        '💧 Обережно розпилюйте воду на пелюстки раз на день',
        '🌡️ Зберігайте при температурі 18-22°C',
        '☀️ Уникайте прямих сонячних променів',
        '🌬️ Тримайте подалі від кондиціонерів та обігрівачів',
        '✂️ Обрізайте стебла під кутом кожні 2-3 дні',
        '🧹 Видаляйте зів\'ялі пелюстки для подовження свіжості'
      ],
      
      reviews: [
        {
          id: 1,
          name: 'Анна К.',
          rating: 5,
          date: '2024-01-15',
          comment: 'Неймовірно красиво! Якість на найвищому рівні. Дуже задоволена покупкою.',
          verified: true
        },
        {
          id: 2,
          name: 'Михайло П.',
          rating: 5,
          date: '2024-01-10',
          comment: 'Подарував дружині на річницю - вона в захваті! Рекомендую всім.',
          verified: true
        },
        {
          id: 3,
          name: 'Олена В.',
          rating: 4,
          date: '2024-01-05',
          comment: 'Красива композиція, але ціна трохи висока. В цілому задоволена.',
          verified: false
        }
      ]
    };
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        setSelectedSize(luxurySizes[1].id); // По умолчанию средний размер
      } catch (error) {
        console.error('Помилка завантаження товару:', error);
        navigate('/catalog');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Будь ласка, оберіть розмір');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const selectedSizeInfo = luxurySizes.find(size => size.id === selectedSize);
      const finalPrice = product.price + selectedSizeInfo.price;
      
      const cartItem = {
        ...product,
        selectedSize: selectedSize,
        quantity: quantity,
        finalPrice: finalPrice
      };
      
      onAddToCart(cartItem);
    } catch (error) {
      console.error('Помилка додавання до кошика:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getCurrentPrice = () => {
    if (!product || !selectedSize) return product?.price || 0;
    
    const selectedSizeInfo = luxurySizes.find(size => size.id === selectedSize);
    return product.price + (selectedSizeInfo?.price || 0);
  };

  if (isLoading) {
    return (
      <div className="product-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner luxury-spinner">
              <div className="spinner-icon">🌸</div>
            </div>
            <h2>Завантаження розкоші...</h2>
            <p>Підготовуємо ексклюзивні деталі для вас</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <div className="not-found-content">
            <div className="not-found-icon">🌸</div>
            <h2>Товар не знайдено</h2>
            <p>Вибачте, але цей товар більше не доступний</p>
            <button 
              className="luxury-button"
              onClick={() => navigate('/catalog')}
            >
              🏠 Повернутися до каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* Breadcrumbs */}
      <section className="breadcrumbs-section">
        <div className="container">
          <nav className="breadcrumbs">
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              🏠 Головна
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={() => navigate('/catalog')} className="breadcrumb-link">
              📖 Каталог
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="product-main">
        <div className="container">
          <div className="product-grid">
            {/* Product Gallery */}
            <div className="product-gallery">
              <div className="main-image-container">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="main-image"
                />
                <div className="image-overlay">
                  <div className="luxury-badge-overlay">
                    <span className="badge-icon">👑</span>
                    {product.badge.text}
                  </div>
                </div>
              </div>
              
              <div className="thumbnail-gallery">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <div className="product-category">{product.category}</div>
                <h1 className="product-title">{product.name}</h1>
                <p className="product-description">{product.shortDescription}</p>
                
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {product.rating} ({product.reviewsCount} відгуків)
                  </span>
                </div>
              </div>

              <div className="product-pricing">
                {product.oldPrice && (
                  <span className="old-price">{product.oldPrice} ₴</span>
                )}
                <span className="current-price">{getCurrentPrice()} ₴</span>
                {product.oldPrice && (
                  <span className="discount">
                    Знижка {Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Size Selection */}
              <div className="size-selection">
                <h3 className="selection-title">
                  <span className="title-icon">📏</span>
                  Оберіть розмір
                </h3>
                <div className="size-options">
                  {luxurySizes.map(size => (
                    <label 
                      key={size.id}
                      className={`size-option ${selectedSize === size.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={selectedSize === size.id}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <div className="size-content">
                        <span className="size-icon">{size.icon}</span>
                        <div className="size-details">
                          <span className="size-name">{size.name}</span>
                          <span className="size-description">{size.description}</span>
                          {size.price > 0 && (
                            <span className="size-price">+{size.price} ₴</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label className="quantity-label">Кількість:</label>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="purchase-actions">
                  <button 
                    className={`add-to-cart-btn luxury-button ${isAddingToCart ? 'loading' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !product.inStock}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="loading-spinner">⏳</span>
                        Додаємо...
                      </>
                    ) : (
                      <>
                        <span className="cart-icon">🛒</span>
                        Додати до кошика
                      </>
                    )}
                  </button>
                  
                  <button className="buy-now-btn luxury-button-outline">
                    <span className="lightning-icon">⚡</span>
                    Купити зараз
                  </button>
                </div>

                <div className="stock-info">
                  {product.inStock ? (
                    <span className="in-stock">
                      ✅ В наявності ({product.stockQuantity} шт.)
                    </span>
                  ) : (
                    <span className="out-of-stock">
                      ❌ Немає в наявності
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="product-features">
                <h3 className="features-title">
                  <span className="title-icon">✨</span>
                  Переваги
                </h3>
                <div className="features-grid">
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">{feature.icon}</span>
                      <div className="feature-content">
                        <span className="feature-title">{feature.title}</span>
                        <span className="feature-description">{feature.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="product-details">
        <div className="container">
          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                📝 Опис
              </button>
              <button 
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                📊 Характеристики
              </button>
              <button 
                className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
              >
                🌿 Догляд
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                ⭐ Відгуки ({product.reviewsCount})
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'description' && (
                <div className="tab-content description-tab">
                  <h3>Детальний опис</h3>
                  <div className="description-content">
                    {product.fullDescription.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-content specifications-tab">
                  <h3>Технічні характеристики</h3>
                  <div className="specifications-grid">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="spec-item">
                        <span className="spec-label">{spec.label}:</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="tab-content care-tab">
                  <h3>Інструкції з догляду</h3>
                  <div className="care-instructions">
                    {product.careInstructions.map((instruction, index) => (
                      <div key={index} className="care-item">
                        {instruction}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-content reviews-tab">
                  <h3>Відгуки покупців</h3>
                  <div className="reviews-container">
                    {product.reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.name}</span>
                            {review.verified && (
                              <span className="verified-badge">✅ Підтверджена покупка</span>
                            )}
                          </div>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                        <div className="review-date">
                          {new Date(review.date).toLocaleDateString('uk-UA')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;
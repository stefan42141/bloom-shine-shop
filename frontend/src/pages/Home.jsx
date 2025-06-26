import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import apiService from '../services/api';
import '../styles/pages/Home.css';

const Home = ({ onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiError, setApiError] = useState(false);

  // ========== ПОЛУЧЕНИЕ ДАННЫХ ИЗ РЕАЛЬНОГО API ==========
  const getFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      setApiError(false);
      console.log('🚀 Запрос данных из API...');
      
      // Реальный запрос к API
      const products = await apiService.getFeaturedProducts();
      
      console.log('✅ Получены продукты от API:', products);
      setFeaturedProducts(products);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки товаров:', error);
      setApiError(true);
      setFeaturedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFeaturedProducts();
  }, []);

  // ========== АВТОСЛАЙДЕР ДЛЯ HERO (ИСПОЛЬЗУЕМ ПРОДУКТЫ ИЗ API) ==========
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredProducts.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleQuickView = (product) => {
    console.log('Швидкий перегляд:', product);
  };

  // ========== ПРЕОБРАЗОВАНИЕ ПРОДУКТА В HERO СЛАЙД ==========
  const productToHeroSlide = (product) => ({
    id: product._id,
    title: product.name,
    subtitle: product.luxury ? 'EXCLUSIVE PREMIUM COLLECTION' : 'SIGNATURE AROMATHERAPY',
    description: product.shortDescription,
    price: `${product.price.toLocaleString()} ₴`,
    oldPrice: product.oldPrice ? `${product.oldPrice.toLocaleString()} ₴` : null,
    discount: product.discount ? `${product.discount}%` : null,
    cta: '✨ ЗАМОВИТИ ЗАРАЗ',
    ctaSecondary: product.luxury ? '💎 ПЕРСОНАЛІЗУВАТИ' : '🎨 ДЕТАЛЬНІШЕ',
    image: product.images?.main || 'https://via.placeholder.com/800x600/2a2a2a/d4af37?text=🌙',
    badge: product.badge?.text || (product.luxury ? 'LUXURY EDITION' : 'PREMIUM QUALITY'),
    luxury: product.luxury,
    aromaticNotes: product.aromaticProfile?.middleNotes || [],
    ingredients: product.ingredients || [],
    topNotes: product.aromaticProfile?.topNotes || [],
    baseNotes: product.aromaticProfile?.baseNotes || [],
    mood: product.aromaticProfile?.mood || '',
    family: product.aromaticProfile?.family || ''
  });

  return (
    <div className="home-page">
      {/* ========== HERO SECTION С ДАННЫМИ ИЗ API ========== */}
      <section className="hero-section">
        <div className="floating-elements">
          <div className="floating-flower">🌙</div>
          <div className="floating-star">✨</div>
          <div className="floating-diamond">💎</div>
        </div>

        {isLoading ? (
          // Loading состояние для Hero
          <div className="hero-loading">
            <div className="hero-loading-content">
              <div className="loading-spinner">
                <div className="spinner-moon">🌙</div>
              </div>
              <h2>Завантаження ексклюзивних боксів...</h2>
              <p>Підготовуємо для вас найкращі ароматичні композиції</p>
            </div>
          </div>
        ) : apiError ? (
          // Ошибка API
          <div className="hero-error">
            <div className="hero-error-content">
              <div className="error-icon">🌙</div>
              <h2>BloomShine - Ексклюзивні ароматичні бокси</h2>
              <p>Тимчасово недоступно з'єднання з сервером</p>
              <button 
                className="retry-button luxury-button"
                onClick={getFeaturedProducts}
              >
                🔄 Спробувати знову
              </button>
            </div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="hero-slider">
            {featuredProducts.map((product, index) => {
              const heroSlide = productToHeroSlide(product);
              
              return (
                <div 
                  key={heroSlide.id}
                  className={`hero-slide ${index === currentSlide ? 'active' : ''} ${heroSlide.luxury ? 'luxury' : ''}`}
                >
                  <div className="hero-background">
                    <img src={heroSlide.image} alt={heroSlide.title} />
                    <div className="hero-overlay"></div>
                    <div className="luxury-pattern"></div>
                  </div>
                  
                  <div className="container">
                    <div className="hero-content">
                      <div className="hero-text">
                        {heroSlide.badge && (
                          <div className="luxury-badge">
                            <span className="badge-icon">🌙</span>
                            {heroSlide.badge}
                          </div>
                        )}
                        
                        <h1 className="hero-title">{heroSlide.title}</h1>
                        <p className="hero-subtitle">{heroSlide.subtitle}</p>
                        <p className="hero-description">{heroSlide.description}</p>
                        
                        {/* Ароматический профиль */}
                        {heroSlide.family && (
                          <div className="aromatic-family">
                            <span className="family-label">Ароматична сім'я:</span>
                            <span className="family-value">{heroSlide.family}</span>
                          </div>
                        )}
                        
                        {/* Ароматические ноты из базы */}
                        {heroSlide.aromaticNotes.length > 0 && (
                          <div className="aromatic-notes">
                            <span className="notes-label">Основні ноти:</span>
                            <div className="notes-list">
                              {heroSlide.aromaticNotes.map((note, noteIndex) => (
                                <span key={noteIndex} className="note-tag">{note}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Настроение аромата */}
                        {heroSlide.mood && (
                          <div className="aromatic-mood">
                            <span className="mood-icon">✨</span>
                            <span className="mood-text">{heroSlide.mood}</span>
                          </div>
                        )}
                        
                        <div className="hero-price">
                          {heroSlide.oldPrice && (
                            <>
                              <span className="old-price">{heroSlide.oldPrice}</span>
                              {heroSlide.discount && (
                                <span className="discount-badge">-{heroSlide.discount}</span>
                              )}
                            </>
                          )}
                          <span className="current-price">{heroSlide.price}</span>
                        </div>

                        {/* Состав из базы */}
                        {heroSlide.ingredients.length > 0 && (
                          <div className="box-info">
                            <span className="info-item">
                              <span className="info-icon">📦</span>
                              {heroSlide.ingredients.length} унікальних предметів
                            </span>
                            <span className="info-item">
                              <span className="info-icon">🎨</span>
                              Авторське оформлення
                            </span>
                          </div>
                        )}
                        
                        <div className="hero-actions">
                          <button 
                            className="cta-primary luxury-button"
                            onClick={() => onAddToCart(product)}
                          >
                            {heroSlide.cta}
                          </button>
                          <button 
                            className="cta-secondary luxury-button-outline"
                            onClick={() => handleQuickView(product)}
                          >
                            {heroSlide.ctaSecondary}
                          </button>
                        </div>

                        {/* Luxury Features */}
                        <div className="luxury-features">
                          <div className="feature">
                            <span className="feature-icon">🚚</span>
                            <span>Безкоштовна доставка</span>
                          </div>
                          <div className="feature">
                            <span className="feature-icon">💎</span>
                            <span>Преміальна упаковка</span>
                          </div>
                          <div className="feature">
                            <span className="feature-icon">🎯</span>
                            <span>Гарантія якості</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hero-product">
                        <div className="product-showcase luxury-showcase">
                          <img src={heroSlide.image} alt={heroSlide.title} />
                          <div className="showcase-glow"></div>
                          
                          {/* Детали продукта */}
                          <div className="product-details-overlay">
                            {heroSlide.topNotes.length > 0 && (
                              <div className="notes-preview">
                                <div className="notes-section">
                                  <span className="notes-title">Верхні ноти:</span>
                                  <span className="notes-content">{heroSlide.topNotes.join(', ')}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback если нет продуктов
          <div className="hero-fallback">
            <div className="container">
              <div className="fallback-content">
                <h1>🌙 BloomShine</h1>
                <h2>Ексклюзивні ароматичні бокси</h2>
                <p>Найкращі ароматичні композиції для створення унікальної атмосфери</p>
                <button 
                  className="retry-button luxury-button"
                  onClick={getFeaturedProducts}
                >
                  🔄 Завантажити продукти
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Индикаторы слайдов - только если есть продукты */}
        {featuredProducts.length > 1 && (
          <div className="hero-indicators">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleSlideChange(index)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========== ПРЕМИАЛЬНЫЕ FEATURES ========== */}
      <section className="features-section luxury-features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title luxury-title">
              <span className="title-icon">🌙</span>
              Чому обирають BloomShine
            </h2>
            <p className="section-subtitle">Преміальні ароматичні бокси найвищої якості</p>
          </div>

          <div className="features-grid luxury-grid">
            <div className="feature-card luxury-card">
              <div className="feature-icon luxury-icon">🌟</div>
              <h3>Унікальні композиції</h3>
              <p>Ексклюзивні ароматичні суміші від провідних парфумерів світу. Кожен аромат створений вручну.</p>
              <div className="card-glow"></div>
            </div>
            
            <div className="feature-card luxury-card">
              <div className="feature-icon luxury-icon">🚁</div>
              <h3>Експрес доставка</h3>
              <p>Швидка доставка по Україні за 1-2 дні. Спеціальна упаковка для збереження ароматів.</p>
              <div className="card-glow"></div>
            </div>
            
            <div className="feature-card luxury-card">
              <div className="feature-icon luxury-icon">🎨</div>
              <h3>Авторське оформлення</h3>
              <p>Кожен бокс - унікальний витвір мистецтва з преміальними матеріалами та елегантним дизайном.</p>
              <div className="card-glow"></div>
            </div>
            
            <div className="feature-card luxury-card">
              <div className="feature-icon luxury-icon">💎</div>
              <h3>Премиум сервіс</h3>
              <p>Персональні рекомендації, ексклюзивні пропозиції та кваліфікована підтримка клієнтів.</p>
              <div className="card-glow"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
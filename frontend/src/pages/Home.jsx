import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Home.css';

const Home = ({ onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0); // ✅ Добавляем состояние

  // ========== ДОБАВЛЯЕМ ДАННЫЕ ГЕРОЯ ==========
  const heroSlides = [
    {
      id: 1,
      title: 'Midnight Embrace',
      subtitle: 'Преміальна колекція',
      description: 'Темна естетика зустрічається з розкішшю у цій колекції',
      price: '4 299 ₴',
      oldPrice: '4 999 ₴',
      cta: 'ЗАМОВИТИ ЗАРАЗ',
      image: 'https://via.placeholder.com/800x600/2a2a2a/d4af37?text=🌸+Midnight'
    },
    {
      id: 2,
      title: 'Golden Dreams',
      subtitle: 'Золота колекція',
      description: 'Втілення розкоші та витонченості в кожній деталі',
      price: '5 299 ₴',
      oldPrice: null,
      cta: 'ВІДКРИТИ МРІЮ',
      image: 'https://via.placeholder.com/800x600/d4af37/000?text=✨+Golden'
    },
    {
      id: 3,
      title: 'Spring Symphony',
      subtitle: 'Весняна колекція',
      description: 'Свіжість та ніжність весняних квітів у преміальному оформленні',
      price: '2 999 ₴',
      oldPrice: '3 499 ₴',
      cta: 'ЗАМОВИТИ ВЕСНУ',
      image: 'https://via.placeholder.com/800x600/90EE90/000?text=🌷+Spring'
    }
  ];

  // ========== ФУНКЦІЯ getFeaturedProducts ==========
  const getFeaturedProducts = async () => {
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: '1',
        name: 'Midnight Embrace Box',
        category: 'Преміальні бокси',
        shortDescription: 'Преміальний бокс для створення містичної атмосфери',
        price: 4299,
        oldPrice: 4999,
        images: ['https://via.placeholder.com/400x400/2a2a2a/d4af37?text=🌸'],
        rating: 4.8,
        reviewsCount: 127,
        inStock: true,
        featured: true,
        badge: { type: 'premium', text: 'Premium' }
      },
      {
        id: '2',
        name: 'Golden Dreams Premium',
        category: 'Преміальні бокси',
        shortDescription: 'Золотий преміум бокс з білими орхідеями',
        price: 5299,
        images: ['https://via.placeholder.com/400x400/d4af37/000?text=✨'],
        rating: 4.9,
        reviewsCount: 89,
        inStock: true,
        featured: true,
        badge: { type: 'new', text: 'Новинка' }
      },
      {
        id: '3',
        name: 'Spring Symphony',
        category: 'Сезонні бокси',
        shortDescription: 'Весняна колекція з тюльпанами',
        price: 2999,
        oldPrice: 3499,
        images: ['https://via.placeholder.com/400x400/90EE90/000?text=🌷'],
        rating: 4.6,
        reviewsCount: 203,
        inStock: true,
        featured: true,
        badge: { type: 'sale', text: '-15%' }
      },
      {
        id: '4',
        name: 'Royal Roses',
        category: 'Класичні бокси',
        shortDescription: 'Королівські троянди в елегантному боксі',
        price: 3799,
        images: ['https://via.placeholder.com/400x400/8B0000/FFD700?text=🌹'],
        rating: 4.7,
        reviewsCount: 156,
        inStock: true,
        featured: true,
        badge: { type: 'bestseller', text: 'Хіт продажів' }
      }
    ];
  };

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Помилка завантаження товарів:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedProducts();
  }, []);

  // ========== АВТОМАТИЧЕСКАЯ СМЕНА СЛАЙДОВ ==========
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000); // Меняем слайд каждые 5 секунд

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleQuickView = (product) => {
    // TODO: Відкрити модалку швидкого перегляду
    console.log('Швидкий перегляд:', product);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="hero-background">
                <img src={slide.image} alt={slide.title} />
                <div className="hero-overlay"></div>
              </div>
              
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                    <p className="hero-description">{slide.description}</p>
                    
                    <div className="hero-price">
                      {slide.oldPrice && (
                        <span className="old-price">{slide.oldPrice}</span>
                      )}
                      <span className="current-price">{slide.price}</span>
                    </div>
                    
                    <div className="hero-actions">
                      <button className="cta-primary">
                        🌺 {slide.cta}
                      </button>
                      <button className="cta-secondary">
                        ✨ СТВОРИТИ ВЛАСНИЙ НАБІР
                      </button>
                    </div>
                  </div>
                  
                  <div className="hero-product">
                    <div className="product-showcase">
                      <img src={slide.image} alt={slide.title} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slide Indicators */}
        <div className="hero-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleSlideChange(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Преміальна якість</h3>
              <p>Тільки найкращі квіти від перевірених постачальників</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Швидка доставка</h3>
              <p>Доставка по Києву за 2 години, по Україні - наступний день</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Унікальний дизайн</h3>
              <p>Кожен бокс створюється вручну нашими флористами</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Індивідуальний підхід</h3>
              <p>Створюємо бокси за вашими побажаннями та емоціями</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🌸 Рекомендовані колекції</h2>
            <p className="section-subtitle">
              Преміальні квіткові бокси для створення особливих моментів
            </p>
          </div>
          
          {isLoading ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="loading-card">
                  <div className="loading-image"></div>
                  <div className="loading-content">
                    <div className="loading-line"></div>
                    <div className="loading-line short"></div>
                    <div className="loading-line"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Collections Section */}
      <section className="collections-section">
        <div className="container">
          <h2 className="section-title">🌺 Наші колекції</h2>
          
          <div className="collections-grid">
            <div className="collection-card large">
              <div className="collection-image">
                <img src="https://via.placeholder.com/600x400/d4af37/000?text=Premium" alt="Premium Collection" />
                <div className="collection-overlay">
                  <div className="collection-content">
                    <h3>Premium Collection</h3>
                    <p>Найрозкішніші бокси для особливих моментів</p>
                    <button className="collection-btn">Переглянути</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="collection-card">
              <div className="collection-image">
                <img src="https://via.placeholder.com/400x300/90EE90/000?text=Seasonal" alt="Seasonal Collection" />
                <div className="collection-overlay">
                  <div className="collection-content">
                    <h3>Сезонні бокси</h3>
                    <p>Квіти сезону в стильному оформленні</p>
                    <button className="collection-btn">Переглянути</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="collection-card">
              <div className="collection-image">
                <img src="https://via.placeholder.com/400x300/FFB6C1/000?text=Aromatic" alt="Aromatic Collection" />
                <div className="collection-overlay">
                  <div className="collection-content">
                    <h3>Ароматичні бокси</h3>
                    <p>Квіти з неповторним ароматом</p>
                    <button className="collection-btn">Переглянути</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts } from '../data/mockProducts';
import '../styles/pages/Home.css';

const Home = ({ onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

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

  const heroSlides = [
    {
      id: 1,
      title: 'Midnight Embrace Box',
      subtitle: 'Преміальний бокс для створення містичної атмосфери',
      description: 'Темна естетика зустрічається з розкішшю у цій колекції, створеній для тих, хто цінує глибину і таємничість.',
      price: '4299 ₴',
      oldPrice: '4999 ₴',
      image: '/images/hero-midnight.jpg',
      cta: 'ПЕРЕГЛЯНУТИ КАТАЛОГ'
    },
    {
      id: 2,
      title: 'Golden Dreams Premium',
      subtitle: 'Золотий преміум бокс з білими орхідеями',
      description: 'Втілення розкоші та витонченості. Білі орхідеї в поєднанні з золотими деталями створюють атмосферу неземної краси.',
      price: '5299 ₴',
      oldPrice: null,
      image: '/images/hero-golden.jpg',
      cta: 'СТВОРИТИ ВЛАСНИЙ НАБІР'
    }
  ];

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
                <img src="/images/collection-premium.jpg" alt="Premium Collection" />
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
                <img src="/images/collection-seasonal.jpg" alt="Seasonal Collection" />
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
                <img src="/images/collection-aromatic.jpg" alt="Aromatic Collection" />
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
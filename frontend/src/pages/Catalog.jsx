import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Catalog.css';

const Catalog = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'featured'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Премиальные категории
  const categories = [
    { id: 'all', name: 'Всі колекції', icon: '🌟' },
    { id: 'premium', name: 'Преміум', icon: '👑' },
    { id: 'luxury', name: 'Люкс', icon: '💎' },
    { id: 'seasonal', name: 'Сезонні', icon: '🌸' },
    { id: 'custom', name: 'На замовлення', icon: '🎨' }
  ];

  const priceRanges = [
    { id: 'all', name: 'Всі ціни', min: 0, max: Infinity },
    { id: 'budget', name: 'До 2000 ₴', min: 0, max: 2000 },
    { id: 'medium', name: '2000 - 5000 ₴', min: 2000, max: 5000 },
    { id: 'premium', name: '5000 - 10000 ₴', min: 5000, max: 10000 },
    { id: 'luxury', name: 'Від 10000 ₴', min: 10000, max: Infinity }
  ];

  const sortOptions = [
    { id: 'featured', name: 'Рекомендовані' },
    { id: 'price-asc', name: 'Ціна: за зростанням' },
    { id: 'price-desc', name: 'Ціна: за спаданням' },
    { id: 'name', name: 'За назвою' },
    { id: 'rating', name: 'За рейтингом' }
  ];

  // Мок данные товаров
  const getAllProducts = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        name: 'Midnight Embrace Luxury Box',
        category: 'premium',
        shortDescription: 'Преміальний бокс для створення містичної атмосфери',
        price: 4299,
        oldPrice: 4999,
        images: ['https://via.placeholder.com/400x400/2a2a2a/d4af37?text=🌸'],
        rating: 4.9,
        reviewsCount: 127,
        inStock: true,
        badge: { type: 'premium', text: 'Limited Edition' },
        luxury: true
      },
      {
        id: '2',
        name: 'Golden Dreams Couture',
        category: 'luxury',
        shortDescription: 'Золотий преміум бокс з білими орхідеями',
        price: 5299,
        images: ['https://via.placeholder.com/400x400/d4af37/000?text=✨'],
        rating: 5.0,
        reviewsCount: 89,
        inStock: true,
        badge: { type: 'exclusive', text: 'Haute Couture' },
        luxury: true
      },
      {
        id: '3',
        name: 'Spring Symphony Deluxe',
        category: 'seasonal',
        shortDescription: 'Весняна колекція з рідкісними тюльпанами',
        price: 2999,
        oldPrice: 3499,
        images: ['https://via.placeholder.com/400x400/90EE90/000?text=🌷'],
        rating: 4.8,
        reviewsCount: 203,
        inStock: true,
        badge: { type: 'seasonal', text: 'Seasonal Drop' },
        luxury: false
      },
      {
        id: '4',
        name: 'Royal Roses Platinum',
        category: 'luxury',
        shortDescription: 'Королівські троянди в платиновому боксі',
        price: 6799,
        images: ['https://via.placeholder.com/400x400/8B0000/FFD700?text=🌹'],
        rating: 4.9,
        reviewsCount: 156,
        inStock: true,
        badge: { type: 'platinum', text: 'Platinum Series' },
        luxury: true
      },
      {
        id: '5',
        name: 'Crystal Garden Premium',
        category: 'premium',
        shortDescription: 'Кришталевий сад з рідкісними квітами',
        price: 3799,
        images: ['https://via.placeholder.com/400x400/E6E6FA/000?text=💎'],
        rating: 4.7,
        reviewsCount: 94,
        inStock: true,
        badge: { type: 'new', text: 'New Arrival' },
        luxury: false
      },
      {
        id: '6',
        name: 'Velvet Dreams Collection',
        category: 'custom',
        shortDescription: 'Оксамитова колекція на індивідуальне замовлення',
        price: 8499,
        images: ['https://via.placeholder.com/400x400/800080/FFD700?text=🌺'],
        rating: 4.9,
        reviewsCount: 67,
        inStock: true,
        badge: { type: 'custom', text: 'Made to Order' },
        luxury: true
      }
    ];
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Помилка завантаження товарів:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    // Фильтр по категории
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }

    // Фильтр по цене
    const priceRange = priceRanges.find(range => range.id === filters.priceRange);
    if (priceRange && (product.price < priceRange.min || product.price > priceRange.max)) {
      return false;
    }

    // Поиск
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Сортировка товаров
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: 'all',
      sortBy: 'featured'
    });
    setSearchQuery('');
  };

  return (
    <div className="catalog-page">
      {/* Премиальный хедер каталога */}
      <section className="catalog-hero">
        <div className="floating-elements">
          <div className="floating-flower">🌸</div>
          <div className="floating-star">✨</div>
          <div className="floating-diamond">💎</div>
        </div>
        
        <div className="container">
          <div className="catalog-hero-content">
            <div className="luxury-badge">
              <span className="badge-icon">👑</span>
              EXCLUSIVE COLLECTIONS
            </div>
            <h1 className="catalog-title">Каталог преміальних квітів</h1>
            <p className="catalog-subtitle">
              Відкрийте світ розкоші та витонченості у нашій ексклюзивній колекції
            </p>
            
            {/* Премиальная статистика */}
            <div className="catalog-stats">
              <div className="stat-item">
                <span className="stat-number">{products.length}+</span>
                <span className="stat-label">Ексклюзивних товарів</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">Середній рейтинг</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Преміум підтримка</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Фильтры и поиск */}
      <section className="catalog-filters">
        <div className="container">
          <div className="filters-container">
            {/* Поиск */}
            <div className="search-section">
              <div className="luxury-search">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Пошук преміальних квітів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn luxury-button">
                  Знайти
                </button>
              </div>
            </div>

            {/* Фильтры */}
            <div className="filters-section">
              {/* Категории */}
              <div className="filter-group">
                <h3 className="filter-title">
                  <span className="filter-icon">🎯</span>
                  Категорії
                </h3>
                <div className="filter-options category-filters">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`filter-btn ${filters.category === category.id ? 'active' : ''}`}
                      onClick={() => handleFilterChange('category', category.id)}
                    >
                      <span className="filter-emoji">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ценовые диапазоны */}
              <div className="filter-group">
                <h3 className="filter-title">
                  <span className="filter-icon">💰</span>
                  Ціновий діапазон
                </h3>
                <div className="filter-options price-filters">
                  {priceRanges.map(range => (
                    <button
                      key={range.id}
                      className={`filter-btn ${filters.priceRange === range.id ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priceRange', range.id)}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Сортировка */}
              <div className="filter-group">
                <h3 className="filter-title">
                  <span className="filter-icon">📊</span>
                  Сортування
                </h3>
                <div className="filter-options sort-options">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="sort-select luxury-select"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Очистить фильтры */}
              <button className="clear-filters-btn" onClick={clearFilters}>
                <span>🗑️</span>
                Очистити фільтри
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Результаты */}
      <section className="catalog-results">
        <div className="container">
          <div className="results-header">
            <h2 className="results-title">
              {searchQuery ? `Результати пошуку: "${searchQuery}"` : 'Наші колекції'}
            </h2>
            <div className="results-count">
              Знайдено <span className="count-number">{sortedProducts.length}</span> товарів
            </div>
          </div>

          {isLoading ? (
            <div className="loading-grid luxury-loading">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="loading-card luxury-loading-card">
                  <div className="loading-image luxury-loading-image"></div>
                  <div className="loading-content">
                    <div className="loading-line luxury-loading-line"></div>
                    <div className="loading-line luxury-loading-line short"></div>
                    <div className="loading-line luxury-loading-line"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="products-grid luxury-products-grid">
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  luxury={product.luxury}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🌸</div>
              <h3>Товари не знайдені</h3>
              <p>Спробуйте змінити параметри пошуку або фільтри</p>
              <button className="luxury-button" onClick={clearFilters}>
                Показати всі товари
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Catalog;
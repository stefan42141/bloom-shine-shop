import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Catalog.css';

const Catalog = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 10000],
    inStock: false,
    sortBy: 'featured'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // ========== ДОБАВЛЯЕМ ФУНКЦИЮ getProducts ==========
  const getProducts = async () => {
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
        badge: { type: 'premium', text: 'Premium' },
        tags: ['темна естетика', 'розкіш', 'преміум']
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
        badge: { type: 'new', text: 'Новинка' },
        tags: ['золото', 'орхідеї', 'розкіш']
      },
      {
        id: '3',
        name: 'Spring Symphony',
        category: 'Сезонні бокси',
        shortDescription: 'Весняна колекція з тюльпанами',
        price: 2299,
        images: ['https://via.placeholder.com/400x400/90EE90/000?text=🌷'],
        rating: 4.6,
        reviewsCount: 203,
        inStock: true,
        featured: false,
        badge: { type: 'sale', text: '-20%' },
        tags: ['весна', 'тюльпани', 'свіжість']
      }
    ];
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Помилка завантаження товарів:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Фільтр за категорією
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Фільтр за ціною
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Фільтр за наявністю
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Сортування
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePriceRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 10000],
      inStock: false,
      sortBy: 'featured'
    });
    setSearchQuery('');
  };

  const handleQuickView = (product) => {
    // TODO: Відкрити модалку швидкого перегляду
    console.log('Швидкий перегляд:', product);
  };

  const categories = [
    { value: 'all', label: 'Всі категорії' },
    { value: 'преміальні', label: 'Преміальні бокси' },
    { value: 'ароматичні', label: 'Ароматичні бокси' },
    { value: 'сезонні', label: 'Сезонні бокси' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Рекомендовані' },
    { value: 'price-low', label: 'Ціна: від дешевих' },
    { value: 'price-high', label: 'Ціна: від дорогих' },
    { value: 'name', label: 'За назвою' },
    { value: 'rating', label: 'За рейтингом' }
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <div className="catalog-header">
          <h1 className="page-title">🌸 Каталог преміальних боксів</h1>
          <p className="page-subtitle">
            Оберіть ідеальний квітковий бокс для створення незабутніх моментів
          </p>
        </div>

        {/* Search and Filters */}
        <div className="catalog-controls">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Пошук боксів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="filters-section">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Категорія:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <label>Ціна:</label>
              <div className="price-range">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([0, parseInt(e.target.value)])}
                  className="price-slider"
                />
                <span className="price-display">до {filters.priceRange[1]} ₴</span>
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                Тільки в наявності
              </label>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label>Сортування:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              🗑️ Очистити фільтри
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="catalog-results">
          <div className="results-header">
            <h3>
              Знайдено: {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товарів'}
            </h3>
          </div>

          {isLoading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, index) => (
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
          ) : filteredProducts.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🌸</div>
              <h3>Товарів не знайдено</h3>
              <p>Спробуйте змінити параметри пошуку або очистити фільтри</p>
              <button className="reset-btn" onClick={clearFilters}>
                🔄 Скинути фільтри
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
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
      </div>
    </div>
  );
};

export default Catalog;
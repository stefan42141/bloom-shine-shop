import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Header.css';

const Header = ({ cartCount = 0, isAuthenticated = false, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  // Обработка скролла для изменения стиля хедера
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие мобильного меню при изменении роута
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Поиск:', searchQuery);
      // Здесь будет логика поиска
    }
  };

  // Убираем ненужные пункты меню
  const navItems = [
    { path: '/', label: '🏠 Головна', exact: true },
    { path: '/catalog', label: '🌙 Каталог' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* ПРЕМИАЛЬНЫЙ ЛОГОТИП */}
        <Link to="/" className="header-logo">
          <div className="logo-container">
            <span className="logo-icon">🌙</span>
            <div className="logo-text-container">
              <span className="logo-text">BloomShine</span>
              <span className="logo-subtitle">Ароматичні бокси</span>
            </div>
          </div>
        </Link>

        {/* НАВИГАЦИЯ */}
        <nav className="header-nav">
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ПОИСК */}
        <div className={`header-search ${isSearchFocused ? 'focused' : ''}`}>
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text"
              placeholder="🔍 Пошук ароматичних боксів..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <button type="submit" className="search-button">
              <span>🔍</span>
            </button>
          </form>
        </div>

        {/* ДЕЙСТВИЯ */}
        <div className="header-actions">
          {/* Избранное */}
          <Link to="/wishlist" className="action-button" title="Список бажань">
            <span>🤍</span>
          </Link>

          {/* Профиль/Авторизация */}
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-avatar" title="Профіль користувача">
                <span>👤</span>
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">Ім'я користувача</div>
                  <div className="user-email">user@example.com</div>
                </div>
                <Link to="/profile" className="dropdown-item">
                  <span>👤</span> Мій профіль
                </Link>
                <Link to="/orders" className="dropdown-item">
                  <span>📦</span> Мої замовлення
                </Link>
                <Link to="/wishlist" className="dropdown-item">
                  <span>🤍</span> Список бажань
                </Link>
                <hr className="dropdown-divider" />
                <button onClick={onLogout} className="dropdown-item logout">
                  <span>🚪</span> Вийти
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="action-button" title="Увійти">
              <span>🔐</span>
            </Link>
          )}

          {/* Корзина */}
          <Link to="/cart" className="action-button cart-button" title="Кошик">
            <span>🛒</span>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>

          {/* Мобильное меню */}
          <button 
            className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Меню"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-search">
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text"
              placeholder="🔍 Пошук..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav className="mobile-nav">
          {navItems.map((item) => (
            <div key={item.path} className="mobile-nav-item">
              <Link 
                to={item.path} 
                className={`mobile-nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="mobile-actions">
          {!isAuthenticated ? (
            <Link to="/auth" className="mobile-action-button">
              🔐 Увійти / Реєстрація
            </Link>
          ) : (
            <>
              <Link to="/profile" className="mobile-action-button">
                👤 Профіль
              </Link>
              <Link to="/orders" className="mobile-action-button">
                📦 Замовлення
              </Link>
            </>
          )}
          
          <Link to="/wishlist" className="mobile-action-button">
            🤍 Список бажань
          </Link>
          
          <Link to="/cart" className="mobile-action-button">
            🛒 Кошик {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
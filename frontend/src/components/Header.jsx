// filepath: d:\GitHub\BloomShine\bloom-shine-shop\frontend\src\components\Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Header.css';

const Header = ({ cartCount, isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Логотип */}
          <Link to="/" className="logo">
            <span className="logo-icon">🌸</span>
            <span className="logo-text">BloomShine</span>
          </Link>

          {/* Навигация */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" className="nav-link">Главная</Link>
            <Link to="/catalog" className="nav-link">Каталог</Link>
            <Link to="/about" className="nav-link">О нас</Link>
            <Link to="/contact" className="nav-link">Контакты</Link>
          </nav>

          {/* Правая часть */}
          <div className="header-actions">
            {/* Поиск */}
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Поиск цветов..." 
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            {/* Авторизация */}
            {isAuthenticated ? (
              <div className="user-menu">
                <Link to="/profile" className="user-link">👤 Профиль</Link>
                <button onClick={onLogout} className="logout-btn">Выйти</button>
              </div>
            ) : (
              <Link to="/auth" className="auth-link">
                <span>🔐</span> Войти
              </Link>
            )}

            {/* Корзина */}
            <Link to="/cart" className="cart-link">
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>

            {/* Мобильное меню */}
            <button 
              className="mobile-menu-btn"
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
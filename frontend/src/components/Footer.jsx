import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Левая секция - О компании */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🌸</span>
              <span className="logo-text">BloomShine</span>
            </div>
            <p className="footer-description">
              Преміальні квіткові бокси для створення 
              особливих моментів. Темна естетика зустрічається 
              з розкішшю у цій колекції.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📱</a>
            </div>
          </div>

          {/* Навигация */}
          <div className="footer-section">
            <h3 className="footer-title">Навігація</h3>
            <nav className="footer-nav">
              <Link to="/" className="footer-link">Головна</Link>
              <Link to="/catalog" className="footer-link">Каталог</Link>
              <Link to="/premium" className="footer-link">Преміум бокси</Link>
              <Link to="/custom" className="footer-link">Індивідуальний дизайн</Link>
            </nav>
          </div>

          {/* Категории */}
          <div className="footer-section">
            <h3 className="footer-title">Колекції</h3>
            <nav className="footer-nav">
              <Link to="/catalog/midnight" className="footer-link">Midnight Collection</Link>
              <Link to="/catalog/elegance" className="footer-link">Elegance Series</Link>
              <Link to="/catalog/premium" className="footer-link">Premium Boxes</Link>
              <Link to="/catalog/seasonal" className="footer-link">Сезонні бокси</Link>
            </nav>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h3 className="footer-title">Контакти</h3>
            <div className="contact-info">
              <p className="contact-item">
                <span className="contact-icon">📍</span>
                Київ, вул. Хрещатик 22
              </p>
              <p className="contact-item">
                <span className="contact-icon">📞</span>
                +38 (044) 123-45-67
              </p>
              <p className="contact-item">
                <span className="contact-icon">✉️</span>
                info@bloomshine.ua
              </p>
              <p className="contact-item">
                <span className="contact-icon">⏰</span>
                Щодня 9:00 - 21:00
              </p>
            </div>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2025 BloomShine. Всі права захищено.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">Політика конфіденційності</Link>
              <Link to="/terms" className="footer-bottom-link">Умови використання</Link>
              <Link to="/delivery" className="footer-bottom-link">Доставка та оплата</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
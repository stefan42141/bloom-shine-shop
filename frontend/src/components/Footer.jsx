import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Подписка на рассылку:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* О КОМПАНИИ */}
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🌙</span>
              <span className="footer-logo-text">BloomShine</span>
            </Link>
            
            <p className="footer-description">
              Створюємо унікальні ароматичні бокси для особливих моментів. 
              Темна естетика зустрічається з розкішшю, кожен аромат — це 
              подорож у світ витонченості та стилю.
            </p>

            <ul className="footer-features">
              <li className="footer-feature">
                <span className="footer-feature-icon">🌟</span>
                Ексклюзивні ароматичні композиції
              </li>
              <li className="footer-feature">
                <span className="footer-feature-icon">🚚</span>
                Безкоштовна доставка по Україні
              </li>
              <li className="footer-feature">
                <span className="footer-feature-icon">💎</span>
                Преміальна упаковка та сервіс
              </li>
              <li className="footer-feature">
                <span className="footer-feature-icon">🎯</span>
                Гарантія якості 100%
              </li>
            </ul>

            <div className="footer-social">
              <div className="social-links">
                <a href="#" className="social-link" title="Facebook" aria-label="Facebook">
                  <span>📘</span>
                </a>
                <a href="#" className="social-link" title="Instagram" aria-label="Instagram">
                  <span>📷</span>
                </a>
                <a href="#" className="social-link" title="Telegram" aria-label="Telegram">
                  <span>💬</span>
                </a>
                <a href="#" className="social-link" title="Viber" aria-label="Viber">
                  <span>📱</span>
                </a>
              </div>
            </div>
          </div>

          {/* НАВИГАЦИЯ */}
          <div className="footer-section">
            <h3>Навігація</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/">Головна</Link>
              </li>
              <li className="footer-link">
                <Link to="/catalog">Каталог боксів</Link>
              </li>
              <li className="footer-link">
                <Link to="/premium">Преміум колекція</Link>
              </li>
              <li className="footer-link">
                <Link to="/custom">Індивідуальний дизайн</Link>
              </li>
              <li className="footer-link">
                <Link to="/about">Про нас</Link>
              </li>
              <li className="footer-link">
                <Link to="/blog">Блог</Link>
              </li>
            </ul>
          </div>

          {/* КОЛЛЕКЦИИ */}
          <div className="footer-section">
            <h3>Ароматичні колекції</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/collection/midnight">🌙 Midnight Collection</Link>
              </li>
              <li className="footer-link">
                <Link to="/collection/wellness">🧘 Wellness Edition</Link>
              </li>
              <li className="footer-link">
                <Link to="/collection/seasonal">🌿 Seasonal Aromas</Link>
              </li>
              <li className="footer-link">
                <Link to="/collection/luxury">💎 Luxury Series</Link>
              </li>
              <li className="footer-link">
                <Link to="/collection/gift">🎁 Gift Sets</Link>
              </li>
              <li className="footer-link">
                <Link to="/aromatherapy">🌟 Ароматерапія</Link>
              </li>
            </ul>
          </div>

          {/* СЛУЖБА ПОДДЕРЖКИ */}
          <div className="footer-section">
            <h3>Підтримка</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/help">Центр допомоги</Link>
              </li>
              <li className="footer-link">
                <Link to="/delivery">Доставка та оплата</Link>
              </li>
              <li className="footer-link">
                <Link to="/returns">Повернення та обмін</Link>
              </li>
              <li className="footer-link">
                <Link to="/guarantee">Гарантія якості</Link>
              </li>
              <li className="footer-link">
                <Link to="/contact">Зв'язатися з нами</Link>
              </li>
              <li className="footer-link">
                <Link to="/faq">Часті питання</Link>
              </li>
            </ul>

            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-text">
                  <a href="tel:+380441234567">+38 (044) 123-45-67</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-text">
                  <a href="mailto:info@bloomshine.ua">info@bloomshine.ua</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div className="contact-text">
                  Київ, вул. Хрещатик 22<br />
                  ТРЦ "Арена Сіті", 3 поверх
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">⏰</span>
                <div className="contact-text">
                  Пн-Нд: 9:00 - 21:00<br />
                  Без вихідних
                </div>
              </div>
            </div>
          </div>

          {/* ПОДПИСКА НА РАССЫЛКУ */}
          <div className="footer-newsletter">
            <div className="newsletter-content">
              <h3>🌙 Ексклюзивні пропозиції</h3>
              <p className="newsletter-description">
                Підпишіться на розсилку та отримайте знижку 15% на перше замовлення. 
                Дізнавайтеся першими про нові колекції та спеціальні акції.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input 
                  type="email"
                  placeholder="Ваша електронна пошта"
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="newsletter-button"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? '✓ Готово!' : '🌙 Підписатися'}
                </button>
              </form>

              <ul className="newsletter-benefits">
                <li className="newsletter-benefit">Ексклюзивні знижки</li>
                <li className="newsletter-benefit">Нові колекції першими</li>
                <li className="newsletter-benefit">Ароматичні поради</li>
                <li className="newsletter-benefit">Спеціальні акції</li>
              </ul>
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span className="footer-copyright-icon">🌙</span>
            <span>© {currentYear} BloomShine. Усі права захищено.</span>
          </div>

          <ul className="footer-bottom-links">
            <li className="footer-bottom-link">
              <Link to="/privacy">Політика конфіденційності</Link>
            </li>
            <li className="footer-bottom-link">
              <Link to="/terms">Умови користування</Link>
            </li>
            <li className="footer-bottom-link">
              <Link to="/cookies">Файли cookie</Link>
            </li>
            <li className="footer-bottom-link">
              <Link to="/sitemap">Карта сайту</Link>
            </li>
          </ul>

          <div className="footer-badges">
            <div className="security-badge">
              <span className="security-badge-icon">🔒</span>
              <span>SSL захист</span>
            </div>
            <div className="security-badge">
              <span className="security-badge-icon">💳</span>
              <span>Безпечна оплата</span>
            </div>
            <div className="security-badge">
              <span className="security-badge-icon">✅</span>
              <span>Перевірено</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
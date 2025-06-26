import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Cart.css';

const Cart = ({ cartItems, onUpdateQuantity, onRemoveFromCart, onClearCart }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Промокоды
  const promoCodes = {
    'BLOOM10': { discount: 0.10, description: 'Знижка 10%' },
    'LUXURY20': { discount: 0.20, description: 'Знижка 20% на преміум' },
    'NEWUSER': { discount: 0.15, description: 'Знижка 15% для нових клієнтів' },
    'SPRING25': { discount: 0.25, description: 'Весняна знижка 25%' }
  };

  // Подсчет итогов
  const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 299; // Бесплатная доставка от 5000 грн
  const promoDiscount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const total = subtotal + shipping - promoDiscount;

  const handleApplyPromo = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        ...promo
      });
      setPromoCode('');
      setShowPromoInput(false);
    } else {
      alert('Невірний промокод');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleProceedToCheckout = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate('/checkout');
    } catch (error) {
      console.error('Помилка переходу до оформлення:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-content">
              <div className="empty-icon">🛒</div>
              <h2 className="empty-title">Ваш кошик порожній</h2>
              <p className="empty-description">
                Додайте товари до кошика, щоб продовжити покупки
              </p>
              <div className="empty-actions">
                <button 
                  className="luxury-button"
                  onClick={() => navigate('/catalog')}
                >
                  <span className="button-icon">🌸</span>
                  Почати покупки
                </button>
              </div>
              
              {/* Рекомендации */}
              <div className="recommendations">
                <h3 className="recommendations-title">Рекомендовані товари</h3>
                <div className="recommendations-grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="recommendation-card">
                      <div className="recommendation-image">
                        <img 
                          src={`https://via.placeholder.com/200x200/2a2a2a/d4af37?text=🌸+${i}`}
                          alt={`Рекомендація ${i}`}
                        />
                      </div>
                      <div className="recommendation-info">
                        <h4>Luxury Box #{i}</h4>
                        <p className="recommendation-price">2999 ₴</p>
                        <button className="recommendation-btn">
                          Додати до кошика
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Hero секция */}
      <section className="cart-hero">
        <div className="floating-elements">
          <div className="floating-flower">🌸</div>
          <div className="floating-star">✨</div>
          <div className="floating-diamond">💎</div>
        </div>
        
        <div className="container">
          <div className="cart-hero-content">
            <div className="luxury-badge">
              <span className="badge-icon">🛒</span>
              SHOPPING CART
            </div>
            <h1 className="cart-title">Кошик покупок</h1>
            <p className="cart-subtitle">
              Перегляньте обрані товари та оформіть замовлення
            </p>
            
            <div className="cart-stats">
              <div className="stat-item">
                <span className="stat-number">{cartItems.length}</span>
                <span className="stat-label">Товарів в кошику</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{total.toLocaleString()} ₴</span>
                <span className="stat-label">Загальна сума</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{shipping === 0 ? 'Безкоштовно' : '299 ₴'}</span>
                <span className="stat-label">Доставка</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="cart-content">
        <div className="container">
          <div className="cart-grid">
            {/* Товары в корзине */}
            <div className="cart-items-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="title-icon">📦</span>
                  Обрані товари
                </h2>
                <button 
                  className="clear-cart-btn"
                  onClick={onClearCart}
                  title="Очистити кошик"
                >
                  <span className="clear-icon">🗑️</span>
                  Очистити все
                </button>
              </div>

              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                    <div className="item-image-container">
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/150x150/2a2a2a/d4af37?text=🌸'}
                        alt={item.name}
                        className="item-image"
                      />
                      {item.luxury && (
                        <div className="luxury-badge-item">
                          <span className="badge-icon">👑</span>
                          Luxury
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <button 
                          className="remove-item-btn"
                          onClick={() => onRemoveFromCart(item.id, item.selectedSize)}
                          title="Видалити товар"
                        >
                          <span className="remove-icon">❌</span>
                        </button>
                      </div>

                      <div className="item-meta">
                        <span className="item-category">{item.category}</span>
                        {item.selectedSize && (
                          <span className="item-size">
                            Розмір: {item.selectedSize}
                          </span>
                        )}
                      </div>

                      <div className="item-actions">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn decrease"
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn increase"
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-pricing">
                          {item.oldPrice && (
                            <span className="item-old-price">
                              {(item.oldPrice * item.quantity).toLocaleString()} ₴
                            </span>
                          )}
                          <span className="item-price">
                            {((item.finalPrice || item.price) * item.quantity).toLocaleString()} ₴
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Продолжить покупки */}
              <div className="continue-shopping">
                <button 
                  className="continue-btn luxury-button-outline"
                  onClick={() => navigate('/catalog')}
                >
                  <span className="continue-icon">⬅️</span>
                  Продовжити покупки
                </button>
              </div>
            </div>

            {/* Сводка заказа */}
            <div className="cart-summary">
              <div className="summary-card">
                <div className="summary-header">
                  <h3 className="summary-title">
                    <span className="title-icon">📊</span>
                    Сума замовлення
                  </h3>
                </div>

                <div className="summary-content">
                  {/* Промокод */}
                  <div className="promo-section">
                    {!showPromoInput && !appliedPromo && (
                      <button 
                        className="show-promo-btn"
                        onClick={() => setShowPromoInput(true)}
                      >
                        <span className="promo-icon">🎟️</span>
                        Є промокод?
                      </button>
                    )}

                    {showPromoInput && (
                      <div className="promo-input-group">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Введіть промокод"
                          className="promo-input"
                        />
                        <button 
                          className="apply-promo-btn"
                          onClick={handleApplyPromo}
                        >
                          Застосувати
                        </button>
                        <button 
                          className="cancel-promo-btn"
                          onClick={() => {
                            setShowPromoInput(false);
                            setPromoCode('');
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="applied-promo">
                        <div className="promo-info">
                          <span className="promo-code">{appliedPromo.code}</span>
                          <span className="promo-description">{appliedPromo.description}</span>
                        </div>
                        <button 
                          className="remove-promo-btn"
                          onClick={handleRemovePromo}
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Разбивка цен */}
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span className="price-label">Товари ({cartItems.length})</span>
                      <span className="price-value">{subtotal.toLocaleString()} ₴</span>
                    </div>

                    <div className="price-row">
                      <span className="price-label">Доставка</span>
                      <span className={`price-value ${shipping === 0 ? 'free' : ''}`}>
                        {shipping === 0 ? 'Безкоштовно' : `${shipping} ₴`}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="price-row discount">
                        <span className="price-label">
                          Знижка ({appliedPromo.code})
                        </span>
                        <span className="price-value discount">
                          -{promoDiscount.toLocaleString()} ₴
                        </span>
                      </div>
                    )}

                    <div className="price-row total">
                      <span className="price-label">До сплати</span>
                      <span className="price-value">{total.toLocaleString()} ₴</span>
                    </div>
                  </div>

                  {/* Информация о доставке */}
                  {shipping > 0 && (
                    <div className="delivery-info">
                      <div className="delivery-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(subtotal / 5000) * 100}%` }}
                          ></div>
                        </div>
                        <p className="progress-text">
                          Додайте ще {(5000 - subtotal).toLocaleString()} ₴ для безкоштовної доставки
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Кнопка оформления */}
                  <div className="checkout-actions">
                    <button 
                      className={`checkout-btn luxury-button ${isLoading ? 'loading' : ''}`}
                      onClick={handleProceedToCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading-spinner">⏳</span>
                          Переходимо...
                        </>
                      ) : (
                        <>
                          <span className="checkout-icon">🚀</span>
                          Оформити замовлення
                        </>
                      )}
                    </button>

                    <div className="security-info">
                      <div className="security-badges">
                        <div className="security-badge">
                          <span className="security-icon">🔒</span>
                          <span>Захищена оплата</span>
                        </div>
                        <div className="security-badge">
                          <span className="security-icon">🚚</span>
                          <span>Швидка доставка</span>
                        </div>
                        <div className="security-badge">
                          <span className="security-icon">🎯</span>
                          <span>Гарантія якості</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Преимущества */}
              <div className="benefits-card">
                <h4 className="benefits-title">
                  <span className="title-icon">✨</span>
                  Переваги замовлення
                </h4>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <span className="benefit-icon">🌹</span>
                    <div className="benefit-content">
                      <span className="benefit-title">Преміальна якість</span>
                      <span className="benefit-description">Тільки найкращі квіти</span>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">📦</span>
                    <div className="benefit-content">
                      <span className="benefit-title">Розкішна упаковка</span>
                      <span className="benefit-description">Ексклюзивний дизайн</span>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <div className="benefit-content">
                      <span className="benefit-title">Швидка доставка</span>
                      <span className="benefit-description">До 2 годин в Києві</span>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🎯</span>
                    <div className="benefit-content">
                      <span className="benefit-title">Гарантія свіжості</span>
                      <span className="benefit-description">7 днів гарантії</span>
                    </div>
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

export default Cart;
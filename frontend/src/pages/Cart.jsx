import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/Cart.css';

const CartPage = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart 
}) => {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Подсчет общей суммы
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handlePromoCode = () => {
    if (promoCode === 'BLOOM10') {
      setDiscount(10);
      setPromoMessage('🎉 Промокод застосовано! Знижка 10%');
    } else if (promoCode === 'PREMIUM15') {
      setDiscount(15);
      setPromoMessage('🎉 Промокод застосовано! Знижка 15%');
    } else if (promoCode === 'FIRST20') {
      setDiscount(20);
      setPromoMessage('🎉 Промокод застосовано! Знижка 20%');
    } else {
      setDiscount(0);
      setPromoMessage('❌ Невірний промокод');
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🌸</div>
            <h1>Ваш кошик порожній</h1>
            <p>Додайте преміальні квіткові бокси для створення магічних моментів</p>
            <Link to="/catalog" className="continue-shopping-btn">
              🌺 Перейти до каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <h1 className="page-title">🛒 Ваш кошик</h1>
          <p className="items-count">
            {cartItems.length} {cartItems.length === 1 ? 'товар' : 'товарів'}
          </p>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.selectedSize || 'default'}`} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.images ? item.images[0] : item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-box.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    
                    {item.selectedSize && (
                      <p className="item-size">Розмір: {item.selectedSize}</p>
                    )}
                    
                    <div className="item-price">
                      {item.oldPrice && (
                        <span className="old-price">{item.oldPrice} ₴</span>
                      )}
                      <span className="current-price">{item.price} ₴</span>
                    </div>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      {(item.price * item.quantity).toFixed(0)} ₴
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      title="Видалити товар"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="cart-actions">
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                ← Продовжити покупки
              </button>
              
              <button 
                className="clear-cart-btn"
                onClick={onClearCart}
              >
                🗑️ Очистити кошик
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3 className="summary-title">Разом до сплати</h3>
              
              {/* Promo Code */}
              <div className="promo-section">
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Введіть промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="promo-input"
                  />
                  <button 
                    className="promo-btn"
                    onClick={handlePromoCode}
                  >
                    ✨ Застосувати
                  </button>
                </div>
                
                {promoMessage && (
                  <div className={`promo-message ${discount > 0 ? 'success' : 'error'}`}>
                    {promoMessage}
                  </div>
                )}
                
                <div className="promo-suggestions">
                  <p>Доступні промокоди:</p>
                  <ul>
                    <li><code>BLOOM10</code> - знижка 10%</li>
                    <li><code>PREMIUM15</code> - знижка 15%</li>
                    <li><code>FIRST20</code> - знижка 20%</li>
                  </ul>
                </div>
              </div>

              {/* Summary Details */}
              <div className="summary-details">
                <div className="summary-row">
                  <span>Підсумок ({cartItems.length} товарів):</span>
                  <span>{calculateSubtotal().toFixed(0)} ₴</span>
                </div>
                
                <div className="summary-row">
                  <span>Доставка:</span>
                  <span className="free">
                    {calculateSubtotal() >= 1000 ? 'Безкоштовно' : '150 ₴'}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Знижка ({discount}%):</span>
                    <span>-{calculateDiscount().toFixed(0)} ₴</span>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>До сплати:</span>
                  <span>
                    {(calculateTotal() + (calculateSubtotal() >= 1000 ? 0 : 150)).toFixed(0)} ₴
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                💳 Оформити замовлення
              </button>

              {/* Security Info */}
              <div className="security-info">
                <div className="security-item">
                  <span className="security-icon">🔒</span>
                  <span>Безпечна оплата</span>
                </div>
                <div className="security-item">
                  <span className="security-icon">🚚</span>
                  <span>Швидка доставка</span>
                </div>
                <div className="security-item">
                  <span className="security-icon">↩️</span>
                  <span>Легке повернення</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="cart-features">
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h4>Преміальна якість</h4>
            <p>Тільки найкращі квіти від перевірених постачальників</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h4>Швидка доставка</h4>
            <p>Доставка по Києву за 2 години, по Україні - наступний день</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h4>Індивідуальний підхід</h4>
            <p>Створюємо бокси за вашими побажаннями та емоціями</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
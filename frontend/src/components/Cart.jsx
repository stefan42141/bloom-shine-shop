import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Cart.css';

const Cart = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  isOpen,
  onClose 
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Подсчет общей суммы
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const handlePromoCode = () => {
    // Логика применения промокода
    if (promoCode === 'BLOOM10') {
      setDiscount(10);
    } else if (promoCode === 'PREMIUM15') {
      setDiscount(15);
    } else {
      setDiscount(0);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        {/* Заголовок корзины */}
        <div className="cart-header">
          <h2 className="cart-title">
            <span className="cart-icon">🛒</span>
            Ваш кошик
          </h2>
          <button className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Содержимое корзины */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🌸</div>
              <h3>Ваш кошик порожній</h3>
              <p>Додайте преміальні квіткові бокси для створення магічних моментів</p>
              <Link to="/catalog" className="continue-shopping-btn" onClick={onClose}>
                🌺 Перейти до каталогу
              </Link>
            </div>
          ) : (
            <>
              {/* Список товаров */}
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-category">{item.category}</p>
                      <div className="item-price">{item.price} ₴</div>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Промокод */}
              <div className="promo-section">
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="promo-input"
                  />
                  <button 
                    className="promo-btn"
                    onClick={handlePromoCode}
                  >
                    ✨ Застосувати
                  </button>
                </div>
                {discount > 0 && (
                  <div className="discount-applied">
                    🎉 Знижка {discount}% застосована!
                  </div>
                )}
              </div>

              {/* Итого */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Підсумок:</span>
                  <span>{cartItems.reduce((total, item) => 
                    total + (item.price * item.quantity), 0)} ₴</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Знижка ({discount}%):</span>
                    <span>-{((cartItems.reduce((total, item) => 
                      total + (item.price * item.quantity), 0) * discount) / 100).toFixed(0)} ₴</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>До сплати:</span>
                  <span>{calculateTotal().toFixed(0)} ₴</span>
                </div>
              </div>

              {/* Действия */}
              <div className="cart-actions">
                <Link 
                  to="/checkout" 
                  className="checkout-btn"
                  onClick={onClose}
                >
                  💳 Оформити замовлення
                </Link>
                <button 
                  className="continue-shopping"
                  onClick={onClose}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Checkout.css';

const Checkout = ({ cartItems, onOrderComplete }) => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    // Delivery Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Київ',
    address: '',
    deliveryType: 'courier', // courier, pickup, nova-poshta
    deliveryTime: 'standard', // standard, express, scheduled
    scheduledDate: '',
    scheduledTime: '',
    
    // Payment Info
    paymentMethod: 'card', // card, cash, online
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    
    // Additional
    comment: '',
    giftWrap: false,
    giftMessage: '',
    newsletter: false
  });
  
  const [errors, setErrors] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Перенаправляем если корзина пуста
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Подсчет сумм
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDeliveryPrice = () => {
    if (orderData.deliveryType === 'pickup') return 0;
    if (orderData.deliveryType === 'express') return 300;
    if (calculateSubtotal() >= 1000) return 0;
    return 150;
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryPrice() - calculateDiscount();
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      // Валидация данных доставки
      if (!orderData.firstName.trim()) newErrors.firstName = 'Ім\'я обов\'язкове';
      if (!orderData.lastName.trim()) newErrors.lastName = 'Прізвище обов\'язкове';
      if (!orderData.phone.trim()) newErrors.phone = 'Телефон обов\'язковий';
      if (!orderData.email.trim()) newErrors.email = 'Email обов\'язковий';
      else if (!/\S+@\S+\.\S+/.test(orderData.email)) newErrors.email = 'Невірний формат email';
      
      if (orderData.deliveryType === 'courier') {
        if (!orderData.address.trim()) newErrors.address = 'Адреса обов\'язкова';
      }
      
      if (orderData.deliveryTime === 'scheduled') {
        if (!orderData.scheduledDate) newErrors.scheduledDate = 'Оберіть дату доставки';
        if (!orderData.scheduledTime) newErrors.scheduledTime = 'Оберіть час доставки';
      }
    }

    if (stepNumber === 2) {
      // Валидация данных оплаты
      if (orderData.paymentMethod === 'card') {
        if (!orderData.cardNumber.trim()) newErrors.cardNumber = 'Номер картки обов\'язковий';
        if (!orderData.cardExpiry.trim()) newErrors.cardExpiry = 'Термін дії обов\'язковий';
        if (!orderData.cardCvv.trim()) newErrors.cardCvv = 'CVV код обов\'язковий';
        if (!orderData.cardName.trim()) newErrors.cardName = 'Ім\'я власника обов\'язкове';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handlePromoCode = () => {
    if (promoCode === 'BLOOM10') {
      setDiscount(10);
    } else if (promoCode === 'PREMIUM15') {
      setDiscount(15);
    } else if (promoCode === 'FIRST20') {
      setDiscount(20);
    } else {
      setDiscount(0);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    
    try {
      // Имитация отправки заказа
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const order = {
        id: Date.now(),
        items: cartItems,
        customer: orderData,
        total: calculateTotal(),
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      onOrderComplete(order);
      setStep(3);
    } catch (error) {
      console.error('Помилка оформлення замовлення:', error);
      alert('Виникла помилка при оформленні замовлення');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = [
    'Київ', 'Харків', 'Одеса', 'Дніпро', 'Донецьк', 'Запоріжжя', 
    'Львів', 'Кривий Ріг', 'Миколаїв', 'Маріуполь', 'Луганськ', 'Винниця'
  ];

  const timeSlots = [
    '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'
  ];

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Progress Steps */}
        <div className="checkout-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Доставка</div>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Оплата</div>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Підтвердження</div>
          </div>
        </div>

        <div className="checkout-content">
          {/* Main Content */}
          <div className="checkout-main">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <div className="checkout-step delivery-step">
                <h2 className="step-title">🚚 Інформація про доставку</h2>
                
                {/* Personal Info */}
                <div className="form-section">
                  <h3>Особисті дані</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">Ім'я *</label>
                      <input
                        type="text"
                        id="firstName"
                        value={orderData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="Введіть ваше ім'я"
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Прізвище *</label>
                      <input
                        type="text"
                        id="lastName"
                        value={orderData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Введіть ваше прізвище"
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="phone">Телефон *</label>
                      <input
                        type="tel"
                        id="phone"
                        value={orderData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'error' : ''}
                        placeholder="+38 (0__) ___-__-__"
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        value={orderData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'error' : ''}
                        placeholder="your@email.com"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="form-section">
                  <h3>Спосіб доставки</h3>
                  <div className="delivery-options">
                    <label className={`delivery-option ${orderData.deliveryType === 'courier' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="courier"
                        checked={orderData.deliveryType === 'courier'}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">🚚</div>
                        <div className="option-details">
                          <div className="option-title">Кур'єрська доставка</div>
                          <div className="option-description">Доставка по адресі</div>
                          <div className="option-price">
                            {calculateSubtotal() >= 1000 ? 'Безкоштовно' : '150 ₴'}
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`delivery-option ${orderData.deliveryType === 'pickup' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={orderData.deliveryType === 'pickup'}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">🏪</div>
                        <div className="option-details">
                          <div className="option-title">Самовивіз</div>
                          <div className="option-description">вул. Хрещатик 22, Київ</div>
                          <div className="option-price">Безкоштовно</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`delivery-option ${orderData.deliveryType === 'nova-poshta' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="nova-poshta"
                        checked={orderData.deliveryType === 'nova-poshta'}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">📦</div>
                        <div className="option-details">
                          <div className="option-title">Нова Пошта</div>
                          <div className="option-description">До відділення або поштомату</div>
                          <div className="option-price">За тарифами НП</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Address */}
                {(orderData.deliveryType === 'courier' || orderData.deliveryType === 'nova-poshta') && (
                  <div className="form-section">
                    <h3>Адреса доставки</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="city">Місто</label>
                        <select
                          id="city"
                          value={orderData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        >
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="address">
                          {orderData.deliveryType === 'courier' ? 'Адреса *' : 'Відділення Нової Пошти'}
                        </label>
                        <input
                          type="text"
                          id="address"
                          value={orderData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={errors.address ? 'error' : ''}
                          placeholder={
                            orderData.deliveryType === 'courier' 
                              ? "вул. Прикладна 123, кв. 45" 
                              : "Відділення №1"
                          }
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Time */}
                {orderData.deliveryType === 'courier' && (
                  <div className="form-section">
                    <h3>Час доставки</h3>
                    <div className="time-options">
                      <label className={`time-option ${orderData.deliveryTime === 'standard' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryTime"
                          value="standard"
                          checked={orderData.deliveryTime === 'standard'}
                          onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                        />
                        <div className="option-content">
                          <div className="option-title">Стандартна доставка</div>
                          <div className="option-description">Протягом дня (9:00-21:00)</div>
                        </div>
                      </label>
                      
                      <label className={`time-option ${orderData.deliveryTime === 'express' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryTime"
                          value="express"
                          checked={orderData.deliveryTime === 'express'}
                          onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                        />
                        <div className="option-content">
                          <div className="option-title">Експрес доставка (+300 ₴)</div>
                          <div className="option-description">Протягом 2 годин</div>
                        </div>
                      </label>
                      
                      <label className={`time-option ${orderData.deliveryTime === 'scheduled' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryTime"
                          value="scheduled"
                          checked={orderData.deliveryTime === 'scheduled'}
                          onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                        />
                        <div className="option-content">
                          <div className="option-title">За розкладом</div>
                          <div className="option-description">Оберіть зручний час</div>
                        </div>
                      </label>
                    </div>
                    
                    {orderData.deliveryTime === 'scheduled' && (
                      <div className="scheduled-time">
                        <div className="form-grid">
                          <div className="form-group">
                            <label htmlFor="scheduledDate">Дата доставки *</label>
                            <input
                              type="date"
                              id="scheduledDate"
                              value={orderData.scheduledDate}
                              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                              className={errors.scheduledDate ? 'error' : ''}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.scheduledDate && <span className="error-message">{errors.scheduledDate}</span>}
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="scheduledTime">Час доставки *</label>
                            <select
                              id="scheduledTime"
                              value={orderData.scheduledTime}
                              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                              className={errors.scheduledTime ? 'error' : ''}
                            >
                              <option value="">Оберіть час</option>
                              {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                            {errors.scheduledTime && <span className="error-message">{errors.scheduledTime}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Options */}
                <div className="form-section">
                  <h3>Додаткові опції</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={orderData.giftWrap}
                        onChange={(e) => handleInputChange('giftWrap', e.target.checked)}
                      />
                      🎁 Подарункове пакування (+50 ₴)
                    </label>
                  </div>
                  
                  {orderData.giftWrap && (
                    <div className="form-group">
                      <label htmlFor="giftMessage">Повідомлення на листівці</label>
                      <textarea
                        id="giftMessage"
                        value={orderData.giftMessage}
                        onChange={(e) => handleInputChange('giftMessage', e.target.value)}
                        placeholder="Ваше персональне повідомлення..."
                        rows="3"
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="comment">Коментар до замовлення</label>
                    <textarea
                      id="comment"
                      value={orderData.comment}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      placeholder="Додаткові побажання або коментарі..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="step-actions">
                  <button className="next-btn" onClick={handleNextStep}>
                    Далі: Оплата →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="checkout-step payment-step">
                <h2 className="step-title">💳 Спосіб оплати</h2>
                
                {/* Payment Methods */}
                <div className="form-section">
                  <h3>Оберіть спосіб оплати</h3>
                  <div className="payment-options">
                    <label className={`payment-option ${orderData.paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={orderData.paymentMethod === 'card'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">💳</div>
                        <div className="option-details">
                          <div className="option-title">Банківська картка</div>
                          <div className="option-description">Visa, MasterCard, Приват24</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`payment-option ${orderData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={orderData.paymentMethod === 'cash'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">💵</div>
                        <div className="option-details">
                          <div className="option-title">Готівкою при отриманні</div>
                          <div className="option-description">Оплата кур'єру або в магазині</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`payment-option ${orderData.paymentMethod === 'online' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={orderData.paymentMethod === 'online'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">🌐</div>
                        <div className="option-details">
                          <div className="option-title">Онлайн оплата</div>
                          <div className="option-description">Apple Pay, Google Pay, PayPal</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Card Details */}
                {orderData.paymentMethod === 'card' && (
                  <div className="form-section">
                    <h3>Дані банківської картки</h3>
                    <div className="card-form">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Номер картки *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={orderData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className={errors.cardNumber ? 'error' : ''}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="cardExpiry">Термін дії *</label>
                          <input
                            type="text"
                            id="cardExpiry"
                            value={orderData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                            className={errors.cardExpiry ? 'error' : ''}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.cardExpiry && <span className="error-message">{errors.cardExpiry}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="cardCvv">CVV код *</label>
                          <input
                            type="text"
                            id="cardCvv"
                            value={orderData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            className={errors.cardCvv ? 'error' : ''}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cardCvv && <span className="error-message">{errors.cardCvv}</span>}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cardName">Ім'я власника картки *</label>
                        <input
                          type="text"
                          id="cardName"
                          value={orderData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value)}
                          className={errors.cardName ? 'error' : ''}
                          placeholder="IVAN PETROV"
                        />
                        {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Newsletter Subscription */}
                <div className="form-section">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={orderData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                      />
                      📧 Підписатися на розсилку про новинки та акції
                    </label>
                  </div>
                </div>

                <div className="step-actions">
                  <button className="prev-btn" onClick={handlePrevStep}>
                    ← Назад
                  </button>
                  <button 
                    className="submit-btn"
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳ Обробка...' : '✨ Оформити замовлення'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {step === 3 && (
              <div className="checkout-step confirmation-step">
                <div className="confirmation-content">
                  <div className="success-icon">✅</div>
                  <h2>Замовлення успішно оформлено!</h2>
                  <p className="order-number">Номер замовлення: #BLS{Date.now()}</p>
                  
                  <div className="confirmation-details">
                    <p>Дякуємо за ваше замовлення! Ми зв'яжемося з вами найближчим часом для підтвердження.</p>
                    
                    <div className="next-steps">
                      <h4>Що далі?</h4>
                      <ul>
                        <li>📧 Ви отримаєте email-підтвердження</li>
                        <li>📞 Наш менеджер зв'яжеться з вами протягом 30 хвилин</li>
                        <li>🌸 Ваші квіти будуть свіжими та красивими</li>
                        <li>🚚 Доставимо точно в зазначений час</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="confirmation-actions">
                    <button 
                      className="home-btn"
                      onClick={() => navigate('/')}
                    >
                      🏠 На головну
                    </button>
                    <button 
                      className="catalog-btn"
                      onClick={() => navigate('/catalog')}
                    >
                      🌺 Продовжити покупки
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 3 && (
            <div className="checkout-sidebar">
              <div className="order-summary">
                <h3 className="summary-title">Ваше замовлення</h3>
                
                {/* Items */}
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedSize || 'default'}`} className="summary-item">
                      <div className="item-image">
                        <img src={item.images ? item.images[0] : item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        {item.selectedSize && (
                          <div className="item-size">Розмір: {item.selectedSize}</div>
                        )}
                        <div className="item-quantity">Кількість: {item.quantity}</div>
                      </div>
                      <div className="item-price">
                        {(item.price * item.quantity).toFixed(0)} ₴
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="promo-section">
                  <div className="promo-input-group">
                    <input
                      type="text"
                      placeholder="Промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="promo-input"
                    />
                    <button className="promo-btn" onClick={handlePromoCode}>
                      ✨
                    </button>
                  </div>
                  {discount > 0 && (
                    <div className="promo-applied">
                      🎉 Знижка {discount}% застосована!
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="summary-totals">
                  <div className="total-row">
                    <span>Товарів ({cartItems.length}):</span>
                    <span>{calculateSubtotal().toFixed(0)} ₴</span>
                  </div>
                  
                  <div className="total-row">
                    <span>Доставка:</span>
                    <span>
                      {calculateDeliveryPrice() === 0 ? 'Безкоштовно' : `${calculateDeliveryPrice()} ₴`}
                    </span>
                  </div>
                  
                  {orderData.giftWrap && (
                    <div className="total-row">
                      <span>Подарункове пакування:</span>
                      <span>50 ₴</span>
                    </div>
                  )}
                  
                  {discount > 0 && (
                    <div className="total-row discount">
                      <span>Знижка ({discount}%):</span>
                      <span>-{calculateDiscount().toFixed(0)} ₴</span>
                    </div>
                  )}
                  
                  <div className="total-row final">
                    <span>До сплати:</span>
                    <span>
                      {(calculateTotal() + (orderData.giftWrap ? 50 : 0)).toFixed(0)} ₴
                    </span>
                  </div>
                </div>

                {/* Security */}
                <div className="security-badges">
                  <div className="security-badge">
                    <span className="badge-icon">🔒</span>
                    <span>Безпечна оплата</span>
                  </div>
                  <div className="security-badge">
                    <span className="badge-icon">✅</span>
                    <span>Гарантія якості</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
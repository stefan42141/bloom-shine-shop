import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Auth from './components/Auth';

// Страницы
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';

import './styles/variables.css';    // 1. Сначала переменные
import './styles/globals.css';      // 2. Потом глобальные стили

const App = () => {
  // Состояния приложения
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация приложения
  useEffect(() => {
    initializeApp();
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('bloomshine-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const initializeApp = () => {
    try {
      // Загружаем корзину из localStorage
      const savedCart = localStorage.getItem('bloomshine-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }

      // Загружаем данные пользователя
      const savedUser = localStorage.getItem('bloomshine-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Помилка ініціалізації додатку:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== ФУНКЦИИ КОРЗИНЫ ==========
  const addToCart = (product) => {
    const existingItemIndex = cartItems.findIndex(
      item => item.id === product.id && 
               item.selectedSize === product.selectedSize
    );

    if (existingItemIndex !== -1) {
      // Товар уже есть в корзине - увеличиваем количество
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += product.quantity || 1;
      setCartItems(updatedItems);
    } else {
      // Новый товар - добавляем в корзину
      const cartItem = {
        ...product,
        quantity: product.quantity || 1,
        addedAt: new Date().toISOString()
      };
      setCartItems([...cartItems, cartItem]);
    }

    // Показываем уведомление
    showNotification(`${product.name} додано до кошика!`, 'success');
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedItems);
  };

  const removeFromCart = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    showNotification('Товар видалено з кошика', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('bloomshine-cart');
    showNotification('Кошик очищено', 'info');
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ========== ФУНКЦИИ АВТОРИЗАЦИИ ==========
  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      // TODO: Заменить на реальный API запрос
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Date.now(),
        email: credentials.email,
        firstName: 'Користувач',
        lastName: 'BloomShine',
        isAuthenticated: true,
        loginAt: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('bloomshine-user', JSON.stringify(userData));
      showNotification(`Вітаємо, ${userData.firstName}!`, 'success');
    } catch (error) {
      throw new Error('Помилка входу в систему');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      // TODO: Заменить на реальный API запрос
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isAuthenticated: true,
        registeredAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('bloomshine-user', JSON.stringify(newUser));
      showNotification(`Реєстрація успішна! Вітаємо, ${newUser.firstName}!`, 'success');
    } catch (error) {
      throw new Error('Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bloomshine-user');
    showNotification('Ви вийшли з акаунту', 'info');
  };

  // ========== ФУНКЦИИ UI ==========
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

  const showNotification = (message, type = 'info') => {
    // TODO: Реализовать систему уведомлений
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // ========== ФУНКЦИИ ЗАКАЗА ==========
  const handleOrderComplete = (orderData) => {
    // Очищаем корзину после успешного заказа
    clearCart();
    
    // Сохраняем заказ в localStorage для истории
    const orders = JSON.parse(localStorage.getItem('bloomshine-orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('bloomshine-orders', JSON.stringify(orders));
    
    showNotification('Замовлення успішно оформлено!', 'success');
  };

  // Показываем загрузчик при инициализации
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner">🌸</div>
          <h2>BloomShine</h2>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Header */}
        <Header 
          cartCount={getCartItemsCount()}
          isAuthenticated={!!user}
          user={user}
          onCartClick={openCart}
          onAuthClick={openAuth}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            {/* Главная страница */}
            <Route 
              path="/" 
              element={
                <Home 
                  onAddToCart={addToCart}
                />
              } 
            />
            
            {/* Каталог */}
            <Route 
              path="/catalog" 
              element={
                <Catalog 
                  onAddToCart={addToCart}
                />
              } 
            />
            
            {/* Страница товара */}
            <Route 
              path="/product/:id" 
              element={
                <Product 
                  onAddToCart={addToCart}
                />
              } 
            />
            
            {/* Страница корзины */}
            <Route 
              path="/cart" 
              element={
                <CartPage 
                  cartItems={cartItems}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                />
              } 
            />
            
            {/* Оформление заказа */}
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  cartItems={cartItems}
                  onOrderComplete={handleOrderComplete}
                />
              } 
            />

            {/* Дополнительные страницы */}
            <Route 
              path="/about" 
              element={
                <div className="page-placeholder">
                  <div className="container">
                    <h1>🌸 Про нас</h1>
                    <p>Сторінка в розробці...</p>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/contact" 
              element={
                <div className="page-placeholder">
                  <div className="container">
                    <h1>📞 Контакти</h1>
                    <p>Сторінка в розробці...</p>
                  </div>
                </div>
              } 
            />

            {/* 404 страница */}
            <Route 
              path="*" 
              element={
                <div className="page-404">
                  <div className="container">
                    <div className="error-content">
                      <h1>🌸 404</h1>
                      <h2>Сторінка не знайдена</h2>
                      <p>Вибачте, але сторінка, яку ви шукаєте, не існує.</p>
                      <a href="/" className="home-link">
                        🏠 На головну
                      </a>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Cart Sidebar */}
        <Cart 
          cartItems={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          isOpen={isCartOpen}
          onClose={closeCart}
        />

        {/* Auth Modal */}
        <Auth 
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={closeAuth}
          isOpen={isAuthOpen}
        />

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="global-loading">
            <div className="loading-spinner">⏳</div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
// API сервисы для работы с backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Базовая функция для запросов
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Добавляем токен авторизации если есть
  const token = localStorage.getItem('bloomshine-token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ========== ПРОДУКТЫ ==========
export const productsApi = {
  // Получить все продукты
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Получить продукт по ID
  getById: (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Получить рекомендуемые продукты
  getFeatured: () => {
    return apiRequest('/products/featured');
  },

  // Поиск продуктов
  search: (query, filters = {}) => {
    return apiRequest('/products/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  },

  // Получить продукты по категории
  getByCategory: (category) => {
    return apiRequest(`/products/category/${category}`);
  },
};

// ========== АВТОРИЗАЦИЯ ==========
export const authApi = {
  // Регистрация
  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Вход
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Выход
  logout: () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Получить профиль пользователя
  getProfile: () => {
    return apiRequest('/auth/profile');
  },

  // Обновить профиль
  updateProfile: (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Забыли пароль
  forgotPassword: (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Сброс пароля
  resetPassword: (token, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  },
};

// ========== ЗАКАЗЫ ==========
export const ordersApi = {
  // Создать заказ
  create: (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Получить заказы пользователя
  getUserOrders: () => {
    return apiRequest('/orders/my');
  },

  // Получить заказ по ID
  getById: (id) => {
    return apiRequest(`/orders/${id}`);
  },

  // Отменить заказ
  cancel: (id) => {
    return apiRequest(`/orders/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Получить статус заказа
  getStatus: (id) => {
    return apiRequest(`/orders/${id}/status`);
  },
};

// ========== КОРЗИНА ==========
export const cartApi = {
  // Получить корзину
  get: () => {
    return apiRequest('/cart');
  },

  // Добавить товар в корзину
  addItem: (productId, quantity = 1, options = {}) => {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, options }),
    });
  },

  // Обновить количество товара
  updateItem: (itemId, quantity) => {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Удалить товар из корзины
  removeItem: (itemId) => {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Очистить корзину
  clear: () => {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },

  // Применить промокод
  applyPromoCode: (code) => {
    return apiRequest('/cart/promo', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};

// ========== ПРОМОКОДЫ ==========
export const promoApi = {
  // Проверить промокод
  validate: (code) => {
    return apiRequest('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Получить доступные промокоды
  getAvailable: () => {
    return apiRequest('/promo/available');
  },
};

// ========== ДОСТАВКА ==========
export const deliveryApi = {
  // Рассчитать стоимость доставки
  calculateCost: (address, items) => {
    return apiRequest('/delivery/calculate', {
      method: 'POST',
      body: JSON.stringify({ address, items }),
    });
  },

  // Получить доступные способы доставки
  getMethods: (address) => {
    return apiRequest('/delivery/methods', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },

  // Получить отделения Новой Почты
  getNovaPoshtaOffices: (city) => {
    return apiRequest(`/delivery/nova-poshta/offices?city=${encodeURIComponent(city)}`);
  },
};

// ========== ОТЗЫВЫ ==========
export const reviewsApi = {
  // Получить отзывы о продукте
  getByProduct: (productId) => {
    return apiRequest(`/reviews/product/${productId}`);
  },

  // Добавить отзыв
  create: (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Обновить отзыв
  update: (id, reviewData) => {
    return apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Удалить отзыв
  delete: (id) => {
    return apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========== ИЗБРАННОЕ ==========
export const wishlistApi = {
  // Получить избранное
  get: () => {
    return apiRequest('/wishlist');
  },

  // Добавить в избранное
  add: (productId) => {
    return apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Удалить из избранного
  remove: (productId) => {
    return apiRequest('/wishlist/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  },
};

// ========== УТИЛИТЫ ==========
export const utilsApi = {
  // Загрузить изображение
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Убираем Content-Type для FormData
    });
  },

  // Подписаться на рассылку
  subscribe: (email) => {
    return apiRequest('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Обратная связь
  sendFeedback: (feedbackData) => {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },
};

// Экспортируем все API
export default {
  products: productsApi,
  auth: authApi,
  orders: ordersApi,
  cart: cartApi,
  promo: promoApi,
  delivery: deliveryApi,
  reviews: reviewsApi,
  wishlist: wishlistApi,
  utils: utilsApi,
};
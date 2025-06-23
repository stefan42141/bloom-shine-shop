// API сервисы для работы с backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Базовая функция для HTTP запросов
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Добавляем токен авторизации если есть
  const token = localStorage.getItem('bloomshine-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ========== PRODUCTS API ==========
export const productsAPI = {
  // Получить все товары
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryParams}`);
  },

  // Получить товар по ID
  getById: (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Получить товары по категории
  getByCategory: (category, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/products/category/${category}?${queryParams}`);
  },

  // Поиск товаров
  search: (query, params = {}) => {
    const queryParams = new URLSearchParams({ q: query, ...params }).toString();
    return apiRequest(`/products/search?${queryParams}`);
  },

  // Получить рекомендации
  getRecommendations: (productId) => {
    return apiRequest(`/products/${productId}/recommendations`);
  },

  // Получить популярные товары
  getPopular: (limit = 8) => {
    return apiRequest(`/products/popular?limit=${limit}`);
  },

  // Получить новинки
  getNew: (limit = 8) => {
    return apiRequest(`/products/new?limit=${limit}`);
  },

  // Получить товары со скидкой
  getSale: (limit = 8) => {
    return apiRequest(`/products/sale?limit=${limit}`);
  }
};

// ========== AUTH API ==========
export const authAPI = {
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

  // Получить профиль
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

  // Восстановление пароля
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
      body: JSON.stringify({ token, newPassword }),
    });
  }
};

// ========== ORDERS API ==========
export const ordersAPI = {
  // Создать заказ
  create: (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Получить заказы пользователя
  getUserOrders: (userId) => {
    return apiRequest(`/orders/user/${userId}`);
  },

  // Получить заказ по ID
  getById: (id) => {
    return apiRequest(`/orders/${id}`);
  },

  // Обновить статус заказа
  updateStatus: (id, status) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Отменить заказ
  cancel: (id) => {
    return apiRequest(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }
};

// ========== CATEGORIES API ==========
export const categoriesAPI = {
  // Получить все категории
  getAll: () => {
    return apiRequest('/categories');
  },

  // Получить категорию по ID
  getById: (id) => {
    return apiRequest(`/categories/${id}`);
  }
};

// ========== REVIEWS API ==========
export const reviewsAPI = {
  // Получить отзывы товара
  getByProductId: (productId) => {
    return apiRequest(`/products/${productId}/reviews`);
  },

  // Создать отзыв
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
  }
};

// ========== WISHLIST API ==========
export const wishlistAPI = {
  // Получить список желаний
  get: () => {
    return apiRequest('/wishlist');
  },

  // Добавить в список желаний
  add: (productId) => {
    return apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Удалить из списка желаний
  remove: (productId) => {
    return apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }
};

// ========== UTILS ==========
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Неавторизован - удаляем токен
    localStorage.removeItem('bloomshine-token');
    localStorage.removeItem('bloomshine-user');
    window.location.href = '/';
    return 'Сессия истекла. Пожалуйста, войдите снова.';
  }
  
  if (error.message.includes('403')) {
    return 'Недостаточно прав для выполнения операции.';
  }
  
  if (error.message.includes('404')) {
    return 'Запрашиваемый ресурс не найден.';
  }
  
  if (error.message.includes('500')) {
    return 'Ошибка сервера. Попробуйте позже.';
  }
  
  return 'Произошла ошибка. Проверьте подключение к интернету.';
};

// Экспорт всех API
export default {
  products: productsAPI,
  auth: authAPI,
  orders: ordersAPI,
  categories: categoriesAPI,
  reviews: reviewsAPI,
  wishlist: wishlistAPI,
  handleError: handleApiError
};
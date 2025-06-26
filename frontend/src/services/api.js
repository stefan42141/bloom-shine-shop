const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Базовый метод для HTTP запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API запрос неудачен: ${url}`, error);
      throw error;
    }
  }

  // ========== PRODUCTS API ==========

  // Получить рекомендуемые боксы для главной страницы
  async getFeaturedProducts() {
    try {
      console.log('🌟 Запрос рекомендуемых боксов...');
      const response = await this.request('/products/featured');
      
      if (response.success) {
        console.log(`✅ Получено ${response.count} рекомендуемых боксов`);
        return response.products;
      } else {
        throw new Error(response.message || 'Ошибка получения рекомендуемых боксов');
      }
    } catch (error) {
      console.error('❌ Ошибка получения featured products:', error);
      return [];
    }
  }

  // Получить все боксы с фильтрацией
  async getAllProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });

      const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.request(endpoint);
      
      if (response.success) {
        return {
          products: response.products,
          pagination: response.pagination
        };
      } else {
        throw new Error(response.message || 'Ошибка получения товаров');
      }
    } catch (error) {
      console.error('❌ Ошибка получения всех товаров:', error);
      return { products: [], pagination: null };
    }
  }

  // Получить бокс по ID
  async getProductById(id) {
    try {
      const response = await this.request(`/products/${id}`);
      
      if (response.success) {
        return response.product;
      } else {
        throw new Error(response.message || 'Товар не найден');
      }
    } catch (error) {
      console.error(`❌ Ошибка получения товара ${id}:`, error);
      return null;
    }
  }

  // Поиск боксов
  async searchProducts(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const response = await this.request(`/products/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.success) {
        return response.products;
      } else {
        throw new Error(response.message || 'Ошибка поиска');
      }
    } catch (error) {
      console.error('❌ Ошибка поиска товаров:', error);
      return [];
    }
  }

  // Получить похожие боксы
  async getSimilarProducts(productId, limit = 4) {
    try {
      const response = await this.request(`/products/${productId}/similar?limit=${limit}`);
      
      if (response.success) {
        return response.products;
      } else {
        throw new Error(response.message || 'Ошибка получения похожих товаров');
      }
    } catch (error) {
      console.error('❌ Ошибка получения похожих товаров:', error);
      return [];
    }
  }

  // Получить боксы по категории
  async getProductsByCategory(category, limit = 12) {
    try {
      const response = await this.request(`/products/category/${category}?limit=${limit}`);
      
      if (response.success) {
        return response.products;
      } else {
        throw new Error(response.message || 'Ошибка получения товаров по категории');
      }
    } catch (error) {
      console.error('❌ Ошибка получения товаров по категории:', error);
      return [];
    }
  }

  // Обновить рейтинг бокса
  async updateProductRating(productId, rating) {
    try {
      const response = await this.request(`/products/${productId}/rating`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      });
      
      if (response.success) {
        return response.rating;
      } else {
        throw new Error(response.message || 'Ошибка обновления рейтинга');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления рейтинга:', error);
      throw error;
    }
  }

  // ========== HEALTH CHECK ==========
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка проверки здоровья API:', error);
      return { status: 'ERROR' };
    }
  }

  // ========== UTILITIES ==========

  // Проверить доступность API
  async isApiAvailable() {
    try {
      const health = await this.checkHealth();
      return health.status === 'OK';
    } catch (error) {
      return false;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const response = await this.request('/products/stats');
      
      if (response.success) {
        return response.stats;
      } else {
        throw new Error(response.message || 'Ошибка получения статистики');
      }
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      return null;
    }
  }
}

// Создаем и экспортируем экземпляр
const apiService = new ApiService();

export default apiService;

// Экспорт отдельных методов для удобства
export const {
  getFeaturedProducts,
  getAllProducts,
  getProductById,
  searchProducts,
  getSimilarProducts,
  getProductsByCategory,
  updateProductRating,
  checkHealth,
  isApiAvailable,
  getStats
} = apiService;
const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const {
  getFeaturedProducts,
  getAllProducts,
  getProductById,
  getSimilarProducts,
  searchProducts,
  getProductsByCategory,
  updateProductRating,
  getProductsStats,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/products');

// Импортируем middleware (когда создадим)
// const { protect, authorize } = require('../middleware/auth');

// ========== ПУБЛИЧНЫЕ МАРШРУТЫ ==========

// 🌟 Главный маршрут для главной страницы - получить рекомендуемые боксы
router.get('/featured', getFeaturedProducts);

// 📋 Получить все боксы с фильтрацией и пагинацией
router.get('/', getAllProducts);

// 🔍 Поиск боксов
router.get('/search', searchProducts);

// 📊 Статистика боксов (публичная)
router.get('/stats', getProductsStats);

// 📦 Получить боксы по категории
router.get('/category/:category', getProductsByCategory);

// 🔍 Получить бокс по ID
router.get('/:id', getProductById);

// 🔄 Получить похожие боксы
router.get('/:id/similar', getSimilarProducts);

// ⭐ Обновить рейтинг бокса (публичный, но можно добавить rate limiting)
router.post('/:id/rating', updateProductRating);

// ========== ЗАЩИЩЕННЫЕ МАРШРУТЫ (ТОЛЬКО ДЛЯ АДМИНОВ) ==========
// Пока закомментированы, так как middleware auth еще не создан

// ➕ Создать новый бокс
// router.post('/', protect, authorize('admin'), createProduct);

// ✏️ Обновить бокс
// router.put('/:id', protect, authorize('admin'), updateProduct);

// 🗑️ Удалить бокс
// router.delete('/:id', protect, authorize('admin'), deleteProduct);

// ========== ВРЕМЕННЫЕ МАРШРУТЫ ДЛЯ РАЗРАБОТКИ ==========
// Убрать в продакшене!
if (process.env.NODE_ENV === 'development') {
  console.log('🚨 Включены временные админ маршруты для разработки');
  
  // Создать бокс (временно без защиты)
  router.post('/', createProduct);
  
  // Обновить бокс (временно без защиты)
  router.put('/:id', updateProduct);
  
  // Удалить бокс (временно без защиты)
  router.delete('/:id', deleteProduct);
}

module.exports = router;
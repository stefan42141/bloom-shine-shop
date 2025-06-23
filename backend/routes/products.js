const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addReview,
  getPopularProducts,
  getRecommendedProducts,
  getSearchSuggestions
} = require('../controllers/products');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Публичные маршруты
router.get('/search/suggestions', getSearchSuggestions);
router.get('/popular', getPopularProducts);
router.get('/recommended', getRecommendedProducts);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:identifier', getProductById); // ID или slug

// Приватные маршруты для пользователей
router.post('/:id/reviews', authenticate, addReview);

// Административные маршруты (требуют права админа)
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
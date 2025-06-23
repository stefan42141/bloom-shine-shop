const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/products');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Публичные маршруты
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Административные маршруты (требуют аутентификации и прав админа)
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
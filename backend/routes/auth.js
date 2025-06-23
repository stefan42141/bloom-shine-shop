const express = require('express');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  toggleWishlist
} = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Приватные маршруты (требуют аутентификации)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Управление списком желаний
router.post('/wishlist/:productId', authenticate, toggleWishlist);

module.exports = router;
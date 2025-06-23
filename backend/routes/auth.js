const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Регистрация
router.post('/register', register);

// Авторизация
router.post('/login', login);

// Получение профиля (требует аутентификации)
router.get('/profile', authenticate, getProfile);

// Обновление профиля (требует аутентификации)
router.put('/profile', authenticate, updateProfile);

module.exports = router;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Отправка токена в ответе
const sendTokenResponse = (user, statusCode, res, message = 'Успешно') => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
     .cookie('token', token, cookieOptions)
     .json({
       success: true,
       message,
       token,
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         avatar: user.avatar,
         loyaltyPoints: user.loyaltyPoints,
         emailVerified: user.emailVerified
       }
     });
};

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, newsletter } = req.body;

    // Валидация входных данных
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Пожалуйста, заполните все обязательные поля' 
      });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создание нового пользователя
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone?.trim(),
      preferences: {
        newsletter: newsletter !== false // по умолчанию true
      }
    });

    // Обновление последнего входа
    await user.updateLastLogin();

    sendTokenResponse(user, 201, res, 'Регистрация прошла успешно');

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    
    // Обработка ошибок валидации MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Ошибка валидации данных'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при регистрации' 
    });
  }
};

// @desc    Авторизация пользователя
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Введите email и пароль' 
      });
    }

    // Поиск пользователя с паролем
    const user = await User.findOne({ email: email.toLowerCase() })
                          .select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Неверные учетные данные' 
      });
    }
 
    // Проверка активности аккаунта
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Аккаунт заблокирован. Обратитесь в поддержку' 
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Неверные учетные данные' 
      });
    }

    // Обновление последнего входа
    await user.updateLastLogin();

    // Изменение времени жизни токена если включено "Запомнить меня"
    if (rememberMe) {
      process.env.JWT_EXPIRES_IN = '90d';
    }

    sendTokenResponse(user, 200, res, 'Авторизация прошла успешно');

  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при авторизации' 
    });
  }
};

// @desc    Выход из системы
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Выход из системы выполнен успешно'
    });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при выходе' 
    });
  }
};

// @desc    Получение профиля текущего пользователя
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
                          .populate('wishlist', 'name price images.main category')
                          .populate('orderHistory', 'orderNumber status.current pricing.total createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения профиля' 
    });
  }
};

// @desc    Обновление профиля пользователя
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'avatar', 'preferences'];
    const updates = {};

    // Фильтрация разрешенных полей
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Профиль обновлен успешно',
      user
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Ошибка валидации данных'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Ошибка обновления профиля' 
    });
  }
};

// @desc    Изменение пароля
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Валидация
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Заполните все поля' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Пароли не совпадают' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    // Получение пользователя с паролем
    const user = await User.findById(req.user.id).select('+password');

    // Проверка текущего пароля
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Неверный текущий пароль' 
      });
    }

    // Обновление пароля
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пароль изменен успешно'
    });
  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка изменения пароля' 
    });
  }
};

// @desc    Управление списком желаний
// @route   POST /api/auth/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    const isInWishlist = user.wishlist.includes(productId);

    if (isInWishlist) {
      await user.removeFromWishlist(productId);
      res.status(200).json({
        success: true,
        message: 'Товар удален из списка желаний',
        action: 'removed'
      });
    } else {
      await user.addToWishlist(productId);
      res.status(200).json({
        success: true,
        message: 'Товар добавлен в список желаний',
        action: 'added'
      });
    }
  } catch (error) {
    console.error('Ошибка управления списком желаний:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка обновления списка желаний' 
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  toggleWishlist
};
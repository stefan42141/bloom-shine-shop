const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки аутентификации
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Получение токена из заголовков
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Проверка наличия токена
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Токен не предоставлен'
      });
    }

    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Получение пользователя
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Аккаунт заблокирован'
        });
      }

      // Добавление пользователя в объект запроса
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Токен истек'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }

  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации'
    });
  }
};

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора'
    });
  }
};

// Middleware для проверки роли менеджера или администратора
const requireManager = (req, res, next) => {
  if (req.user && ['admin', 'manager'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права менеджера или администратора'
    });
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireManager
};
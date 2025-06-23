const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для парсинга
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Базовый маршрут для проверки работы API
app.get('/', (req, res) => {
  res.json({ 
    message: '🌸 Bloom Shine Shop API работает!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products', 
      orders: '/api/orders'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Обработка ошибок 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err.stack);
  
  // Ошибки валидации MongoDB
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: messages
    });
  }

  // Ошибки дублирования (например, email уже существует)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} уже существует`
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токен истек'
    });
  }

  // Ошибки Cast (неверный ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат ID'
    });
  }

  // Общая ошибка сервера
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Обработка необработанных отклонений Promise
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Необработанное отклонение Promise:', err.message);
  // Закрываем сервер и выходим из процесса
  server.close(() => {
    process.exit(1);
  });
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
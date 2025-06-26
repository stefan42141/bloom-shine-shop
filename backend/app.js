const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Импортируем маршруты
const productRoutes = require('./routes/products');
// const authRoutes = require('./routes/auth');
// const orderRoutes = require('./routes/orders');

// Инициализируем Express
const app = express();

// ========== MIDDLEWARE ==========

// Безопасность
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // лимит 1000 запросов на IP за 15 минут
  message: {
    success: false,
    message: 'Забагато запитів з цього IP, спробуйте пізніше'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Более строгий лимит для поиска
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 30, // 30 поисковых запросов в минуту
  message: {
    success: false,
    message: 'Забагато пошукових запитів, спробуйте через хвилину'
  }
});

app.use('/api/products/search', searchLimiter);

// ========== ЛОГИРОВАНИЕ ==========
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`${timestamp} [${method}] ${url} - ${ip}`);
  next();
});

// ========== МАРШРУТЫ API ==========

// Главная страница API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'BloomShine Shop API v1.0.0',
    endpoints: {
      products: '/api/products',
      featured: '/api/products/featured',
      search: '/api/products/search',
      // auth: '/api/auth',
      // orders: '/api/orders'
    },
    documentation: 'https://github.com/your-repo/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Подключаем маршруты
app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);

// ========== ПРОВЕРКА ЗДОРОВЬЯ СЕРВЕРА ==========
app.get('/health', (req, res) => {
  const database = require('./config/database');
  const stats = database.getStats();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: 'connected',
      collections: stats
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// ========== ОБРАБОТКА ОШИБОК ==========

// 404 - Маршрут не найден
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не знайдено',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error('🚨 Глобальная ошибка:', error);
  
  // Ошибка валидации
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Помилка валідації даних',
      errors: error.message
    });
  }
  
  // Ошибка JSON парсинга
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Неправильний формат JSON'
    });
  }
  
  // Общая ошибка сервера
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Внутрішня помилка сервера',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  });
});

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Получен SIGTERM, завершаем сервер...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Получен SIGINT, завершаем сервер...');
  process.exit(0);
});

// Запуск сервера
app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🌟========================================🌟');
  console.log('💎           BLOOMSHINE SHOP            💎');
  console.log('🌟========================================🌟');
  console.log('');
  console.log(`🚀 Сервер запущен: http://${HOST}:${PORT}`);
  console.log(`📋 API документация: http://${HOST}:${PORT}/api`);
  console.log(`❤️ Проверка здоровья: http://${HOST}:${PORT}/health`);
  console.log(`🌸 Featured боксы: http://${HOST}:${PORT}/api/products/featured`);
  console.log('');
  console.log(`📊 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 База данных: JSON файлы`);
  console.log('');
  console.log('✅ Сервер готов к работе!');
  console.log('');
});

module.exports = app;
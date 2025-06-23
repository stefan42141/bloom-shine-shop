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

// Middleware для логирования запросов (улучшенный)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📝 ${timestamp} - ${method} ${url} - IP: ${ip}`);
  
  // Логирование времени выполнения запроса
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`${statusColor} ${method} ${url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Middleware для безопасности
app.use((req, res, next) => {
  // Базовые заголовки безопасности
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Базовый маршрут для проверки работы API (только наши 3 endpoint)
app.get('/', (req, res) => {
  res.json({ 
    message: '🌸 Bloom Shine Shop API работает!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products', 
      orders: '/api/orders'
    },
    documentation: {
      swagger: '/api/docs',
      postman: '/api/postman'
    }
  });
});

// Health check endpoint (расширенный)
app.get('/health', async (req, res) => {
  try {
    // Проверка подключения к базе данных
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'N/A'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      services: {
        auth: 'operational',
        products: 'operational',
        orders: 'operational'
      }
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Bloom Shine Shop API',
    version: '1.0.0',
    description: 'REST API для интернет-магазина цветов',
    endpoints: {
      auth: {
        base: '/api/auth',
        methods: ['POST /register', 'POST /login', 'GET /profile', 'PUT /profile']
      },
      products: {
        base: '/api/products',
        methods: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id']
      },
      orders: {
        base: '/api/orders',
        methods: ['GET /', 'GET /:id', 'POST /', 'PATCH /:id/status']
      }
    }
  });
});

// API маршруты - только те, что в нашей структуре
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Middleware для обработки несуществующих маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint не найден',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: ['/api/auth', '/api/products', '/api/orders'],
    timestamp: new Date().toISOString()
  });
});

// Обработка всех остальных маршрутов
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Страница не найдена',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Используйте /api для доступа к API',
    timestamp: new Date().toISOString()
  });
});

// Улучшенная глобальная обработка ошибок
app.use((err, req, res, next) => {
  // Логирование ошибки
  console.error('❌ Ошибка сервера:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Ошибки валидации MongoDB
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Ошибка валидации данных',
      details: messages,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки дублирования (например, email уже существует)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      error: 'DuplicateError',
      message: `${field} "${value}" уже существует`,
      field,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'AuthenticationError',
      message: 'Недействительный токен доступа',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TokenExpiredError',
      message: 'Срок действия токена истек',
      expiredAt: err.expiredAt,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки Cast (неверный ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'CastError',
      message: `Неверный формат ${err.path}: ${err.value}`,
      field: err.path,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки подключения к базе данных
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      error: 'DatabaseError',
      message: 'Ошибка подключения к базе данных',
      timestamp: new Date().toISOString()
    });
  }

  // Общая ошибка сервера
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM получен. Graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT получен. Graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
    process.exit(0);
  });
});

// Обработка необработанных отклонений Promise
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Необработанное отклонение Promise:', {
    message: err.message,
    stack: err.stack,
    promise,
    timestamp: new Date().toISOString()
  });
  
  // Закрываем сервер и выходим из процесса
  server.close(() => {
    console.log('🔴 Сервер закрыт из-за необработанного отклонения Promise');
    process.exit(1);
  });
});

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  console.error('💥 Необработанное исключение:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  console.log('🔴 Аварийное завершение работы...');
  process.exit(1);
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🌸 Bloom Shine Shop API запущен!');
  console.log('🚀 ========================================');
  console.log(`📡 Порт: ${PORT}`);
  console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/`);
  console.log('🚀 ========================================');
});

// Экспорт приложения для тестирования
module.exports = app;
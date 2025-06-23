const fs = require('fs');
const path = require('path');

// Создаем папку data если её нет
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// JSON базы данных
const jsonDB = {
  users: path.join(DATA_DIR, 'users.json'),
  products: path.join(DATA_DIR, 'products.json'),
  orders: path.join(DATA_DIR, 'orders.json')
};

// Создаем файлы если их нет
Object.values(jsonDB).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]');
  }
});

// Функции для работы с JSON
const readData = (collection) => {
  try {
    const data = fs.readFileSync(jsonDB[collection], 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Ошибка чтения ${collection}:`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  try {
    fs.writeFileSync(jsonDB[collection], JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Ошибка записи ${collection}:`, error);
    return false;
  }
};

// Функция подключения к JSON БД
const connectDB = () => {
  try {
    console.log('📁 ========================================');
    console.log('🗄️ Используется JSON файловая система');
    console.log('📁 ========================================');
    console.log(`📂 Данные хранятся в: ${DATA_DIR}`);
    console.log(`👤 Пользователи: users.json`);
    console.log(`📦 Товары: products.json`);
    console.log(`📋 Заказы: orders.json`);
    console.log('📁 ========================================');
  } catch (error) {
    console.error('❌ Ошибка инициализации JSON БД:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  readData,
  writeData
};
// Добавьте эту строку для совместимости
module.exports.default = connectDB;
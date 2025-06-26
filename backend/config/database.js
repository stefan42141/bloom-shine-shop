const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
  }

  // Убеждаемся что папка data существует
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Получить путь к файлу
  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  // Прочитать данные из файла
  readData(collection) {
    try {
      const filePath = this.getFilePath(collection);
      
      if (!fs.existsSync(filePath)) {
        this.writeData(collection, []);
        return [];
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Ошибка чтения ${collection}.json:`, error);
      return [];
    }
  }

  // Записать данные в файл
  writeData(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Ошибка записи ${collection}.json:`, error);
      return false;
    }
  }

  // Найти все записи
  find(collection, query = {}) {
    const data = this.readData(collection);
    
    if (Object.keys(query).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key] !== null) {
          // Поддержка операторов типа { price: { $gte: 100, $lte: 500 } }
          const operators = query[key];
          return Object.keys(operators).every(operator => {
            switch (operator) {
              case '$gte':
                return item[key] >= operators[operator];
              case '$lte':
                return item[key] <= operators[operator];
              case '$gt':
                return item[key] > operators[operator];
              case '$lt':
                return item[key] < operators[operator];
              case '$ne':
                return item[key] !== operators[operator];
              case '$in':
                return operators[operator].includes(item[key]);
              default:
                return item[key] === operators[operator];
            }
          });
        }
        return item[key] === query[key];
      });
    });
  }

  // Найти одну запись
  findOne(collection, query) {
    const results = this.find(collection, query);
    return results.length > 0 ? results[0] : null;
  }

  // Найти по ID
  findById(collection, id) {
    return this.findOne(collection, { _id: id });
  }

  // Создать новую запись
  create(collection, data) {
    const allData = this.readData(collection);
    const newId = this.generateId();
    
    const newRecord = {
      _id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    allData.push(newRecord);
    
    if (this.writeData(collection, allData)) {
      return newRecord;
    }
    
    throw new Error('Ошибка создания записи');
  }

  // Обновить запись
  updateById(collection, id, updateData) {
    const allData = this.readData(collection);
    const index = allData.findIndex(item => item._id === id);
    
    if (index === -1) {
      return null;
    }

    allData[index] = {
      ...allData[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (this.writeData(collection, allData)) {
      return allData[index];
    }

    throw new Error('Ошибка обновления записи');
  }

  // Удалить запись
  deleteById(collection, id) {
    const allData = this.readData(collection);
    const index = allData.findIndex(item => item._id === id);
    
    if (index === -1) {
      return null;
    }

    const deletedRecord = allData[index];
    allData.splice(index, 1);

    if (this.writeData(collection, allData)) {
      return deletedRecord;
    }

    throw new Error('Ошибка удаления записи');
  }

  // Подсчет записей
  count(collection, query = {}) {
    return this.find(collection, query).length;
  }

  // Сортировка и лимит
  findWithOptions(collection, query = {}, options = {}) {
    let results = this.find(collection, query);

    // Сортировка
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      
      results.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }

    // Пагинация
    if (options.skip) {
      results = results.slice(options.skip);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  // Генерация уникального ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Инициализация коллекций
  initializeCollections() {
    const collections = ['products', 'users', 'orders', 'categories'];
    
    collections.forEach(collection => {
      const filePath = this.getFilePath(collection);
      if (!fs.existsSync(filePath)) {
        this.writeData(collection, []);
        console.log(`✅ Инициализирована коллекция: ${collection}`);
      }
    });
  }

  // Очистить коллекцию
  clearCollection(collection) {
    return this.writeData(collection, []);
  }

  // Получить статистику
  getStats() {
    const collections = ['products', 'users', 'orders'];
    const stats = {};

    collections.forEach(collection => {
      const data = this.readData(collection);
      stats[collection] = {
        count: data.length,
        size: JSON.stringify(data).length,
        lastModified: new Date().toISOString()
      };
    });

    return stats;
  }
}

// Создаем экземпляр базы данных
const database = new JSONDatabase();

// Инициализируем коллекции при первом запуске
database.initializeCollections();

module.exports = database;
const database = require('../config/database');

class Product {
  constructor() {
    this.collection = 'products';
  }

  // Схема валидации товара
  validateProduct(productData) {
    const errors = [];

    // Обязательные поля
    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('Название товара должно содержать минимум 2 символа');
    }

    if (!productData.category || productData.category.trim().length < 2) {
      errors.push('Категория обязательна');
    }

    if (!productData.price || productData.price < 0) {
      errors.push('Цена должна быть положительным числом');
    }

    if (!productData.images || !productData.images.main) {
      errors.push('Главное изображение обязательно');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Создать товар с полной структурой
  async create(productData) {
    // Валидация
    const validation = this.validateProduct(productData);
    if (!validation.isValid) {
      throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
    }

    // Структура товара по схеме BloomShine
    const product = {
      // === ОСНОВНАЯ ИНФОРМАЦИЯ ===
      name: productData.name.trim(),
      slug: this.generateSlug(productData.name),
      category: productData.category.trim(),
      subcategory: productData.subcategory || null,
      shortDescription: productData.shortDescription || '',
      fullDescription: productData.fullDescription || '',
      
      // === ЦЕНООБРАЗОВАНИЕ ===
      price: Number(productData.price),
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
      discount: productData.oldPrice ? 
        Math.round(((productData.oldPrice - productData.price) / productData.oldPrice) * 100) : 0,
      
      // === ИЗОБРАЖЕНИЯ ===
      images: {
        main: productData.images.main,
        gallery: productData.images.gallery || [],
        thumbnail: productData.images.thumbnail || productData.images.main
      },
      
      // === РЕЙТИНГ И ОТЗЫВЫ ===
      rating: {
        average: productData.rating?.average || 0,
        count: productData.rating?.count || 0,
        breakdown: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      },
      reviewsCount: productData.reviewsCount || 0,
      
      // === СТАТУСЫ ===
      inStock: productData.inStock !== false,
      stockQuantity: productData.stockQuantity || 999,
      featured: productData.featured || false,
      luxury: productData.luxury || false,
      isActive: productData.isActive !== false,
      
      // === БЕЙДЖИ И МЕТКИ ===
      badge: productData.badge || null,
      tags: productData.tags || [],
      
      // === ХАРАКТЕРИСТИКИ ===
      specifications: {
        composition: productData.specifications?.composition || [],
        size: productData.specifications?.size || '',
        color: productData.specifications?.color || '',
        style: productData.specifications?.style || '',
        occasion: productData.specifications?.occasion || [],
        care: productData.specifications?.care || '',
        lifespan: productData.specifications?.lifespan || '',
        aromaticProfile: productData.specifications?.aromaticProfile || {}
      },
      
      // === ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ ===
      services: {
        freeDelivery: productData.services?.freeDelivery || false,
        expressDelivery: productData.services?.expressDelivery || false,
        giftWrap: productData.services?.giftWrap || false,
        greetingCard: productData.services?.greetingCard || false,
        customization: productData.services?.customization || false
      },
      
      // === ВАРИАНТЫ ТОВАРА ===
      variants: productData.variants || [],
      
      // === SEO ===
      seo: {
        title: productData.seo?.title || productData.name,
        description: productData.seo?.description || productData.shortDescription,
        keywords: productData.seo?.keywords || []
      },
      
      // === МЕТРИКИ ===
      metrics: {
        views: 0,
        purchases: 0,
        wishlistCount: 0,
        shareCount: 0
      },
      
      // === ВРЕМЕННЫЕ МЕТКИ ===
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return database.create(this.collection, product);
  }

  // Получить все товары с фильтрацией
  async getAll(filters = {}, options = {}) {
    const query = {};
    
    // Фильтр по категории
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }
    
    // Фильтр по цене
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }
    
    // Фильтр по наличию
    if (filters.inStock !== undefined) {
      query.inStock = filters.inStock;
    }
    
    // Фильтр по luxury статусу
    if (filters.luxury !== undefined) {
      query.luxury = filters.luxury;
    }
    
    // Активные товары по умолчанию
    query.isActive = true;

    return database.findWithOptions(this.collection, query, options);
  }

  // Получить рекомендуемые товары для главной страницы
  async getFeatured(limit = 5) {
    const query = {
      featured: true,
      inStock: true,
      isActive: true
    };
    
    const options = {
      limit,
      sort: { createdAt: -1 }
    };

    return database.findWithOptions(this.collection, query, options);
  }

  // Получить товар по ID
  async getById(id) {
    const product = database.findById(this.collection, id);
    
    if (product) {
      // Увеличиваем счетчик просмотров
      this.incrementViews(id);
    }
    
    return product;
  }

  // Получить товар по slug
  async getBySlug(slug) {
    return database.findOne(this.collection, { slug, isActive: true });
  }

  // Обновить товар
  async update(id, updateData) {
    if (updateData.name) {
      updateData.slug = this.generateSlug(updateData.name);
    }
    
    return database.updateById(this.collection, id, updateData);
  }

  // Удалить товар (мягкое удаление)
  async delete(id) {
    return database.updateById(this.collection, id, { 
      isActive: false,
      deletedAt: new Date().toISOString()
    });
  }

  // Поиск товаров
  async search(searchTerm) {
    const allProducts = database.find(this.collection, { isActive: true });
    
    const searchLower = searchTerm.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.shortDescription.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Получить товары по категории
  async getByCategory(category, limit = 12) {
    const query = {
      category,
      inStock: true,
      isActive: true
    };
    
    return database.findWithOptions(this.collection, query, { limit });
  }

  // Получить похожие товары
  async getSimilar(productId, limit = 4) {
    const product = await this.getById(productId);
    if (!product) return [];
    
    const query = {
      category: product.category,
      _id: { $ne: productId },
      inStock: true,
      isActive: true
    };
    
    return database.findWithOptions(this.collection, query, { limit });
  }

  // Увеличить счетчик просмотров
  async incrementViews(id) {
    const product = database.findById(this.collection, id);
    if (product) {
      const newMetrics = {
        ...product.metrics,
        views: (product.metrics?.views || 0) + 1
      };
      
      database.updateById(this.collection, id, { metrics: newMetrics });
    }
  }

  // Обновить рейтинг товара
  async updateRating(id, newRating) {
    const product = database.findById(this.collection, id);
    if (!product) return null;
    
    const currentRating = product.rating || { average: 0, count: 0 };
    const newCount = currentRating.count + 1;
    const newAverage = ((currentRating.average * currentRating.count) + newRating) / newCount;
    
    const updatedRating = {
      average: Math.round(newAverage * 10) / 10,
      count: newCount
    };
    
    return database.updateById(this.collection, id, { rating: updatedRating });
  }

  // Получить статистику товаров
  async getStats() {
    const allProducts = database.find(this.collection);
    
    return {
      total: allProducts.length,
      active: allProducts.filter(p => p.isActive).length,
      featured: allProducts.filter(p => p.featured).length,
      luxury: allProducts.filter(p => p.luxury).length,
      inStock: allProducts.filter(p => p.inStock).length,
      outOfStock: allProducts.filter(p => !p.inStock).length,
      byCategory: this.getProductsByCategory(allProducts)
    };
  }

  // Группировка по категориям
  getProductsByCategory(products) {
    return products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
  }

  // Генерация slug из названия
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0400-\u04FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Валидация и очистка данных при обновлении
  sanitizeUpdateData(data) {
    const allowedFields = [
      'name', 'category', 'subcategory', 'shortDescription', 'fullDescription',
      'price', 'oldPrice', 'images', 'inStock', 'stockQuantity', 'featured',
      'luxury', 'badge', 'tags', 'specifications', 'services', 'variants', 'seo'
    ];
    
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitized[key] = data[key];
      }
    });
    
    return sanitized;
  }
}

module.exports = new Product();
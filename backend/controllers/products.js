const Product = require('../models/Product');

// ========== ПОЛУЧИТЬ РЕКОМЕНДУЕМЫЕ БОКСЫ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ==========
exports.getFeaturedProducts = async (req, res) => {
  try {
    console.log('🌟 Запрос рекомендуемых боксов для главной страницы...');
    
    // Получаем 5 featured боксов
    const featuredBoxes = await Product.getFeatured(5);
    
    if (!featuredBoxes || featuredBoxes.length === 0) {
      console.log('⚠️ Рекомендуемые боксы не найдены');
      return res.status(200).json({
        success: true,
        message: 'Немає рекомендованих ароматичних боксів',
        products: [],
        count: 0
      });
    }

    console.log(`✅ Найдено ${featuredBoxes.length} рекомендуемых боксов`);
    
    // Форматируем данные для frontend
    const formattedBoxes = featuredBoxes.map(box => ({
      _id: box._id,
      name: box.name,
      category: box.category,
      shortDescription: box.shortDescription,
      price: box.price,
      oldPrice: box.oldPrice,
      discount: box.discount,
      images: {
        main: box.images.main,
        thumbnail: box.images.thumbnail || box.images.main
      },
      rating: box.rating.average,
      reviewsCount: box.reviewsCount,
      badge: box.badge,
      luxury: box.luxury,
      featured: box.featured,
      inStock: box.inStock,
      // Специфичные поля для аромабоксов
      aromaticProfile: box.specifications?.aromaticProfile,
      mood: box.specifications?.mood,
      ingredients: box.specifications?.composition
    }));

    res.status(200).json({
      success: true,
      count: formattedBoxes.length,
      products: formattedBoxes
    });

  } catch (error) {
    console.error('❌ Ошибка получения рекомендуемых боксов:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при отриманні рекомендованих боксів',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== ПОЛУЧИТЬ ВСЕ БОКСЫ С ФИЛЬТРАЦИЕЙ ==========
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      luxury,
      inStock,
      aromaticFamily // Новый фильтр для ароматических семей
    } = req.query;

    console.log('📋 Запрос всех боксов с фильтрами:', req.query);

    // Настройка фильтров
    const filters = {};
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (minPrice || maxPrice) {
      filters.minPrice = minPrice ? Number(minPrice) : undefined;
      filters.maxPrice = maxPrice ? Number(maxPrice) : undefined;
    }
    
    if (luxury !== undefined) {
      filters.luxury = luxury === 'true';
    }
    
    if (inStock !== undefined) {
      filters.inStock = inStock === 'true';
    }

    // Настройка сортировки
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Настройка пагинации
    const skip = (Number(page) - 1) * Number(limit);
    const options = {
      sort: sortOptions,
      skip,
      limit: Number(limit)
    };

    let products;
    
    // Поиск или обычный запрос
    if (search && search.trim()) {
      products = await Product.search(search.trim());
      // Применяем дополнительные фильтры к результатам поиска
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.luxury !== undefined) {
        products = products.filter(p => p.luxury === filters.luxury);
      }
      // Ручная пагинация для поиска
      products = products.slice(skip, skip + Number(limit));
    } else {
      products = await Product.getAll(filters, options);
    }

    // Получаем общее количество для пагинации
    const totalProducts = await Product.getAll(filters);
    const totalPages = Math.ceil(totalProducts.length / Number(limit));

    console.log(`✅ Найдено ${products.length} боксов из ${totalProducts.length}`);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts: totalProducts.length,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
        limit: Number(limit)
      },
      filters: {
        category,
        minPrice: Number(minPrice) || 0,
        maxPrice: Number(maxPrice) || 999999,
        luxury,
        inStock
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения боксов:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при отриманні боксів'
    });
  }
};

// ========== ПОЛУЧИТЬ БОКС ПО ID ==========
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Запрос бокса по ID: ${id}`);

    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ароматичний бокс не знайдено'
      });
    }

    console.log(`✅ Найден бокс: ${product.name}`);

    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('❌ Ошибка получения бокса:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера при отриманні бокса'
    });
  }
};

// ========== ПОЛУЧИТЬ ПОХОЖИЕ БОКСЫ ==========
exports.getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    console.log(`🔄 Запрос похожих боксов для ID: ${id}`);

    const similarProducts = await Product.getSimilar(id, Number(limit));

    res.status(200).json({
      success: true,
      products: similarProducts,
      count: similarProducts.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения похожих боксов:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання схожих боксів'
    });
  }
};

// ========== ПОИСК БОКСОВ ==========
exports.searchProducts = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Пошуковий запит повинен містити мінімум 2 символи'
      });
    }

    console.log(`🔍 Поиск боксов: "${searchTerm}"`);

    const searchResults = await Product.search(searchTerm.trim());

    res.status(200).json({
      success: true,
      products: searchResults,
      count: searchResults.length,
      searchTerm: searchTerm.trim()
    });

  } catch (error) {
    console.error('❌ Ошибка поиска боксов:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка пошуку боксів'
    });
  }
};

// ========== ПОЛУЧИТЬ БОКСЫ ПО КАТЕГОРИИ ==========
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    console.log(`📦 Запрос боксов по категории: ${category}`);

    const products = await Product.getByCategory(category, Number(limit));

    res.status(200).json({
      success: true,
      products,
      count: products.length,
      category
    });

  } catch (error) {
    console.error('❌ Ошибка получения боксов по категории:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання боксів по категорії'
    });
  }
};

// ========== ОБНОВИТЬ РЕЙТИНГ БОКСА ==========
exports.updateProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Рейтинг повинен бути від 1 до 5'
      });
    }

    console.log(`⭐ Обновление рейтинга бокса ${id}: ${rating}`);

    const updatedProduct = await Product.updateRating(id, Number(rating));

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Бокс не знайдено'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Рейтинг оновлено',
      rating: updatedProduct.rating
    });

  } catch (error) {
    console.error('❌ Ошибка обновления рейтинга:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення рейтингу'
    });
  }
};

// ========== ПОЛУЧИТЬ СТАТИСТИКУ БОКСОВ ==========
exports.getProductsStats = async (req, res) => {
  try {
    console.log('📊 Запрос статистики боксов');

    const stats = await Product.getStats();

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання статистики'
    });
  }
};

// ========== АДМИНИСТРАТИВНЫЕ ФУНКЦИИ ==========

// Создать новый бокс (только для админов)
exports.createProduct = async (req, res) => {
  try {
    console.log('➕ Создание нового ароматического бокса');

    const newProduct = await Product.create(req.body);

    console.log(`✅ Создан новый бокс: ${newProduct.name}`);

    res.status(201).json({
      success: true,
      message: 'Ароматичний бокс створено',
      product: newProduct
    });

  } catch (error) {
    console.error('❌ Ошибка создания бокса:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Обновить бокс (только для админов)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Обновление бокса ID: ${id}`);

    const sanitizedData = Product.sanitizeUpdateData(req.body);
    const updatedProduct = await Product.update(id, sanitizedData);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Бокс не знайдено'
      });
    }

    console.log(`✅ Обновлен бокс: ${updatedProduct.name}`);

    res.status(200).json({
      success: true,
      message: 'Бокс оновлено',
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ Ошибка обновления бокса:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Удалить бокс (только для админов)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Удаление бокса ID: ${id}`);

    const deletedProduct = await Product.delete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Бокс не знайдено'
      });
    }

    console.log(`✅ Удален бокс: ${deletedProduct.name}`);

    res.status(200).json({
      success: true,
      message: 'Бокс видалено'
    });

  } catch (error) {
    console.error('❌ Ошибка удаления бокса:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення бокса'
    });
  }
};
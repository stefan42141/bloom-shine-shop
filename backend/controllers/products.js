const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Получить все товары с фильтрацией и сортировкой
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      occasion,
      inStock,
      featured,
      trending,
      bestSeller,
      newArrival,
      rating,
      colors,
      flowerTypes
    } = req.query;

    // Построение фильтра
    const filter = { 'availability.isAvailable': true };
    
    // Фильтр по категории
    if (category) {
      filter.category = category;
    }
    
    // Фильтр по подкатегории
    if (subcategory) {
      filter.subcategory = subcategory;
    }
    
    // Фильтр по цене
    if (minPrice || maxPrice) {
      filter['price.current'] = {};
      if (minPrice) filter['price.current'].$gte = Number(minPrice);
      if (maxPrice) filter['price.current'].$lte = Number(maxPrice);
    }
    
    // Поиск по тексту
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Фильтр по поводу
    if (occasion) {
      filter['specifications.occasion'] = { $in: occasion.split(',') };
    }
    
    // Фильтр по наличию
    if (inStock === 'true') {
      filter['inventory.inStock'] = { $gt: 0 };
    }
    
    // Специальные фильтры
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;
    if (bestSeller === 'true') filter.bestSeller = true;
    if (newArrival === 'true') filter.newArrival = true;
    
    // Фильтр по рейтингу
    if (rating) {
      filter['ratings.average'] = { $gte: Number(rating) };
    }
    
    // Фильтр по цветам
    if (colors) {
      filter['specifications.colors'] = { $in: colors.split(',') };
    }
    
    // Фильтр по типам цветов
    if (flowerTypes) {
      filter['specifications.flowerTypes'] = { $in: flowerTypes.split(',') };
    }

    // Построение сортировки
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    }
    
    switch (sortBy) {
      case 'price-asc':
        sort['price.current'] = 1;
        break;
      case 'price-desc':
        sort['price.current'] = -1;
        break;
      case 'rating':
        sort['ratings.average'] = -1;
        break;
      case 'popularity':
        sort['sales.totalSold'] = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'name':
        sort.name = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    // Получение товаров
    const products = await Product.find(filter)
      .select('-reviews') // Исключаем отзывы для списка
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Подсчет общего количества
    const total = await Product.countDocuments(filter);

    // Получение доступных фильтров
    const availableFilters = await getAvailableFilters(filter);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
        limit: Number(limit)
      },
      filters: availableFilters,
      appliedFilters: {
        category,
        subcategory,
        minPrice,
        maxPrice,
        search,
        occasion,
        inStock,
        rating,
        colors,
        flowerTypes
      }
    });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения товаров' 
    });
  }
};

// Вспомогательная функция для получения доступных фильтров
const getAvailableFilters = async (baseFilter) => {
  try {
    const pipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          subcategories: { $addToSet: '$subcategory' },
          occasions: { $addToSet: '$specifications.occasion' },
          colors: { $addToSet: '$specifications.colors' },
          flowerTypes: { $addToSet: '$specifications.flowerTypes' },
          minPrice: { $min: '$price.current' },
          maxPrice: { $max: '$price.current' },
          avgRating: { $avg: '$ratings.average' }
        }
      }
    ];

    const [filters] = await Product.aggregate(pipeline);
    
    return {
      categories: filters?.categories?.filter(Boolean) || [],
      subcategories: filters?.subcategories?.filter(Boolean) || [],
      occasions: filters?.occasions?.flat()?.filter(Boolean) || [],
      colors: filters?.colors?.flat()?.filter(Boolean) || [],
      flowerTypes: filters?.flowerTypes?.flat()?.filter(Boolean) || [],
      priceRange: {
        min: filters?.minPrice || 0,
        max: filters?.maxPrice || 0
      }
    };
  } catch (error) {
    console.error('Ошибка получения фильтров:', error);
    return {};
  }
};

// @desc    Получить товар по ID или slug
// @route   GET /api/products/:identifier
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Определяем, это ID или slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const product = await Product.findOne(query)
      .populate('reviews.user', 'name avatar')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Товар не найден' 
      });
    }

    // Получение похожих товаров
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      'availability.isAvailable': true
    })
    .select('name price images.main ratings slug')
    .limit(4)
    .lean();

    // Увеличение счетчика просмотров (если нужно)
    // await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения товара' 
    });
  }
};

// @desc    Создать новый товар
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // Добавляем ID создателя
    req.body.createdBy = req.user.id;
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Товар создан успешно',
      product
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Ошибка валидации данных'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Ошибка создания товара' 
    });
  }
};

// @desc    Обновить товар
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Товар не найден' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Товар обновлен успешно',
      product
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Ошибка валидации данных'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Ошибка обновления товара' 
    });
  }
};

// @desc    Удалить товар
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Товар не найден' 
      });
    }

    // Мягкое удаление - просто делаем недоступным
    product.availability.isAvailable = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Товар удален успешно'
    });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка удаления товара' 
    });
  }
};

// @desc    Получить категории и их количество
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { 'availability.isAvailable': true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          subcategories: {
            $filter: {
              input: '$subcategories',
              cond: { $ne: ['$$this', null] }
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    const categories = await Product.aggregate(pipeline);
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения категорий' 
    });
  }
};

// @desc    Добавить отзыв к товару
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Проверка существования товара
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Товар не найден' 
      });
    }

    // Проверка, не оставлял ли пользователь уже отзыв
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'Вы уже оставили отзыв на этот товар' 
      });
    }

    // Добавление отзыва
    await product.addReview(userId, rating, comment, images);

    const updatedProduct = await Product.findById(productId)
      .populate('reviews.user', 'name avatar')
      .select('reviews ratings');

    res.status(201).json({
      success: true,
      message: 'Отзыв добавлен успешно',
      reviews: updatedProduct.reviews,
      ratings: updatedProduct.ratings
    });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка добавления отзыва' 
    });
  }
};

// @desc    Получить популярные товары
// @route   GET /api/products/popular
// @access  Public
const getPopularProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      'availability.isAvailable': true
    })
    .select('name price images.main ratings sales.totalSold slug')
    .sort({ 'sales.totalSold': -1, 'ratings.average': -1 })
    .limit(Number(limit))
    .lean();

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Ошибка получения популярных товаров:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения популярных товаров' 
    });
  }
};

// @desc    Получить рекомендуемые товары
// @route   GET /api/products/recommended
// @access  Public/Private
const getRecommendedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    let products;

    if (req.user) {
      // Персонализированные рекомендации для авторизованных пользователей
      const user = await User.findById(req.user.id).populate('wishlist orderHistory');
      
      // Логика рекомендаций на основе истории покупок и списка желаний
      // Здесь можно добавить более сложную логику ML
      
      products = await Product.find({
        'availability.isAvailable': true,
        _id: { $nin: user.wishlist }
      })
      .select('name price images.main ratings slug')
      .sort({ featured: -1, 'ratings.average': -1 })
      .limit(Number(limit))
      .lean();
    } else {
      // Общие рекомендации для неавторизованных пользователей
      products = await Product.find({
        'availability.isAvailable': true,
        $or: [
          { featured: true },
          { trending: true },
          { bestSeller: true }
        ]
      })
      .select('name price images.main ratings slug')
      .sort({ 'ratings.average': -1 })
      .limit(Number(limit))
      .lean();
    }

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Ошибка получения рекомендаций:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка получения рекомендаций' 
    });
  }
};

// @desc    Поиск товаров с автодополнением
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Запрос должен содержать минимум 2 символа' 
      });
    }

    const suggestions = await Product.find({
      'availability.isAvailable': true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'description.short': { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name slug images.thumbnail price.current')
    .limit(Number(limit))
    .lean();

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Ошибка поиска предложений:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка поиска' 
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addReview,
  getPopularProducts,
  getRecommendedProducts,
  getSearchSuggestions
};
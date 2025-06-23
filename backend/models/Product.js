const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  images: [String]
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название товара обязательно'],
    trim: true,
    maxlength: [100, 'Название не может превышать 100 символов']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    short: {
      type: String,
      required: [true, 'Краткое описание обязательно'],
      maxlength: [200, 'Краткое описание не может превышать 200 символов']
    },
    full: {
      type: String,
      required: [true, 'Полное описание обязательно'],
      maxlength: [2000, 'Описание не может превышать 2000 символов']
    }
  },
  price: {
    current: {
      type: Number,
      required: [true, 'Цена обязательна'],
      min: [0, 'Цена не может быть отрицательной']
    },
    original: {
      type: Number,
      validate: {
        validator: function(v) {
          return !v || v >= this.price.current;
        },
        message: 'Первоначальная цена должна быть больше текущей'
      }
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    enum: {
      values: [
        'букеты',
        'композиции', 
        'комнатные-растения',
        'садовые-цветы',
        'свадебные-букеты',
        'праздничные-композиции',
        'подарочные-наборы',
        'аксессуары',
        'горшки-и-вазы',
        'уход-за-растениями'
      ],
      message: 'Категория должна быть из допустимого списка'
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: {
    main: {
      type: String,
      required: [true, 'Главное изображение обязательно']
    },
    gallery: [String],
    thumbnail: String
  },
  inventory: {
    inStock: {
      type: Number,
      required: true,
      min: [0, 'Количество не может быть отрицательным'],
      default: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    minStock: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    seasonalAvailability: {
      start: Date,
      end: Date
    },
    preOrder: {
      type: Boolean,
      default: false
    },
    estimatedDelivery: {
      min: Number, // дни
      max: Number  // дни
    }
  },
  specifications: {
    dimensions: {
      height: Number, // см
      width: Number,  // см
      depth: Number   // см
    },
    weight: Number, // грамм
    colors: [String],
    materials: [String],
    flowerTypes: [String],
    occasion: [{
      type: String,
      enum: [
        'день-рождения',
        'свадьба',
        '8-марта',
        'день-святого-валентина',
        'новый-год',
        'выпускной',
        'юбилей',
        'романтическое-свидание',
        'извинения',
        'благодарность',
        'соболезнования',
        'корпоративные-события',
        'другое'
      ]
    }]
  },
  care: {
    instructions: String,
    difficulty: {
      type: String,
      enum: ['легкий', 'средний', 'сложный'],
      default: 'средний'
    },
    tips: [String]
  },
  tags: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: v => Math.round(v * 10) / 10 // Округление до 1 знака
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  reviews: [reviewSchema],
  sales: {
    totalSold: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    lastSale: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
productSchema.virtual('finalPrice').get(function() {
  if (this.price.discount > 0) {
    return this.price.current * (1 - this.price.discount / 100);
  }
  return this.price.current;
});

productSchema.virtual('isInStock').get(function() {
  return this.inventory.inStock > 0 && this.availability.isAvailable;
});

productSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.inventory.inStock - this.inventory.reserved);
});

productSchema.virtual('isLowStock').get(function() {
  return this.inventory.inStock <= this.inventory.minStock;
});

productSchema.virtual('discountAmount').get(function() {
  if (this.price.original && this.price.discount > 0) {
    return this.price.original - this.finalPrice;
  }
  return 0;
});

// Индексы
productSchema.index({ name: 'text', 'description.full': 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'price.current': 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ trending: -1 });
productSchema.index({ bestSeller: -1 });
productSchema.index({ 'availability.isAvailable': 1 });
productSchema.index({ slug: 1 });

// Middleware
productSchema.pre('save', function(next) {
  // Создание slug из названия
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Zа-яА-Я0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Автоматическое обновление availability
  if (this.inventory.inStock <= 0) {
    this.availability.isAvailable = false;
  }
  
  next();
});

// Методы схемы
productSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  
  this.updateRatings();
  return this.save();
};

productSchema.methods.updateRatings = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
    return;
  }
  
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = total / this.reviews.length;
  this.ratings.count = this.reviews.length;
  
  // Обновление распределения оценок
  this.ratings.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.reviews.forEach(review => {
    this.ratings.distribution[review.rating]++;
  });
};

productSchema.methods.updateInventory = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.inventory.inStock = Math.max(0, this.inventory.inStock - quantity);
  } else {
    this.inventory.inStock += quantity;
  }
  
  if (this.inventory.inStock <= 0) {
    this.availability.isAvailable = false;
  }
  
  return this.save();
};

productSchema.methods.recordSale = function(quantity, price) {
  this.sales.totalSold += quantity;
  this.sales.revenue += (price * quantity);
  this.sales.lastSale = new Date();
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
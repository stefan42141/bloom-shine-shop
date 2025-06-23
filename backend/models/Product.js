const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название товара обязательно'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Описание товара обязательно']
  },
  price: {
    type: Number,
    required: [true, 'Цена обязательна'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    enum: ['букеты', 'комнатные растения', 'садовые цветы', 'подарки', 'аксессуары']
  },
  images: [{
    type: String,
    required: true
  }],
  inStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  dimensions: {
    height: Number,
    width: Number,
    depth: Number
  },
  careInstructions: {
    type: String
  },
  occasion: [{
    type: String,
    enum: ['день рождения', 'свадьба', '8 марта', 'день святого валентина', 'выпускной', 'юбилей', 'другое']
  }]
}, {
  timestamps: true
});

// Индексы для поиска
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Product', productSchema);
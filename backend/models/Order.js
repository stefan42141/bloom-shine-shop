const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Количество должно быть больше 0']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  customization: {
    message: String,
    wrapping: {
      type: String,
      enum: ['standard', 'premium', 'luxury', 'none'],
      default: 'standard'
    },
    ribbon: {
      color: String,
      text: String
    }
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      code: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'loyalty'],
        default: 'fixed'
      }
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    current: {
      type: String, 
      enum: [
        'pending',
        'confirmed', 
        'processing',
        'preparing',
        'ready',
        'out-for-delivery',
        'delivered',
        'cancelled',
        'refunded'
      ],
      default: 'pending'
    },
    history: [{
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  delivery: {
    type: {
      type: String,
      enum: ['standard', 'express', 'same-day', 'pickup'],
      default: 'standard'
    },
    address: {
      recipient: {
        name: {
          type: String,
          required: true
        },
        phone: {
          type: String,
          required: true
        }
      },
      street: {
        type: String,
        required: true
      },
      apartment: String,
      city: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'Россия'
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    schedule: {
      preferredDate: {
        type: Date,
        required: true
      },
      timeSlot: {
        type: String,
        enum: [
          '09:00-12:00',
          '12:00-15:00', 
          '15:00-18:00',
          '18:00-21:00',
          'any-time'
        ],
        default: 'any-time'
      },
      isUrgent: {
        type: Boolean,
        default: false
      }
    },
    instructions: {
      special: String,
      access: String,
      contactOnArrival: {
        type: Boolean,
        default: true
      }
    },
    tracking: {
      number: String,
      courier: {
        name: String,
        phone: String
      },
      estimatedArrival: Date,
      actualDelivery: Date
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'cash', 'online', 'bank-transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partial-refund'],
      default: 'pending'
    },
    details: {
      transactionId: String,
      paymentProcessor: String,
      cardLast4: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number
    },
    invoice: {
      number: String,
      issuedAt: Date,
      dueDate: Date
    }
  },
  communication: {
    orderConfirmation: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    statusUpdates: [{
      type: String,
      sent: { type: Boolean, default: false },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'sms', 'push'],
        default: 'email'
      }
    }],
    deliveryNotification: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    photos: [String],
    submittedAt: Date
  },
  notes: {
    customer: String,
    internal: String,
    delivery: String
  },
  flags: {
    isGift: {
      type: Boolean,
      default: false
    },
    requiresId: {
      type: Boolean,
      default: false
    },
    isSubscription: {
      type: Boolean,
      default: false
    },
    isRepeated: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    source: {
      type: String,
      enum: ['website', 'mobile-app', 'phone', 'social-media', 'referral'],
      default: 'website'
    },
    campaign: String,
    referralCode: String,
    loyaltyPointsUsed: {
      type: Number,
      default: 0
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status.current);
});

orderSchema.virtual('canBeModified').get(function() {
  return ['pending'].includes(this.status.current);
});

orderSchema.virtual('isDelivered').get(function() {
  return this.status.current === 'delivered';
});

orderSchema.virtual('estimatedDeliveryTime').get(function() {
  if (!this.delivery.schedule.preferredDate) return null;
  
  const deliveryDate = new Date(this.delivery.schedule.preferredDate);
  const now = new Date();
  const diffTime = deliveryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Индексы
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'status.current': 1 });
orderSchema.index({ 'delivery.schedule.preferredDate': 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Middleware
orderSchema.pre('save', async function(next) {
  // Генерация номера заказа
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    const count = await mongoose.model('Order').countDocuments({
      createdAt: { 
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }) + 1;
    
    this.orderNumber = `BS-${dateStr}-${count.toString().padStart(4, '0')}`;
  }
  
  // Расчет общей суммы
  this.pricing.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount.amount;
  
  // Добавление записи в историю статусов при изменении
  if (this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
      note: `Статус изменен на: ${this.status.current}`
    });
  }
  
  next();
});

// Методы схемы
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status.current = newStatus;
  this.status.history.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Статус изменен на: ${newStatus}`,
    updatedBy
  });
  return this.save();
};

orderSchema.methods.addTrackingInfo = function(trackingNumber, courier) {
  this.delivery.tracking.number = trackingNumber;
  if (courier) {
    this.delivery.tracking.courier = courier;
  }
  return this.save();
};

orderSchema.methods.markAsPaid = function(transactionId, paymentProcessor) {
  this.payment.status = 'paid';
  this.payment.details.transactionId = transactionId;
  this.payment.details.paymentProcessor = paymentProcessor;
  this.payment.details.paidAt = new Date();
  return this.save();
};

orderSchema.methods.processRefund = function(amount, reason) {
  this.payment.status = amount >= this.pricing.total ? 'refunded' : 'partial-refund';
  this.payment.details.refundAmount = amount;
  this.payment.details.refundedAt = new Date();
  
  if (amount >= this.pricing.total) {
    this.status.current = 'refunded';
  }
  
  return this.save();
};

orderSchema.methods.addFeedback = function(rating, comment, photos) {
  this.feedback = {
    rating,
    comment,
    photos: photos || [],
    submittedAt: new Date()
  };
  return this.save();
};

orderSchema.methods.canUserModify = function(userId) {
  return this.user.toString() === userId.toString() && this.canBeModified;
};

orderSchema.methods.canUserCancel = function(userId) {
  return this.user.toString() === userId.toString() && this.canBeCancelled;
};

orderSchema.methods.getStatusHistory = function() {
  return this.status.history.sort((a, b) => b.timestamp - a.timestamp);
};

orderSchema.methods.calculateLoyaltyPoints = function() {
  // 1 балл за каждые 100 рублей
  return Math.floor(this.pricing.total / 100);
};

module.exports = mongoose.model('Order', orderSchema);
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Создать новый заказ
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      delivery,
      payment,
      customer,
      notes,
      flags,
      analytics
    } = req.body;
 
    // Валидация обязательных полей
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Корзина не может быть пустой'
      });
    }

    if (!delivery || !delivery.address || !delivery.schedule) {
      return res.status(400).json({
        success: false,
        message: 'Данные доставки обязательны'
      });
    }

    if (!payment || !payment.method) {
      return res.status(400).json({
        success: false,
        message: 'Способ оплаты обязателен'
      });
    }

    // Проверка и подготовка товаров
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Товар с ID ${item.productId} не найден`
        });
      }

      if (!product.availability.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Товар "${product.name}" недоступен для заказа`
        });
      }

      if (product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Недостаточно товара "${product.name}" на складе. Доступно: ${product.availableQuantity}`
        });
      }

      const itemPrice = product.finalPrice;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
        customization: item.customization || {}
      });

      // Резервирование товара
      await product.updateOne({
        $inc: { 'inventory.reserved': item.quantity }
      });
    }

    // Расчет доставки
    const shippingCost = calculateShippingCost(delivery.type, subtotal, delivery.address);
    
    // Расчет налогов (если применимо)
    const taxAmount = 0; // В России НДС обычно уже включен в цену

    // Применение скидок
    let discountAmount = 0;
    let discountInfo = {};

    if (req.body.discountCode) {
      const discount = await applyDiscountCode(req.body.discountCode, subtotal, req.user.id);
      if (discount.success) {
        discountAmount = discount.amount;
        discountInfo = {
          amount: discount.amount,
          code: req.body.discountCode,
          type: discount.type
        };
      }
    }

    // Использование бонусных баллов
    if (req.body.useLoyaltyPoints && req.user.loyaltyPoints > 0) {
      const pointsToUse = Math.min(req.body.useLoyaltyPoints, req.user.loyaltyPoints);
      const pointsValue = pointsToUse; // 1 балл = 1 рубль
      discountAmount += pointsValue;
      
      if (!discountInfo.amount) {
        discountInfo = {
          amount: pointsValue,
          type: 'loyalty'
        };
      } else {
        discountInfo.amount += pointsValue;
      }
    }

    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

    // Создание заказа
    const orderData = {
      user: req.user.id,
      items: orderItems,
      pricing: {
        subtotal,
        shipping: shippingCost,
        tax: taxAmount,
        discount: discountInfo,
        total: totalAmount
      },
      customer: customer || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      delivery,
      payment,
      notes: notes || {},
      flags: flags || {},
      analytics: {
        ...analytics,
        loyaltyPointsUsed: req.body.useLoyaltyPoints || 0,
        loyaltyPointsEarned: Math.floor(totalAmount / 100) // 1 балл за 100 руб
      }
    };

    const order = await Order.create(orderData);

    // Обновление пользователя
    const user = await User.findById(req.user.id);
    user.orderHistory.push(order._id);
    
    // Списание использованных бонусных баллов
    if (req.body.useLoyaltyPoints) {
      user.loyaltyPoints -= req.body.useLoyaltyPoints;
    }
    
    await user.save();

    // Заполнение данных для ответа
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price images.main slug')
      .populate('user', 'name email phone');

    // Уведомления (можно добавить отправку email/SMS)
    // await sendOrderConfirmation(populatedOrder);

    res.status(201).json({
      success: true,
      message: 'Заказ создан успешно',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    
    // Откат резервирования товаров в случае ошибки
    if (req.body.items) {
      for (const item of req.body.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { 'inventory.reserved': -item.quantity }
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка создания заказа'
    });
  }
};

// Функция расчета стоимости доставки
const calculateShippingCost = (deliveryType, subtotal, address) => {
  const rates = {
    'standard': 500,
    'express': 1000,
    'same-day': 1500,
    'pickup': 0
  };

  let cost = rates[deliveryType] || rates.standard;

  // Бесплатная доставка при заказе от 3000 руб
  if (subtotal >= 3000 && deliveryType !== 'same-day') {
    cost = 0;
  }

  // Доплата за доставку за МКАД (примерная логика)
  if (address.city !== 'Москва' && deliveryType !== 'pickup') {
    cost += 300;
  }

  return cost;
};

// Функция применения промокода
const applyDiscountCode = async (code, subtotal, userId) => {
  // Здесь должна быть логика проверки промокодов
  // Для примера используем простую проверку
  const discountCodes = {
    'WELCOME10': { type: 'percentage', value: 10, minOrder: 1000 },
    'SPRING500': { type: 'fixed', value: 500, minOrder: 2000 },
    'FLOWER15': { type: 'percentage', value: 15, minOrder: 1500 }
  };

  const discount = discountCodes[code.toUpperCase()];
  
  if (!discount) {
    return { success: false, message: 'Неверный промокод' };
  }

  if (subtotal < discount.minOrder) {
    return { 
      success: false, 
      message: `Минимальная сумма заказа для этого промокода: ${discount.minOrder} руб.` 
    };
  }

  let amount = 0;
  if (discount.type === 'percentage') {
    amount = Math.round(subtotal * discount.value / 100);
  } else {
    amount = discount.value;
  }

  return {
    success: true,
    amount,
    type: discount.type
  };
};

// @desc    Получить заказы пользователя
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { user: req.user.id };

    // Фильтр по статусу
    if (status) {
      filter['status.current'] = status;
    }

    // Фильтр по дате
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images.main slug')
      .select('-notes.internal') // Скрываем внутренние заметки
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказов пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказов'
    });
  }
};

// @desc    Получить заказ по ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images slug description.short')
      .populate('user', 'name email phone')
      .populate('status.history.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Проверка прав доступа
    if (order.user._id.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    // Скрываем внутренние заметки для обычных пользователей
    if (req.user.role === 'user') {
      order.notes.internal = undefined;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказа'
    });
  }
};

// @desc    Обновить статус заказа
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Проверка допустимых переходов статусов
    const allowedTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['out-for-delivery'],
      'out-for-delivery': ['delivered'],
      'delivered': [],
      'cancelled': ['refunded'],
      'refunded': []
    };

    const currentStatus = order.status.current;
    if (!allowedTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Нельзя изменить статус с "${currentStatus}" на "${status}"`
      });
    }

    // Обновление статуса
    await order.updateStatus(status, note, req.user.id);

    // Дополнительная логика для определенных статусов
    switch (status) {
      case 'confirmed':
        // Подтверждение заказа - списание товаров со склада
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: {
              'inventory.inStock': -item.quantity,
              'inventory.reserved': -item.quantity
            }
          });
          
          // Обновление статистики продаж
          const product = await Product.findById(item.product);
          await product.recordSale(item.quantity, item.price);
        }

        // Начисление бонусных баллов
        if (order.analytics.loyaltyPointsEarned > 0) {
          await User.findByIdAndUpdate(order.user, {
            $inc: { loyaltyPoints: order.analytics.loyaltyPointsEarned }
          });
        }
        break;

      case 'cancelled':
        // Отмена заказа - возврат товаров на склад
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { 'inventory.reserved': -item.quantity }
          });
        }

        // Возврат использованных бонусных баллов
        if (order.analytics.loyaltyPointsUsed > 0) {
          await User.findByIdAndUpdate(order.user, {
            $inc: { loyaltyPoints: order.analytics.loyaltyPointsUsed }
          });
        }
        break;

      case 'delivered':
        // Доставлен - обновление времени доставки
        order.delivery.tracking.actualDelivery = new Date();
        await order.save();
        break;
    }

    const updatedOrder = await Order.findById(orderId)
      .populate('items.product', 'name price images.main')
      .populate('user', 'name email phone');

    // Отправка уведомлений (email/SMS)
    // await sendStatusUpdateNotification(updatedOrder);

    res.status(200).json({
      success: true,
      message: 'Статус заказа обновлен',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления статуса заказа'
    });
  }
};

// @desc    Получить все заказы (для админов)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      userId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Фильтр по статусу
    if (status) {
      filter['status.current'] = status;
    }

    // Фильтр по пользователю
    if (userId) {
      filter.user = userId;
    }

    // Фильтр по дате
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Поиск по номеру заказа или email
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images.main')
      .populate('user', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    // Статистика по статусам
    const statusStats = await Order.aggregate([
      { $match: filter },
      { $group: { _id: '$status.current', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      statistics: {
        statusDistribution: statusStats,
        totalRevenue: orders.reduce((sum, order) => sum + order.pricing.total, 0)
      }
    });
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказов'
    });
  }
};

// @desc    Отменить заказ
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Проверка прав доступа
    if (!order.canUserCancel(req.user.id) && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Нельзя отменить этот заказ'
      });
    }

    if (!order.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Заказ нельзя отменить на текущем этапе'
      });
    }

    // Отмена заказа
    await order.updateStatus('cancelled', reason || 'Отменен пользователем', req.user.id);

    // Возврат товаров на склад
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.reserved': -item.quantity }
      });
    }

    // Возврат бонусных баллов
    if (order.analytics.loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { loyaltyPoints: order.analytics.loyaltyPointsUsed }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Заказ отменен успешно'
    });
  } catch (error) {
    console.error('Ошибка отмены заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отмены заказа'
    });
  }
};

// @desc    Добавить отзыв к заказу
// @route   POST /api/orders/:id/feedback
// @access  Private
const addOrderFeedback = async (req, res) => {
  try {
    const { rating, comment, photos } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Проверка прав доступа
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    // Можно оставить отзыв только для доставленных заказов
    if (order.status.current !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Отзыв можно оставить только для доставленных заказов'
      });
    }

    // Проверка, не был ли уже оставлен отзыв
    if (order.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Отзыв уже был оставлен для этого заказа'
      });
    }

    await order.addFeedback(rating, comment, photos);

    res.status(201).json({
      success: true,
      message: 'Отзыв добавлен успешно'
    });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка добавления отзыва'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  addOrderFeedback
};
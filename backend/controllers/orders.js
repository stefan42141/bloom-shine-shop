const Order = require('../models/Order');
const Product = require('../models/Product');

// Создать новый заказ
const createOrder = async (req, res) => {
  try {
    const { items, deliveryInfo, paymentInfo } = req.body;

    // Проверка наличия товаров и расчет общей суммы
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Товар с ID ${item.productId} не найден` });
      }
      
      if (product.inStock < item.quantity) {
        return res.status(400).json({ 
          message: `Недостаточно товара "${product.name}" на складе. Доступно: ${product.inStock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Создание заказа
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryInfo,
      paymentInfo
    });

    // Обновление количества товаров на складе
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { inStock: -item.quantity } }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price images')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка создания заказа' });
  }
};

// Получить заказы пользователя
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
};

// Получить заказ по ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images description')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Проверка прав доступа
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения заказа' });
  }
};

// Обновить статус заказа (только для админов)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.product', 'name price images')
     .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка обновления статуса заказа' });
  }
};

// Получить все заказы (только для админов)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
};

// Отменить заказ
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Проверка прав доступа
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Можно отменить только заказы со статусом pending или confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Нельзя отменить заказ с текущим статусом' });
    }

    // Возврат товаров на склад
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { inStock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Заказ отменен',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка отмены заказа' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
};
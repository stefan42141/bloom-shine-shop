const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  addOrderFeedback
} = require('../controllers/orders');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Маршруты для пользователей (требуют аутентификации)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/cancel', authenticate, cancelOrder); 
router.post('/:id/feedback', authenticate, addOrderFeedback);

// Административные маршруты (только для админов)
router.get('/', authenticate, requireAdmin, getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

module.exports = router;
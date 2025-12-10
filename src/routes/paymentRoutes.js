const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Todas las rutas de pagos requieren estar autenticado
router.use(protect);

// Rutas para cualquier cliente
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);
router.get('/status/:paymentIntentId', paymentController.checkStatus);
router.get('/my-transactions', paymentController.getMyTransactions);

// Rutas para Admin
router.post('/refund', restrictTo('admin'), paymentController.refundPayment);
router.get('/revenue-stats', restrictTo('admin'), paymentController.getRevenueStats);

module.exports = router;

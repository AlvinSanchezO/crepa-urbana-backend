const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Todas las rutas de pedidos requieren estar logueado
router.use(protect);

// Rutas para Clientes
router.post('/', orderController.create);       // Crear pedido
router.get('/my-orders', orderController.getMyOrders); // Ver mis pedidos

// Rutas para Admin/Staff
router.get('/', restrictTo('admin', 'staff'), orderController.getAll); // Ver todo
router.patch('/:id/status', restrictTo('admin', 'staff'), orderController.updateStatus); // Cambiar estado

module.exports = router;
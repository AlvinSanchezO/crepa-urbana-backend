const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Todas las rutas de lealtad requieren estar logueado
router.use(protect);

// 1. Ver historial y saldo (Clientes y Admin)
router.get('/history', loyaltyController.getHistory);

// 2. Ajuste manual de puntos (Solo Admin)
// Permite sumar o restar puntos a un usuario específico
router.post('/adjust', restrictTo('admin'), loyaltyController.adjust);

module.exports = router;
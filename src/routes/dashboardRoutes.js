const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('admin')); // Solo el jefe ve los números

router.get('/', dashboardController.getMetrics);

module.exports = router;
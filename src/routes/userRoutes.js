const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('admin')); // Solo el admin puede ver la lista

router.get('/', userController.getAllClients);

module.exports = router;
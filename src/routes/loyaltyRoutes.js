const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Todo requiere login

router.get('/history', loyaltyController.getHistory);

module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Rutas Públicas (Cualquiera puede ver el menú)
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);

// Rutas Privadas (Solo Admin y Staff pueden modificar el menú)
router.use(protect); // <--- Todo lo de abajo requiere Token
router.use(restrictTo('admin', 'staff')); // <--- Y requiere rol especial

router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router;
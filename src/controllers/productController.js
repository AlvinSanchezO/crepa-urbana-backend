const productService = require('../services/productService');

class ProductController {

  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      next(error); // Pasa el error al middleware de errores
    }
  }

  async create(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Producto creado',
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      await productService.updateProduct(req.params.id, req.body);
      res.json({ success: true, message: 'Producto actualizado' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
const BaseRepository = require('./BaseRepository');
const { Product, Category } = require('../models');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  // Obtener productos con su categoría incluida (JOIN)
  async getAllWithCategories() {
    return await this.model.findAll({
      include: [{
        model: Category,
        attributes: ['nombre'] // Solo traer el nombre de la categoría
      }]
    });
  }
}

module.exports = new ProductRepository();
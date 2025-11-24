const productRepository = require('../repositories/productRepository');

class ProductService {
  
  async getAllProducts() {
    return await productRepository.getAllWithCategories();
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async createProduct(data) {
    // Aquí podrías validar si la categoria_id existe, etc.
    return await productRepository.create(data);
  }

  async updateProduct(id, data) {
    const updated = await productRepository.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar el producto');
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar el producto');
    return true;
  }
}

module.exports = new ProductService();
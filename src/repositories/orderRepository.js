const BaseRepository = require('./BaseRepository');
const { Order, OrderItem, Product, User } = require('../models');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // Obtener pedidos con detalles (Usuario y Productos)
  async getAllWithDetails(options = {}) {
    return await this.model.findAll({
      ...options,
      include: [
        { model: User, attributes: ['id', 'nombre', 'email'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, attributes: ['nombre', 'imagen_url'] }] 
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
  }

  // Obtener un solo pedido con detalles
  async getByIdWithDetails(id) {
    return await this.model.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'nombre', 'email'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, attributes: ['nombre'] }] 
        }
      ]
    });
  }
}

module.exports = new OrderRepository();
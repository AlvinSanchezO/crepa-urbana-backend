const BaseRepository = require('./BaseRepository');
const { Transaction, User, Order } = require('../models');

class TransactionRepository extends BaseRepository {
  constructor() {
    super(Transaction);
  }

  // Obtener transacción por Payment Intent ID (único de Stripe)
  async getByPaymentIntentId(paymentIntentId) {
    return await this.getOne({ where: { stripe_payment_intent_id: paymentIntentId } });
  }

  // Obtener todas las transacciones de un usuario
  async getUserTransactions(userId, limit = 50, offset = 0) {
    return await this.model.findAll({
      where: { usuario_id: userId },
      include: [
        { model: User, attributes: ['nombre', 'email'] },
        { model: Order, attributes: ['id', 'total_pagar', 'estado'] }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit,
      offset
    });
  }

  // Obtener transacciones por estado
  async getByStatus(status, limit = 100, offset = 0) {
    return await this.model.findAll({
      where: { estado: status },
      include: [
        { model: User, attributes: ['nombre', 'email'] },
        { model: Order, attributes: ['id'] }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit,
      offset
    });
  }

  // Contar transacciones exitosas
  async countSuccessfulTransactions(startDate, endDate) {
    return await this.model.count({
      where: { 
        estado: 'succeeded',
        fecha_confirmacion: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });
  }

  // Sumar monto de transacciones exitosas en rango de fecha
  async sumSuccessfulTransactions(startDate, endDate) {
    const result = await this.model.sum('monto', {
      where: { 
        estado: 'succeeded',
        fecha_confirmacion: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });
    return result || 0;
  }
}

module.exports = new TransactionRepository();

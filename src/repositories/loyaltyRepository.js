const BaseRepository = require('./BaseRepository');
const { LoyaltyLog, Order } = require('../models');

class LoyaltyRepository extends BaseRepository {
  constructor() {
    super(LoyaltyLog);
  }

  async getHistoryByUserId(userId) {
    return await this.model.findAll({
      where: { usuario_id: userId },
      include: [
        { model: Order, attributes: ['id', 'total_pagar'] } // Opcional: ver de qué orden vino
      ],
      order: [['fecha', 'DESC']]
    });
  }
}

module.exports = new LoyaltyRepository();
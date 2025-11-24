const loyaltyRepository = require('../repositories/loyaltyRepository');
const userRepository = require('../repositories/userRepository');

class LoyaltyService {

  async getHistory(userId) {
    return await loyaltyRepository.getHistoryByUserId(userId);
  }

  // Función extra: Consultar saldo actual directamente
  async getBalance(userId) {
    const user = await userRepository.getById(userId);
    return { puntos_actuales: user.puntos_actuales };
  }
}

module.exports = new LoyaltyService();
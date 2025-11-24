const loyaltyService = require('../services/loyaltyService');

class LoyaltyController {

  async getHistory(req, res, next) {
    try {
      // req.user.id viene del Token JWT
      const history = await loyaltyService.getHistory(req.user.id);
      const balance = await loyaltyService.getBalance(req.user.id);

      res.json({
        success: true,
        data: {
          saldo: balance.puntos_actuales,
          movimientos: history
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LoyaltyController();
const loyaltyService = require('../services/loyaltyService');

class LoyaltyController {

  // 1. Ver historial y saldo (Para el Cliente)
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

  // 2. Ajuste manual de puntos (Para el Admin)
  async adjust(req, res, next) {
    try {
      const { userId, points } = req.body;
      
      // Llamamos al servicio pasando el ID del admin que ejecuta la acción
      await loyaltyService.adjustPoints(req.user.id, userId, parseInt(points));
      
      res.json({ 
        success: true, 
        message: 'Puntos ajustados correctamente' 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LoyaltyController();
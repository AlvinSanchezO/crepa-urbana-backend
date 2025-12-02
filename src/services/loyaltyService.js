const { sequelize, User, LoyaltyLog } = require('../models');
const loyaltyRepository = require('../repositories/loyaltyRepository');
const userRepository = require('../repositories/userRepository');

class LoyaltyService {

  async getHistory(userId) {
    return await loyaltyRepository.getHistoryByUserId(userId);
  }

  async getBalance(userId) {
    const user = await userRepository.getById(userId);
    return { puntos_actuales: user.puntos_actuales };
  }

  // MÉTODO BLINDADO (RAW SQL)
  async adjustPoints(adminId, targetUserId, points) {
    // 1. Validar que sea número
    const puntosInt = parseInt(points);
    if (isNaN(puntosInt)) throw new Error('Cantidad de puntos inválida');

    const transaction = await sequelize.transaction();
    
    try {
      // 2. Insertar en el Log (Historial)
      // OMITIMOS 'fecha' para que SQL Server use su DEFAULT GETDATE()
      // Esto evita el error "Conversion failed when converting date"
      await LoyaltyLog.create({
        usuario_id: targetUserId,
        tipo_movimiento: 'ajuste_manual',
        cantidad_puntos: puntosInt
      }, { transaction });

      // 3. Actualizar Saldo (SQL PURO)
      await sequelize.query(
        `UPDATE users SET puntos_actuales = puntos_actuales + :points WHERE id = :id`,
        {
          replacements: { points: puntosInt, id: targetUserId },
          type: sequelize.QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();
      
      // Consultamos el saldo final solo para mostrarlo
      const user = await userRepository.getById(targetUserId);
      return { success: true, new_balance: user.puntos_actuales };

    } catch (error) {
      // Logueamos el error original antes del rollback para verlo en consola
      console.error("Error original ajustando puntos:", error);
      
      // Hacemos rollback controlado
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Si la transacción ya murió, ignoramos este error secundario
        console.error("Rollback fallido (transacción ya cerrada):", rollbackError.message);
      }
      throw error;
    }
  }
}

module.exports = new LoyaltyService();
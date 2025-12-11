const { User, sequelize } = require('../models');

class UserController {
  async getAllClients(req, res, next) {
    try {
      const users = await User.findAll({
        where: { rol: 'cliente' }, // Solo clientes, no admins
        attributes: ['id', 'nombre', 'email', 'telefono', 'puntos_actuales'], // Datos seguros
        order: [['nombre', 'ASC']]
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Eliminar un usuario de la base de datos
   * También elimina todas sus transacciones y órdenes asociadas
   */
  async deleteUser(req, res, next) {
    let dbTransaction;
    try {
      dbTransaction = await sequelize.transaction();
      const { id } = req.params;
      const userId = req.user.id; // ID del usuario autenticado (admin)

      // Validar que el ID es un número válido
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Validar que no intente eliminarse a sí mismo
      if (parseInt(id) === parseInt(userId)) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminarte a ti mismo'
        });
      }

      // Buscar el usuario
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Obtener modelos
      const { Order, OrderItem, Transaction, LoyaltyLog } = require('../models');

      // Obtener todas las órdenes del usuario para después
      const orders = await Order.findAll({
        where: { usuario_id: id },
        transaction: dbTransaction
      });

      const orderIds = orders.map(o => o.id);

      // Paso 1: Eliminar loyalty_logs que dependen de órdenes
      if (orderIds.length > 0) {
        await LoyaltyLog.destroy({
          where: { pedido_id: orderIds },
          transaction: dbTransaction
        });
      }

      // Paso 2: Eliminar order_items asociados a órdenes del usuario
      for (const order of orders) {
        await OrderItem.destroy({
          where: { pedido_id: order.id },
          transaction: dbTransaction
        });
      }

      // Paso 3: Eliminar órdenes del usuario
      await Order.destroy({
        where: { usuario_id: id },
        transaction: dbTransaction
      });

      // Paso 4: Eliminar transacciones del usuario
      await Transaction.destroy({
        where: { usuario_id: id },
        transaction: dbTransaction
      });

      // Paso 5: Eliminar logs de lealtad del usuario (por si acaso)
      await LoyaltyLog.destroy({
        where: { usuario_id: id },
        transaction: dbTransaction
      });

      // Paso 5: Eliminar el usuario
      await user.destroy({ transaction: dbTransaction });

      // Confirmar transacción
      await dbTransaction.commit();

      // Registrar en logs la acción
      console.log(`📋 LOG: Usuario #${userId} (admin) eliminó al usuario #${id} (${user.email}) el ${new Date().toISOString()}`);
      console.log(`   └─ Se eliminaron: ${orders.length} órdenes, transacciones asociadas y logs de lealtad`);

      // Respuesta éxito
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente',
        data: {
          usuario_id: id,
          usuario_eliminado: user.email,
          fecha_eliminacion: new Date().toISOString(),
          elementos_eliminados: {
            ordenes: orders.length,
            transacciones: 'todas',
            logs_lealtad: 'todos'
          }
        }
      });

    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      console.error('❌ Error eliminando usuario:', error);
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Obtener detalles de un usuario específico
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'nombre', 'email', 'telefono', 'rol', 'puntos_actuales', 'fecha_registro']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
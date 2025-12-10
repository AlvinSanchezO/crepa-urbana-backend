const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sequelize, Transaction, Order } = require('../models');
const transactionRepository = require('../repositories/transactionRepository');

class PaymentService {

  /**
   * Crear un Payment Intent en Stripe
   * @param {number} userId - ID del usuario
   * @param {number} amount - Monto en centavos (ej: 1000 = $10)
   * @param {string} description - Descripción del pago
   * @param {object} metadata - Información adicional para asociar
   * @returns {object} Payment Intent de Stripe
   */
  async createPaymentIntent(userId, amount, description, metadata = {}) {
    try {
      // Validar montos
      if (amount < 50) {
        throw new Error('El monto mínimo es $0.50 USD');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe espera centavos
        currency: 'usd',
        description,
        metadata: {
          userId,
          ...metadata
        }
      });

      // Guardar transacción en BD con estado pending
      const transaction = await transactionRepository.create({
        usuario_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        monto: amount / 100, // Convertir a dólares para BD
        moneda: 'USD',
        estado: 'pending',
        descripcion: description
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        transactionId: transaction.id,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('❌ Error creando Payment Intent:', error);
      throw new Error(`Error al crear pago: ${error.message}`);
    }
  }

  /**
   * Confirmar un pago (después que el cliente completó el Payment Intent en el frontend)
   * @param {string} paymentIntentId - ID del Payment Intent de Stripe
   * @param {number} orderId - ID de la orden existente (opcional)
   * @param {number} userId - ID del usuario
   * @param {array} productos - Array de productos [{producto_id, cantidad, precio_unitario, notas_personalizadas}]
   * @returns {object} Resultado de la confirmación
   */
  async confirmPayment(paymentIntentId, orderId = null, userId = null, productos = []) {
    const dbTransaction = await sequelize.transaction();

    try {
      // 1. Obtener el Payment Intent de Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // 2. Buscar la transacción en nuestra BD
      let transaction = await transactionRepository.getByPaymentIntentId(paymentIntentId);
      if (!transaction) {
        throw new Error('Transacción no encontrada en la base de datos');
      }

      // Usar userId de la transacción si no se proporciona
      const finalUserId = userId || transaction.usuario_id;

      // 3. Procesar según el estado del Payment Intent
      if (paymentIntent.status === 'succeeded') {
        // Pago exitoso
        
        // Actualizar transacción
        transaction = await transactionRepository.update(transaction.id, {
          estado: 'succeeded',
          stripe_charge_id: paymentIntent.charges.data[0]?.id || null,
          metodo_pago: paymentIntent.charges.data[0]?.payment_method_details?.type || 'card',
          ultimos_4_digitos: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4 || null
        }, { transaction: dbTransaction });

        let createdOrderId = orderId;

        // Si no hay orderId, crear nueva orden con los productos
        if (!orderId && productos.length > 0) {
          console.log('📦 Creando nueva orden con productos...');
          
          // Calcular total
          const totalPagar = productos.reduce((sum, item) => {
            return sum + (item.precio_unitario * item.cantidad);
          }, 0);

          // Crear orden
          const newOrder = await Order.create({
            usuario_id: finalUserId,
            estado: 'en_preparacion',
            total_pagar: totalPagar,
            metodo_pago: 'tarjeta',
            puntos_ganados: Math.floor(totalPagar * 1) // 1 punto por dólar (ajustar según lógica)
          }, { transaction: dbTransaction });

          createdOrderId = newOrder.id;

          // Crear items de la orden
          const { OrderItem } = require('../models');
          for (const producto of productos) {
            await OrderItem.create({
              pedido_id: newOrder.id,
              producto_id: producto.producto_id,
              cantidad: producto.cantidad,
              precio_unitario: producto.precio_unitario,
              notas_personalizadas: producto.notas_personalizadas || null
            }, { transaction: dbTransaction });
          }

          // Asignar puntos al usuario
          const { User } = require('../models');
          await User.update(
            { puntos_actuales: sequelize.literal(`puntos_actuales + ${newOrder.puntos_ganados}`) },
            { where: { id: finalUserId }, transaction: dbTransaction }
          );

          console.log('✅ Orden creada exitosamente:', createdOrderId);
        } else if (orderId) {
          // Si existe orderId, actualizar la orden existente
          await Order.update(
            { 
              estado: 'en_preparacion',
              metodo_pago: 'tarjeta'
            },
            { where: { id: orderId }, transaction: dbTransaction }
          );
        }

        // Vincular transacción con la orden
        if (createdOrderId) {
          await transaction.update({
            pedido_id: createdOrderId
          }, { transaction: dbTransaction });
        }

        await dbTransaction.commit();

        return {
          success: true,
          message: 'Pago confirmado y orden creada exitosamente',
          status: 'succeeded',
          data: {
            amount: paymentIntent.amount / 100,
            transactionId: transaction.id,
            orderId: createdOrderId,
            paymentIntentId: paymentIntentId
          }
        };

      } else if (paymentIntent.status === 'requires_action') {
        // Se requiere acción adicional (3D Secure, etc)
        await transactionRepository.update(transaction.id, {
          estado: 'requires_action'
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return {
          success: false,
          message: 'Se requiere acción adicional para completar el pago',
          status: 'requires_action',
          clientSecret: paymentIntent.client_secret
        };

      } else if (paymentIntent.status === 'processing') {
        // En proceso
        await transactionRepository.update(transaction.id, {
          estado: 'pending'
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return {
          success: false,
          message: 'El pago está siendo procesado',
          status: 'processing'
        };

      } else {
        // Pago fallido o cancelado
        const errorMsg = paymentIntent.last_payment_error?.message || 'Pago rechazado';
        await transactionRepository.update(transaction.id, {
          estado: 'failed',
          error_mensaje: errorMsg
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return {
          success: false,
          message: `Pago fallido: ${errorMsg}`,
          status: 'failed',
          error: errorMsg
        };
      }

    } catch (error) {
      await dbTransaction.rollback();
      console.error('❌ Error confirmando pago:', error);
      throw new Error(`Error al confirmar pago: ${error.message}`);
    }
  }

  /**
   * Procesar reembolso (refund)
   * @param {string} paymentIntentId - ID del Payment Intent original
   * @param {number} amount - Monto del reembolso (opcional, si no se proporciona es completo)
   * @returns {object} Resultado del reembolso
   */
  async refundPayment(paymentIntentId, amount = null) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Obtener transacción de BD
      let dbTransaction = await transactionRepository.getByPaymentIntentId(paymentIntentId);
      if (!dbTransaction) {
        throw new Error('Transacción no encontrada');
      }

      if (dbTransaction.estado !== 'succeeded') {
        throw new Error('Solo se pueden reembolsar pagos exitosos');
      }

      // 2. Crear reembolso en Stripe
      const refund = await stripe.refunds.create({
        charge: dbTransaction.stripe_charge_id,
        amount: amount ? Math.round(amount * 100) : undefined // undefined = reembolso completo
      });

      // 3. Actualizar transacción
      await transactionRepository.update(dbTransaction.id, {
        estado: 'refunded',
        descripcion: `${dbTransaction.descripcion} - Reembolsado: $${refund.amount / 100}`
      }, { transaction });

      // 4. Si hay orden, cambiar estado a cancelado
      if (dbTransaction.pedido_id) {
        await Order.update(
          { estado: 'cancelado' },
          { where: { id: dbTransaction.pedido_id }, transaction }
        );
      }

      await transaction.commit();

      return {
        success: true,
        message: 'Reembolso procesado',
        refundId: refund.id,
        amount: refund.amount / 100
      };

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error procesando reembolso:', error);
      throw new Error(`Error al reembolsar: ${error.message}`);
    }
  }

  /**
   * Verificar estado de un pago
   * @param {string} paymentIntentId - ID del Payment Intent
   * @returns {object} Estado actual del pago
   */
  async checkPaymentStatus(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const dbTransaction = await transactionRepository.getByPaymentIntentId(paymentIntentId);

      return {
        status: paymentIntent.status,
        dbStatus: dbTransaction?.estado,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        created: paymentIntent.created,
        error: paymentIntent.last_payment_error?.message || null
      };
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      throw new Error(`Error al verificar estado: ${error.message}`);
    }
  }

  /**
   * Obtener transacciones de un usuario
   * @param {number} userId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @returns {array} Transacciones del usuario
   */
  async getUserTransactions(userId, limit = 50, offset = 0) {
    return await transactionRepository.getUserTransactions(userId, limit, offset);
  }

  /**
   * Obtener ingresos totales en un período
   * @param {Date} startDate - Fecha inicio
   * @param {Date} endDate - Fecha fin
   * @returns {object} Estadísticas de ingresos
   */
  async getRevenueStats(startDate, endDate) {
    const count = await transactionRepository.countSuccessfulTransactions(startDate, endDate);
    const total = await transactionRepository.sumSuccessfulTransactions(startDate, endDate);

    return {
      periodo: {
        desde: startDate.toISOString().split('T')[0],
        hasta: endDate.toISOString().split('T')[0]
      },
      transacciones_exitosas: count,
      ingresos_total: parseFloat(total).toFixed(2),
      ingresos_promedio: count > 0 ? (total / count).toFixed(2) : 0
    };
  }
}

module.exports = new PaymentService();

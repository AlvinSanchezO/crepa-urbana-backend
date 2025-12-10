const { sequelize, Product, OrderItem, User, LoyaltyLog, Transaction } = require('../models');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {

  /**
   * Crear una orden
   * @param {number} userId - ID del usuario
   * @param {array} itemsData - Productos a ordenar
   * @param {object} options - Opciones adicionales {paymentIntentId, metodo_pago}
   */
  async createOrder(userId, itemsData, options = {}) {
    const transaction = await sequelize.transaction();

    try {
      let totalCalculado = 0;
      const orderItemsToCreate = [];

      // 1. Validar productos y calcular total real (Backend)
      for (const item of itemsData) {
        const product = await productRepository.getById(item.producto_id);
        if (!product) throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
        
        if (!product.disponible) throw new Error(`El producto ${product.nombre} no está disponible`);

        const subtotal = parseFloat(product.precio) * item.cantidad;
        totalCalculado += subtotal;

        // Preparamos el objeto para guardar en order_items
        orderItemsToCreate.push({
          producto_id: product.id,
          cantidad: item.cantidad,
          precio_unitario: product.precio, // Guardamos el precio del momento
          notas_personalizadas: item.notas || ''
        });
      }

      // 2. Calcular Puntos (Ejemplo: 1 punto por cada $10 pesos)
      const puntosGanados = Math.floor(totalCalculado / 10);

      // 3. Validar que hay pago si se requiere
      let metodoPago = options.metodo_pago || 'efectivo';
      let estadoInicial = 'pendiente';

      // Si se proporciona un Payment Intent ID (pago con Stripe)
      if (options.paymentIntentId) {
        const paidTransaction = await Transaction.findOne({
          where: { stripe_payment_intent_id: options.paymentIntentId },
          transaction
        });

        if (!paidTransaction) {
          throw new Error('Transacción de pago no encontrada');
        }

        if (paidTransaction.estado !== 'succeeded') {
          throw new Error(`Pago no completado. Estado: ${paidTransaction.estado}`);
        }

        if (Math.abs(paidTransaction.monto - totalCalculado) > 0.01) {
          throw new Error('Monto del pago no coincide con el total de la orden');
        }

        metodoPago = 'tarjeta';
        estadoInicial = 'en_preparacion'; // Si ya pagó, puede ir directo a preparación
      }

      // 4. Crear la Orden
      const newOrder = await orderRepository.create({
        usuario_id: userId,
        total_pagar: totalCalculado,
        puntos_ganados: puntosGanados,
        estado: estadoInicial,
        metodo_pago: metodoPago
      }, { transaction });

      // 5. Guardar los Items (asignando el ID de la orden creada)
      const itemsWithOrderId = orderItemsToCreate.map(item => ({
        ...item,
        pedido_id: newOrder.id
      }));
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

      // 6. Si hay Payment Intent, asociarlo a la orden
      if (options.paymentIntentId) {
        await Transaction.update(
          { pedido_id: newOrder.id },
          { 
            where: { stripe_payment_intent_id: options.paymentIntentId },
            transaction 
          }
        );
      }

      // 7. Actualizar Puntos del Usuario
      const user = await User.findByPk(userId, { transaction });
      await user.increment('puntos_actuales', { by: puntosGanados, transaction });

      // 8. Registrar Historial de Lealtad
      await LoyaltyLog.create({
        usuario_id: userId,
        pedido_id: newOrder.id,
        tipo_movimiento: 'acumulacion',
        cantidad_puntos: puntosGanados
      }, { transaction });

      // Si todo sale bien, confirmamos la transacción
      await transaction.commit();
      
      return newOrder;

    } catch (error) {
      // Si algo falla, revertimos todo
      await transaction.rollback();
      throw error;
    }
  }

  async getMyOrders(userId) {
    return await orderRepository.getAllWithDetails({ where: { usuario_id: userId } });
  }

  async getAllOrders() {
    return await orderRepository.getAllWithDetails();
  }
  
  async updateStatus(orderId, status) {
    return await orderRepository.update(orderId, { estado: status });
  }
}

module.exports = new OrderService();
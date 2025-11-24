const { sequelize, Product, OrderItem, User, LoyaltyLog } = require('../models');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {

  async createOrder(userId, itemsData) {
    const transaction = await sequelize.transaction(); // Iniciar transacción

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

      // 3. Crear la Orden
      const newOrder = await orderRepository.create({
        usuario_id: userId,
        total_pagar: totalCalculado,
        puntos_ganados: puntosGanados,
        estado: 'pendiente',
        metodo_pago: 'efectivo' // Por defecto, se puede parametrizar
      }, { transaction });

      // 4. Guardar los Items (asignando el ID de la orden creada)
      const itemsWithOrderId = orderItemsToCreate.map(item => ({
        ...item,
        pedido_id: newOrder.id
      }));
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

      // 5. Actualizar Puntos del Usuario
      const user = await User.findByPk(userId, { transaction });
      await user.increment('puntos_actuales', { by: puntosGanados, transaction });

      // 6. Registrar Historial de Lealtad
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
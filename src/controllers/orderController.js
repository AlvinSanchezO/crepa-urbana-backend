const orderService = require('../services/orderService');

class OrderController {

  // Crear pedido (Cliente)
  async create(req, res, next) {
    try {
      // req.user.id viene del token JWT
      const order = await orderService.createOrder(req.user.id, req.body.items);
      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Ver mis pedidos (Cliente)
  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getMyOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  // Ver todos los pedidos (Admin/Staff)
  async getAll(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
  
  // Cambiar estado (Admin/Staff)
  async updateStatus(req, res, next) {
    try {
      const { estado } = req.body;
      await orderService.updateStatus(req.params.id, estado);
      res.json({ success: true, message: 'Estado actualizado' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
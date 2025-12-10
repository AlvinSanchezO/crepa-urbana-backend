const paymentService = require('../services/paymentService');

class PaymentController {

  /**
   * POST /api/payments/create-intent
   * Inicia un nuevo pago creando un Payment Intent
   */
  async createPaymentIntent(req, res, next) {
    try {
      // Aceptar 'amount' o 'monto' (para compatibilidad con español/inglés)
      const amount = req.body.amount || req.body.monto;
      const { description, orderId } = req.body;
      const userId = req.user.id;

      // Validar entrada
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Monto inválido. Por favor proporciona "amount" o "monto"' 
        });
      }

      // Convertir a centavos si viene en dólares
      const amountInCents = amount * 100;

      const result = await paymentService.createPaymentIntent(
        userId,
        amountInCents,
        description || `Pago para orden #${orderId || 'general'}`,
        { orderId }
      );

      res.status(201).json({
        success: true,
        message: 'Payment Intent creado',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/confirm
   * Confirma un pago después que el cliente lo procesó en el frontend
   */
  async confirmPayment(req, res, next) {
    try {
      // Aceptar ambos formatos: paymentIntentId o payment_intent_id
      const paymentIntentId = req.body.paymentIntentId || req.body.payment_intent_id;
      const orderId = req.body.orderId || req.body.pedido_id;
      const productos = req.body.productos || []; // Array de productos a incluir en la orden
      const userId = req.user.id;

      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'PaymentIntentId o payment_intent_id es requerido' 
        });
      }

      // Pasar productos al servicio
      const result = await paymentService.confirmPayment(paymentIntentId, orderId, userId, productos);

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/refund
   * Procesa un reembolso (Admin only)
   */
  async refundPayment(req, res, next) {
    try {
      const { paymentIntentId, amount } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'PaymentIntentId es requerido' 
        });
      }

      const result = await paymentService.refundPayment(paymentIntentId, amount);

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/status/:paymentIntentId
   * Verifica el estado actual de un pago
   */
  async checkStatus(req, res, next) {
    try {
      const { paymentIntentId } = req.params;

      const status = await paymentService.checkPaymentStatus(paymentIntentId);

      res.status(200).json({
        success: true,
        data: status
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/my-transactions
   * Obtiene las transacciones del usuario autenticado
   */
  async getMyTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      const transactions = await paymentService.getUserTransactions(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        data: transactions
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/revenue-stats
   * Obtiene estadísticas de ingresos (Admin only)
   */
  async getRevenueStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Validar fechas
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'startDate y endDate son requeridos (formato: YYYY-MM-DD)' 
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Formato de fecha inválido' 
        });
      }

      const stats = await paymentService.getRevenueStats(start, end);

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();

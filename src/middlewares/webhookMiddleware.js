const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Transaction, Order } = require('../models');
const transactionRepository = require('../repositories/transactionRepository');

/**
 * Webhook para escuchar eventos de Stripe
 * Debe configurarse en: https://dashboard.stripe.com/webhooks
 * 
 * Eventos escuchados:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (error) {
    console.error('⚠️ Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Procesar el evento según su tipo
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Maneja el evento: payment_intent.succeeded
 * Se dispara cuando el pago fue exitoso
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const transaction = await transactionRepository.getByPaymentIntentId(paymentIntent.id);

    if (!transaction) {
      console.warn(`⚠️ Transacción no encontrada para PI: ${paymentIntent.id}`);
      return;
    }

    // Actualizar transacción
    await transactionRepository.update(transaction.id, {
      estado: 'succeeded',
      stripe_charge_id: paymentIntent.charges.data[0]?.id || null,
      metodo_pago: paymentIntent.charges.data[0]?.payment_method_details?.type || 'card',
      ultimos_4_digitos: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4 || null,
      fecha_confirmacion: new Date()
    });

    // Si la transacción tiene una orden asociada, actualizar su estado
    if (transaction.pedido_id) {
      await Order.update(
        { estado: 'en_preparacion' },
        { where: { id: transaction.pedido_id } }
      );

      console.log(`✅ Pago confirmado para Orden #${transaction.pedido_id}`);
    }

    console.log(`✅ Payment Intent ${paymentIntent.id} marcado como succeeded`);
  } catch (error) {
    console.error('❌ Error en handlePaymentIntentSucceeded:', error);
  }
};

/**
 * Maneja el evento: payment_intent.payment_failed
 * Se dispara cuando el pago falló
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const transaction = await transactionRepository.getByPaymentIntentId(paymentIntent.id);

    if (!transaction) {
      console.warn(`⚠️ Transacción no encontrada para PI: ${paymentIntent.id}`);
      return;
    }

    const errorMsg = paymentIntent.last_payment_error?.message || 'Pago rechazado';

    // Actualizar transacción
    await transactionRepository.update(transaction.id, {
      estado: 'failed',
      error_mensaje: errorMsg,
      fecha_fallida: new Date()
    });

    console.log(`❌ Pago fallido para PI ${paymentIntent.id}: ${errorMsg}`);
  } catch (error) {
    console.error('❌ Error en handlePaymentIntentFailed:', error);
  }
};

/**
 * Maneja el evento: charge.refunded
 * Se dispara cuando se procesa un reembolso
 */
const handleChargeRefunded = async (charge) => {
  try {
    // Buscar la transacción por charge ID
    const transaction = await Transaction.findOne({
      where: { stripe_charge_id: charge.id }
    });

    if (!transaction) {
      console.warn(`⚠️ Transacción no encontrada para Charge: ${charge.id}`);
      return;
    }

    // Actualizar transacción
    await transactionRepository.update(transaction.id, {
      estado: 'refunded',
      descripcion: `${transaction.descripcion} - Reembolsado: $${charge.refunds.data[0]?.amount / 100 || charge.amount / 100}`
    });

    // Si hay orden, cambiar a cancelado
    if (transaction.pedido_id) {
      await Order.update(
        { estado: 'cancelado' },
        { where: { id: transaction.pedido_id } }
      );
    }

    console.log(`✅ Reembolso procesado para Charge ${charge.id}`);
  } catch (error) {
    console.error('❌ Error en handleChargeRefunded:', error);
  }
};

/**
 * Maneja el evento: payment_intent.canceled
 * Se dispara cuando se cancela un Payment Intent
 */
const handlePaymentIntentCanceled = async (paymentIntent) => {
  try {
    const transaction = await transactionRepository.getByPaymentIntentId(paymentIntent.id);

    if (!transaction) {
      console.warn(`⚠️ Transacción no encontrada para PI: ${paymentIntent.id}`);
      return;
    }

    // Actualizar transacción
    await transactionRepository.update(transaction.id, {
      estado: 'canceled',
      descripcion: `${transaction.descripcion} - Cancelado`
    });

    console.log(`⚠️ Payment Intent ${paymentIntent.id} fue cancelado`);
  } catch (error) {
    console.error('❌ Error en handlePaymentIntentCanceled:', error);
  }
};

module.exports = {
  handleStripeWebhook
};

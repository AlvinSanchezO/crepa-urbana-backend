const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// --- Importar Rutas ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// --- Importar Middlewares ---
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorMiddleware');
const { handleStripeWebhook } = require('./middlewares/webhookMiddleware');

const app = express();

const whitelist = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes('*') || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// --- Webhook de Stripe (Debe ir ANTES de express.json())
// Para que Stripe pueda verificar la firma con el raw body
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/status', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

module.exports = app;
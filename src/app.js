const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// --- Importar Rutas ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// --- Importar Middlewares Personalizados ---
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// --- Configuración de CORS ---
const whitelist = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como Postman) o si el origen está en la lista blanca
    if (!origin || whitelist.includes('*') || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
};

// 1. Middlewares Globales
app.use(cors(corsOptions));
app.use(express.json()); // Habilitar lectura de JSON en el body
app.use(requestLogger);  // Registrar cada petición en consola

// 2. Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Rutas de la API
// Endpoint Base (Health Check)
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente', 
    timestamp: new Date().toISOString() 
  });
});

// Módulos Funcionales
app.use('/api/auth', authRoutes);       // Registro y Login
app.use('/api/products', productRoutes); // Menú y Categorías
app.use('/api/orders', orderRoutes);     // Pedidos y Transacciones

// 4. Middleware de Manejo de Errores (SIEMPRE AL FINAL)
app.use(errorHandler);

module.exports = app;
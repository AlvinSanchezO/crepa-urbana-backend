const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');

// --- IMPORTAR MIDDLEWARES ---
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorMiddleware');

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

// 1. Middlewares Globales
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger); // <--- Logger conectado

// 2. Documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Rutas
app.get('/api/status', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);

// 4. Middleware de Manejo de Errores (SIEMPRE AL FINAL)
app.use(errorHandler); // <--- Manejador de errores conectado

module.exports = app;
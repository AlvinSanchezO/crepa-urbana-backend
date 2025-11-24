const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Configuración de CORS ---
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

// --- Documentación Swagger ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rutas API ---

// 1. Endpoint de Estado (Status)
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString() 
  });
});

// 2. Módulo de Autenticación
app.use('/api/auth', authRoutes);

module.exports = app;
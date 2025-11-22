// Archivo: src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mssql', // Indicamos que usamos SQL Server
    logging: false,   // Cambiar a console.log para ver las consultas SQL en terminal
    dialectOptions: {
      options: {
        // Configuración necesaria para conexiones locales/Azure
        encrypt: false, 
        trustServerCertificate: true, 
      },
    },
  }
);

module.exports = sequelize;
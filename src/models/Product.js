const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: DataTypes.TEXT,
  precio: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    validate: { min: 0 } 
  },
  imagen_url: DataTypes.STRING,
  categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  disponible: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'products', timestamps: false });

module.exports = Product;
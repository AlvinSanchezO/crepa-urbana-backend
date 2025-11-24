const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  notas_personalizadas: DataTypes.TEXT
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;
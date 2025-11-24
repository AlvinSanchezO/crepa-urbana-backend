const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente',
    validate: { isIn: [['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']] }
  },
  total_pagar: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  puntos_ganados: { type: DataTypes.INTEGER, defaultValue: 0 },
  metodo_pago: DataTypes.STRING,
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'orders', timestamps: false });

module.exports = Order;
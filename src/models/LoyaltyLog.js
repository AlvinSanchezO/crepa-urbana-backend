const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoyaltyLog = sequelize.define('LoyaltyLog', {
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  pedido_id: DataTypes.INTEGER,
  tipo_movimiento: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['acumulacion', 'canje', 'ajuste_manual']] }
  },
  cantidad_puntos: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { 
    type: DataTypes.DATE 
    // SE ELIMINÓ defaultValue PARA QUE SQL SERVER LO MANEJE
  }
}, { tableName: 'loyalty_logs', timestamps: false });

module.exports = LoyaltyLog;
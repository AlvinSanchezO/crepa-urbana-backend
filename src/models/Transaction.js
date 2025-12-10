const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  usuario_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  pedido_id: DataTypes.INTEGER,
  stripe_payment_intent_id: DataTypes.STRING,
  stripe_charge_id: DataTypes.STRING,
  monto: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    validate: { min: 0 }
  },
  moneda: { 
    type: DataTypes.STRING, 
    defaultValue: 'USD' 
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['pending', 'succeeded', 'failed', 'canceled', 'requires_action']] }
  },
  metodo_pago: DataTypes.STRING, // 'card', 'bank_account', etc.
  ultimos_4_digitos: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  error_mensaje: DataTypes.TEXT,
  fecha_creacion: { 
    type: DataTypes.DATE 
  },
  fecha_confirmacion: DataTypes.DATE,
  fecha_fallida: DataTypes.DATE
}, { 
  tableName: 'transactions', 
  timestamps: false 
});

module.exports = Transaction;

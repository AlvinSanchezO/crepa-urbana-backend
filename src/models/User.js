const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: "El nombre es obligatorio" } }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: { msg: "Debe ser un correo válido" } }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: DataTypes.STRING,
  rol: {
    type: DataTypes.STRING,
    defaultValue: 'cliente',
    validate: { isIn: [['cliente', 'admin', 'staff']] }
  },
  puntos_actuales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    // Encriptar contraseña antes de guardar
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
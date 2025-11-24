const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: DataTypes.TEXT,
  activa: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'categories', timestamps: false });

module.exports = Category;
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const LoyaltyLog = require('./LoyaltyLog');

// --- Relaciones ---

// Categoría -> Productos
Category.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Category, { foreignKey: 'categoria_id' });

// Usuario -> Pedidos
User.hasMany(Order, { foreignKey: 'usuario_id' });
Order.belongsTo(User, { foreignKey: 'usuario_id' });

// Pedido -> Items
Order.hasMany(OrderItem, { foreignKey: 'pedido_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'pedido_id' });

// Producto -> Items
Product.hasMany(OrderItem, { foreignKey: 'producto_id' });
OrderItem.belongsTo(Product, { foreignKey: 'producto_id' });

// Usuario -> Lealtad
User.hasMany(LoyaltyLog, { foreignKey: 'usuario_id' });
LoyaltyLog.belongsTo(User, { foreignKey: 'usuario_id' });

// Exportar modelos y la conexión
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  LoyaltyLog
};
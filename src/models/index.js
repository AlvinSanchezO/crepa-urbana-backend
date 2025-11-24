const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const LoyaltyLog = require('./LoyaltyLog');

// --- Relaciones ---

// 1. Categoría <-> Productos
Category.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Category, { foreignKey: 'categoria_id' });

// 2. Usuario <-> Pedidos
User.hasMany(Order, { foreignKey: 'usuario_id' });
Order.belongsTo(User, { foreignKey: 'usuario_id' });

// 3. Pedido <-> Items (Detalle)
Order.hasMany(OrderItem, { foreignKey: 'pedido_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'pedido_id' });

// 4. Producto <-> Items
Product.hasMany(OrderItem, { foreignKey: 'producto_id' });
OrderItem.belongsTo(Product, { foreignKey: 'producto_id' });

// 5. Usuario <-> Lealtad
User.hasMany(LoyaltyLog, { foreignKey: 'usuario_id' });
LoyaltyLog.belongsTo(User, { foreignKey: 'usuario_id' });

// 6. Pedido <-> Lealtad (¡ESTA FALTABA!)
Order.hasMany(LoyaltyLog, { foreignKey: 'pedido_id' });
LoyaltyLog.belongsTo(Order, { foreignKey: 'pedido_id' });

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
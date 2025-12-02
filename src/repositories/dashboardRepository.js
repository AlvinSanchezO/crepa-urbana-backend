const { sequelize, User } = require('../models');

class DashboardRepository {
  
  // 1. Ventas Totales (SQL Puro simplificado)
  async getTotalSales(startDate, endDate) {
    // Formatear fechas a string ISO para SQL Server ('YYYY-MM-DD HH:mm:ss')
    const start = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const end = endDate.toISOString().slice(0, 19).replace('T', ' ');

    const [results] = await sequelize.query(`
      SELECT SUM(total_pagar) as total
      FROM orders
      WHERE fecha_creacion BETWEEN '${start}' AND '${end}'
      AND estado != 'cancelado'
    `);

    // SQL Server a veces devuelve [ { total: null } ] si no hay ventas
    return (results && results[0] && results[0].total) ? results[0].total : 0;
  }

  // 2. Top Productos (SQL Puro)
  async getTopProducts() {
    const [results] = await sequelize.query(`
      SELECT TOP 5 
        p.nombre, 
        SUM(oi.cantidad) as total_vendido
      FROM order_items oi
      JOIN products p ON oi.producto_id = p.id
      GROUP BY p.nombre
      ORDER BY total_vendido DESC
    `);
    
    return results.map(row => ({
      Product: { nombre: row.nombre },
      total_vendido: row.total_vendido
    }));
  }

  // 3. Top Clientes (Sequelize estándar)
  async getTopClients() {
    return await User.findAll({
      where: { rol: 'cliente' },
      order: [['puntos_actuales', 'DESC']],
      attributes: ['nombre', 'email', 'puntos_actuales'],
      limit: 5
    });
  }
}

module.exports = new DashboardRepository();
const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardController {

  async getMetrics(req, res, next) {
    try {
      const now = new Date();
      
      // Calcular inicio y fin del DÍA
      const startOfDay = new Date(now.setHours(0,0,0,0));
      const endOfDay = new Date(now.setHours(23,59,59,999));

      // Calcular inicio y fin del MES
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Ejecutar consultas en paralelo
      const [ventasDia, ventasMes, topProductos, topClientes] = await Promise.all([
        dashboardRepository.getTotalSales(startOfDay, endOfDay),
        dashboardRepository.getTotalSales(startOfMonth, endOfMonth),
        dashboardRepository.getTopProducts(),
        dashboardRepository.getTopClients()
      ]);

      res.json({
        ventas_hoy: ventasDia || 0,
        ventas_mes: ventasMes || 0,
        top_productos: topProductos,
        top_clientes: topClientes
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
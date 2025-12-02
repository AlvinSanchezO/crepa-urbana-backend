const { User } = require('../models');

class UserController {
  async getAllClients(req, res, next) {
    try {
      const users = await User.findAll({
        where: { rol: 'cliente' }, // Solo clientes, no admins
        attributes: ['id', 'nombre', 'email', 'telefono', 'puntos_actuales'], // Datos seguros
        order: [['nombre', 'ASC']]
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
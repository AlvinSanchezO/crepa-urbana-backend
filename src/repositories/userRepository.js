const BaseRepository = require('./BaseRepository');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  // Aquí podemos agregar métodos exclusivos de usuarios
  // Por ejemplo: Buscar por Email (muy usado en Login)
  async findByEmail(email) {
    return await this.getOne({ where: { email } });
  }
}

module.exports = new UserRepository();
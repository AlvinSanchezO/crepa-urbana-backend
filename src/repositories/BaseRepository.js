class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // Obtener todos (con filtros opcionales)
  async getAll(options = {}) {
    return await this.model.findAll(options);
  }

  // Obtener uno por ID
  async getById(id) {
    return await this.model.findByPk(id);
  }

  // Obtener uno con filtro específico (ej: buscar por email)
  async getOne(options) {
    return await this.model.findOne(options);
  }

  // Crear registro
  async create(data) {
    return await this.model.create(data);
  }

  // Actualizar registro
  async update(id, data) {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    
    return await record.update(data);
  }

  // Eliminar registro (Soft delete o físico, aquí usamos físico)
  async delete(id) {
    const record = await this.model.findByPk(id);
    if (!record) return null;

    await record.destroy();
    return true;
  }
}

module.exports = BaseRepository;
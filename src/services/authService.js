const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  
  // Lógica para registrar un nuevo usuario
  async register(userData) {
    // 1. Verificar si el email ya existe
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    // 2. Crear usuario (El hash del password lo hace el Modelo automáticamente)
    const newUser = await userRepository.create(userData);
    
    // 3. Retornar datos sin el password
    const { password, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  }

  // Lógica para iniciar sesión
  async login(email, password) {
    // 1. Buscar usuario
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    // 2. Comparar contraseña (texto plano vs hash en DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas.');
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return { user, token };
  }
}

module.exports = new AuthService();
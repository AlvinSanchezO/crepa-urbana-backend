const authService = require('../services/authService');

class AuthController {

  // POST /register
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user
      });
    } catch (error) {
      // Si el error es conocido (ej. email duplicado), respondemos 400
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });
    } catch (error) {
      // Error de credenciales = 401 (Unauthorized)
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
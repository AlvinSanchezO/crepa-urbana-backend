const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario está logueado (Tiene Token válido)
exports.protect = (req, res, next) => {
  let token;

  // Buscar token en el header Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No estás autorizado. Por favor inicia sesión.' 
    });
  }

  try {
    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar datos del usuario en la request para usarlo en los controladores
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado.' 
    });
  }
};

// 2. Restringir acceso por Roles (ej: solo admin)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user viene del middleware 'protect' anterior
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para realizar esta acción.' 
      });
    }
    next();
  };
};
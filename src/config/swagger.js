const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crepa Urbana API',
      version: '1.0.0',
      description: 'Documentación de la API para la plataforma de pedidos y lealtad.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor de Desarrollo' },
    ],
    paths: {
      '/api/status': {
        get: {
          summary: 'Verificar estado del servidor',
          tags: ['General'],
          responses: {
            200: { description: 'El servidor está funcionando correctamente' }
          }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Registrar un nuevo usuario',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nombre: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    telefono: { type: 'string' }
                  },
                  required: ['nombre', 'email', 'password']
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario registrado exitosamente' },
            400: { description: 'Error de validación o usuario ya existe' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso (Retorna Token)' },
            401: { description: 'Credenciales inválidas' }
          }
        }
      }
    }
  },
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
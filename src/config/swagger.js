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
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
    ],
    // Definimos la ruta aquí manualmente para evitar errores de indentación
    paths: {
      '/api/status': {
        get: {
          summary: 'Verificar estado del servidor',
          tags: ['General'],
          responses: {
            200: {
              description: 'El servidor está funcionando correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      timestamp: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  // Dejamos esto vacío por ahora para que no busque en archivos y falle
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
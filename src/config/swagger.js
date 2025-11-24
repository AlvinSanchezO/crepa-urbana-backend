const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crepa Urbana API',
      version: '1.0.0',
      description: 'API Backend para gestión de pedidos, menú y sistema de lealtad.',
      contact: {
        name: 'Soporte Técnico',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo (Local)',
      },
    ],
    // 1. Configuración de Seguridad (Candado)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Esquema: Usuario (Registro)
        UserRegister: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan@mail.com' },
            password: { type: 'string', example: '123456' },
            telefono: { type: 'string', example: '555-1234' }
          }
        },
        // Esquema: Login
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'juan@mail.com' },
            password: { type: 'string', example: '123456' }
          }
        },
        // Esquema: Producto
        Product: {
          type: 'object',
          required: ['nombre', 'precio', 'categoria_id'],
          properties: {
            nombre: { type: 'string', example: 'FresaManía' },
            descripcion: { type: 'string', example: 'Crepa con fresas y nutella' },
            precio: { type: 'number', example: 85.00 },
            categoria_id: { type: 'integer', example: 1 },
            imagen_url: { type: 'string', example: 'http://img.com/fresa.jpg' }
          }
        },
        // Esquema: Pedido (Creación)
        OrderCreate: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  producto_id: { type: 'integer', example: 1 },
                  cantidad: { type: 'integer', example: 2 },
                  notas: { type: 'string', example: 'Sin chantilly' }
                }
              }
            }
          }
        },
        // Esquema: Actualizar Estado Pedido
        OrderStatus: {
          type: 'object',
          properties: {
            estado: { 
              type: 'string', 
              enum: ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'],
              example: 'en_preparacion' 
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }], // Aplica seguridad global (opcional, o por ruta)
    
    // 2. Definición de Rutas (Endpoints)
    paths: {
      // --- GENERAL ---
      '/api/status': {
        get: {
          summary: 'Verificar estado del servidor',
          tags: ['General'],
          security: [], // Público
          responses: {
            200: { description: 'API activa' }
          }
        }
      },

      // --- AUTH ---
      '/api/auth/register': {
        post: {
          summary: 'Registrar nuevo usuario',
          tags: ['Auth'],
          security: [], // Público
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } } }
          },
          responses: {
            201: { description: 'Usuario creado' },
            400: { description: 'Datos inválidos' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión (Obtener Token)',
          tags: ['Auth'],
          security: [], // Público
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserLogin' } } }
          },
          responses: {
            200: { description: 'Login exitoso' },
            401: { description: 'Credenciales incorrectas' }
          }
        }
      },

      // --- PRODUCTOS ---
      '/api/products': {
        get: {
          summary: 'Obtener menú completo',
          tags: ['Productos'],
          security: [], // Público
          responses: { 200: { description: 'Lista de productos' } }
        },
        post: {
          summary: 'Crear producto (Admin/Staff)',
          tags: ['Productos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          responses: { 201: { description: 'Producto creado' }, 403: { description: 'No autorizado' } }
        }
      },
      '/api/products/{id}': {
        get: {
          summary: 'Obtener un producto por ID',
          tags: ['Productos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          security: [],
          responses: { 200: { description: 'Detalle del producto' }, 404: { description: 'No encontrado' } }
        },
        put: {
          summary: 'Actualizar producto (Admin/Staff)',
          tags: ['Productos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          responses: { 200: { description: 'Producto actualizado' } }
        },
        delete: {
          summary: 'Eliminar producto (Admin/Staff)',
          tags: ['Productos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Producto eliminado' } }
        }
      },

      // --- PEDIDOS ---
      '/api/orders': {
        post: {
          summary: 'Crear un nuevo pedido',
          tags: ['Pedidos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreate' } } }
          },
          responses: { 201: { description: 'Pedido creado y puntos sumados' } }
        },
        get: {
          summary: 'Ver todos los pedidos (Admin/Staff)',
          tags: ['Pedidos'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de todos los pedidos' } }
        }
      },
      '/api/orders/my-orders': {
        get: {
          summary: 'Ver mis pedidos (Cliente)',
          tags: ['Pedidos'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Historial personal de pedidos' } }
        }
      },
      '/api/orders/{id}/status': {
        patch: {
          summary: 'Actualizar estado del pedido',
          tags: ['Pedidos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderStatus' } } }
          },
          responses: { 200: { description: 'Estado actualizado' } }
        }
      },

      // --- LEALTAD ---
      '/api/loyalty/history': {
        get: {
          summary: 'Ver historial de puntos y saldo',
          tags: ['Lealtad'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Historial y saldo actual',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      saldo: 150,
                      movimientos: [
                        { tipo_movimiento: 'acumulacion', cantidad: 15, fecha: '2023-11-24T10:00:00Z' }
                      ]
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
  apis: [], // No buscar en archivos, todo está aquí definido
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
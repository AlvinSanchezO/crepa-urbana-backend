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
        },
        // Esquema: Crear Payment Intent
        PaymentIntentCreate: {
          type: 'object',
          required: ['amount', 'description'],
          properties: {
            amount: { type: 'number', example: 45.99, description: 'Monto en dólares' },
            description: { type: 'string', example: 'Pago de orden de crepas' },
            orderId: { type: 'integer', example: 1, description: 'ID de la orden (opcional)' }
          }
        },
        // Esquema: Confirmar Payment
        PaymentConfirm: {
          type: 'object',
          required: ['paymentIntentId'],
          properties: {
            paymentIntentId: { type: 'string', example: 'pi_xxxxxxxxxxxxx' },
            orderId: { type: 'integer', example: 1, description: 'ID de la orden (opcional)' }
          }
        },
        // Esquema: Refund
        PaymentRefund: {
          type: 'object',
          required: ['paymentIntentId'],
          properties: {
            paymentIntentId: { type: 'string', example: 'pi_xxxxxxxxxxxxx' },
            amount: { type: 'number', example: 45.99, description: 'Monto a reembolsar (opcional, si no se envía es completo)' }
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
      },

      // --- PAGOS (STRIPE) ---
      '/api/payments/create-intent': {
        post: {
          summary: 'Crear Payment Intent (Iniciar Pago)',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentIntentCreate' }
              }
            }
          },
          responses: {
            201: {
              description: 'Payment Intent creado exitosamente',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Payment Intent creado',
                    data: {
                      clientSecret: 'pi_xxxxx_secret_yyyy',
                      transactionId: 5,
                      paymentIntentId: 'pi_xxxxxxxxxxxxx'
                    }
                  }
                }
              }
            },
            400: { description: 'Datos inválidos' }
          }
        }
      },
      '/api/payments/confirm': {
        post: {
          summary: 'Confirmar Pago',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentConfirm' }
              }
            }
          },
          responses: {
            200: {
              description: 'Pago confirmado o en proceso',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Pago confirmado exitosamente',
                    status: 'succeeded',
                    amount: 45.99,
                    transactionId: 5,
                    orderId: 1
                  }
                }
              }
            }
          }
        }
      },
      '/api/payments/status/{paymentIntentId}': {
        get: {
          summary: 'Verificar estado de un pago',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'paymentIntentId', required: true, schema: { type: 'string' }, example: 'pi_xxxxxxxxxxxxx' }
          ],
          responses: {
            200: { description: 'Estado actual del pago' }
          }
        }
      },
      '/api/payments/my-transactions': {
        get: {
          summary: 'Ver mis transacciones',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
            { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } }
          ],
          responses: {
            200: { description: 'Historial de transacciones del usuario' }
          }
        }
      },
      '/api/payments/refund': {
        post: {
          summary: 'Procesar reembolso (Admin)',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentRefund' }
              }
            }
          },
          responses: {
            200: { description: 'Reembolso procesado' },
            403: { description: 'No autorizado (requiere ser Admin)' }
          }
        }
      },
      '/api/payments/revenue-stats': {
        get: {
          summary: 'Obtener estadísticas de ingresos (Admin)',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'startDate', required: true, schema: { type: 'string', format: 'date' }, example: '2024-01-01' },
            { in: 'query', name: 'endDate', required: true, schema: { type: 'string', format: 'date' }, example: '2024-12-31' }
          ],
          responses: {
            200: {
              description: 'Estadísticas de ingresos en el período',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      periodo: { desde: '2024-01-01', hasta: '2024-12-31' },
                      transacciones_exitosas: 42,
                      ingresos_total: '1500.50',
                      ingresos_promedio: '35.73'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/users': {
      get: {
        summary: 'Obtener lista de usuarios clientes',
        description: 'Admin puede obtener lista de todos los usuarios con rol cliente',
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        responses: {
          200: {
            description: 'Lista de usuarios obtenida correctamente',
            content: {
              'application/json': {
                example: [
                  {
                    id: 1,
                    nombre: 'Juan Pérez',
                    email: 'juan@mail.com',
                    telefono: '555-1234',
                    puntos_actuales: 150
                  }
                ]
              }
            }
          },
          401: { description: 'No autenticado' },
          403: { description: 'No autorizado (requiere ser admin)' }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        summary: 'Obtener detalles de un usuario',
        description: 'Admin puede obtener detalles completos de un usuario específico',
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del usuario'
          }
        ],
        responses: {
          200: {
            description: 'Detalles del usuario',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 1,
                    nombre: 'Juan Pérez',
                    email: 'juan@mail.com',
                    telefono: '555-1234',
                    rol: 'cliente',
                    puntos_actuales: 150,
                    fecha_registro: '2024-01-15T10:30:00Z'
                  }
                }
              }
            }
          },
          404: { description: 'Usuario no encontrado' },
          401: { description: 'No autenticado' },
          403: { description: 'No autorizado' }
        }
      },
      delete: {
        summary: 'Eliminar un usuario',
        description: 'Admin puede eliminar un usuario. No se puede eliminar a sí mismo.',
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del usuario a eliminar'
          }
        ],
        responses: {
          200: {
            description: 'Usuario eliminado correctamente',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Usuario eliminado correctamente',
                  data: {
                    usuario_id: 5,
                    usuario_eliminado: 'usuario@mail.com',
                    fecha_eliminacion: '2024-12-10T15:30:00Z'
                  }
                }
              }
            }
          },
          400: {
            description: 'Solicitud inválida',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'No puedes eliminarte a ti mismo'
                }
              }
            }
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'Usuario no encontrado'
                }
              }
            }
          },
          401: { description: 'No autenticado' },
          403: { description: 'No autorizado (requiere ser admin)' }
        }
      }
    }
  },
  apis: [], // No buscar en archivos, todo está aquí definido
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
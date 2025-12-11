# 🥞 Crepa Urbana - Backend API

Plataforma digital de pedidos y sistema de lealtad para "Crepa Urbana".

Este backend actúa como el núcleo central del negocio, gestionando usuarios, un catálogo dinámico de productos, procesamiento de pedidos transaccionales con pagos integrados mediante Stripe y un motor automatizado de puntos de recompensa para fidelización de clientes.

## 🚀 Características Principales

* **🔐 Autenticación y Seguridad:** Registro e inicio de sesión seguro utilizando `Bcrypt` para hashing y `JWT` (JSON Web Tokens).
* **📋 Gestión de Menú:** CRUD completo para productos y categorías.
* **🛒 Pedidos Transaccionales:** Procesamiento de órdenes con validación de stock y transacciones atómicas (ACID).
* **💳 Pagos con Stripe:** Integración completa de Stripe Payment Intents API para pagos seguros con tarjetas de crédito/débito.
* **💎 Sistema de Lealtad:** Cálculo automático de puntos y consulta de historial. 1 punto por cada $1 USD gastado.
* **👥 Gestión de Usuarios:** CRUD administrativo con eliminación en cascada de datos relacionados.
* **🛡️ Arquitectura Escalable:** Diseño modular basado en el patrón **CSR** (Controller-Service-Repository).
* **📚 Documentación Viva:** API documentada con **Swagger/OpenAPI**.
* **🔄 Webhooks:** Manejo automático de eventos de Stripe para actualización de estados de pago.

## 🛠 Stack Tecnológico

* **Node.js** & **Express.js 5.1.0**
* **Microsoft SQL Server** & **Sequelize ORM**
* **JWT**, **Bcrypt**, **Stripe API**, **Dotenv**, **Cors**, **Helmet**
* **Swagger/OpenAPI 3.0** para documentación

## ⚙️ Guía de Instalación

### 1. Prerrequisitos
* Node.js (v18 o superior)
* Microsoft SQL Server (Local o Azure)
* Git
* Cuenta Stripe (para pagos)

### 2. Clonar el repositorio
```bash
git clone https://github.com/AlvinSanchezO/crepa-urbana-backend.git
cd crepa-urbana-backend
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto y agrega lo siguiente:

```env
# Servidor
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=*

# Base de Datos (SQL Server)
DB_NAME=CrepaUrbanaDB
DB_USER=tu_usuario_sql
DB_PASS=tu_password_sql
DB_HOST=localhost
DB_PORT=1433

# Seguridad (JWT)
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=8h

# Stripe (Pagos)
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 5. Configurar Base de Datos
Ejecuta el script SQL ubicado en `/db/init_db.sql` en tu gestor de base de datos (SQL Server Management Studio o Azure Data Studio) para crear las tablas necesarias.

## ▶️ Ejecución

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará escuchando en: `http://localhost:3000`

## 📚 Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva:

👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 📋 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de nuevo usuario
- `POST /api/auth/login` - Inicio de sesión

### Productos
- `GET /api/productos` - Listar todos los productos
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/mis-pedidos` - Obtener pedidos del usuario
- `GET /api/pedidos/:id` - Obtener detalles de un pedido

### Pagos (Stripe)
- `POST /api/payments/create-intent` - Crear Payment Intent
- `POST /api/payments/confirm` - Confirmar pago y crear orden
- `GET /api/payments/status/:id` - Verificar estado del pago
- `GET /api/payments/my-transactions` - Historial de transacciones

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/:id` - Obtener detalles de usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario con cascada (admin)

### Lealtad
- `GET /api/loyalty/mis-puntos` - Consultar puntos actuales
- `GET /api/loyalty/historial` - Historial de puntos

## 🔒 Seguridad

* **JWT Authentication:** Todos los endpoints protegidos requieren token válido
* **Role-Based Access Control:** Diferentes niveles de acceso (cliente, admin, staff)
* **Stripe Webhook Verification:** Validación de firma para webhooks
* **Bcrypt Hashing:** Contraseñas hasheadas de forma segura
* **CORS Protection:** Configuración de orígenes permitidos
* **Helmet.js:** Headers de seguridad HTTP

## 🤝 Contribución

Este proyecto utiliza el flujo de trabajo Feature Branch:

1. Haz un Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz Commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Haz Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte de un trabajo académico.

## 👨‍💻 Autor

**Alvin Sánchez** - [GitHub](https://github.com/AlvinSanchezO)
# 🥞 Crepa Urbana - Backend API

Plataforma digital de pedidos y sistema de lealtad para "Crepa Urbana".

Este backend actúa como el núcleo central del negocio, gestionando usuarios, un catálogo dinámico de productos, procesamiento de pedidos transaccionales y un motor automatizado de puntos de recompensa para fidelización de clientes.

## 🚀 Características Principales

* **🔐 Autenticación y Seguridad:** Registro e inicio de sesión seguro utilizando `Bcrypt` para hashing y `JWT` (JSON Web Tokens).
* **📋 Gestión de Menú:** CRUD completo para productos y categorías.
* **🛒 Pedidos Transaccionales:** Procesamiento de órdenes con validación de stock y transacciones atómicas (ACID).
* **💎 Sistema de Lealtad:** Cálculo automático de puntos y consulta de historial.
* **🛡️ Arquitectura Escalable:** Diseño modular basado en el patrón **CSR**.
* **📚 Documentación Viva:** API documentada con **Swagger/OpenAPI**.

## 🛠 Stack Tecnológico

* **Node.js** & **Express.js**
* **Microsoft SQL Server** & **Sequelize**
* **JWT**, **Bcrypt**, **Dotenv**, **Cors**

## ⚙️ Guía de Instalación

### 1. Prerrequisitos
* Node.js (v18 o superior)
* Microsoft SQL Server (Local o Azure)
* Git

### 2. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/crepa-urbana-backend.git](https://github.com/TU_USUARIO/crepa-urbana-backend.git)
cd crepa-urbana-backend

### 3. Instalar dependencias
npm install

### 4. Configurar Variables de Entorno. Clonar el repositorio
Crea un archivo llamado .env en la raíz del proyecto y agrega lo siguiente:
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

### 5. Configurar Base de Datos
Ejecuta el script SQL ubicado en /db/init_db.sql en tu gestor de base de datos (SQL Server Management Studio o Azure Data Studio) para crear las tablas necesarias.

▶️ Ejecución
Para iniciar el servidor en modo desarrollo (con reinicio automático):
npx nodemon src/server.js
El servidor estará escuchando en: http://localhost:3000

### 📚 Documentación de la API
Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva:

👉 http://localhost:3000/api-docs

### 🤝 Contribución
Este proyecto utiliza el flujo de trabajo Feature Branch:

Haz un Fork del repositorio.

Crea una rama para tu feature (git checkout -b feature/nueva-funcionalidad).

Haz Commit de tus cambios (git commit -m 'Agrega nueva funcionalidad').

Haz Push a la rama (git push origin feature/nueva-funcionalidad).

Abre un Pull Request.


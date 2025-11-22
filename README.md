# 🥞 Crepa Urbana - Backend API

Plataforma digital de pedidos y sistema de lealtad para "Crepa Urbana". Este sistema gestiona usuarios, productos, órdenes y puntos de recompensa, diseñado para optimizar la operación y fomentar la retención de clientes.

## 🚀 Tecnologías

* **Lenguaje:** JavaScript
* **Runtime:** Node.js
* **Framework:** Express.js
* **Base de Datos:** Microsoft SQL Server
* **ORM:** Sequelize
* **Arquitectura:** CSR (Controller - Service - Repository)
* **Documentación:** Swagger (OpenAPI 3.0)

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura en capas para asegurar escalabilidad y mantenimiento:

```text
/src
  ├── /config         # Configuración de DB y Swagger
  ├── /controllers    # Manejo de peticiones HTTP
  ├── /services       # Lógica de negocio
  ├── /repositories   # Acceso a datos
  ├── /models         # Modelos Sequelize
  ├── /routes         # Definición de endpoints
  └── app.js          # Configuración de Express
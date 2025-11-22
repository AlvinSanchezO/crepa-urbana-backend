-- Archivo: /db/init_db.sql
-- Descripción: Script inicial para crear tablas en SQL Server
-- Proyecto: Crepa Urbana

-- 1. Tabla de Usuarios
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    telefono NVARCHAR(20),
    rol NVARCHAR(20) DEFAULT 'cliente',
    puntos_actuales INT DEFAULT 0,
    fecha_registro DATETIME DEFAULT GETDATE(),
    CONSTRAINT CK_Users_Rol CHECK (rol IN ('cliente', 'admin', 'staff'))
);

-- 2. Tabla de Categorías
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX),
    activa BIT DEFAULT 1
);

-- 3. Tabla de Productos
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX),
    precio DECIMAL(10,2) NOT NULL,
    imagen_url NVARCHAR(255),
    categoria_id INT NOT NULL,
    disponible BIT DEFAULT 1,
    CONSTRAINT FK_Products_Category FOREIGN KEY (categoria_id) REFERENCES categories(id)
);

-- 4. Tabla de Pedidos (Orders)
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    estado NVARCHAR(20) DEFAULT 'pendiente',
    total_pagar DECIMAL(10,2) NOT NULL,
    puntos_ganados INT DEFAULT 0,
    metodo_pago NVARCHAR(20),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Orders_User FOREIGN KEY (usuario_id) REFERENCES users(id),
    CONSTRAINT CK_Orders_Estado CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
    CONSTRAINT CK_Orders_MetodoPago CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'puntos'))
);

-- 5. Tabla de Detalle de Pedido (Order Items)
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    notas_personalizadas NVARCHAR(MAX),
    CONSTRAINT FK_OrderItems_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
    CONSTRAINT FK_OrderItems_Product FOREIGN KEY (producto_id) REFERENCES products(id)
);

-- 6. Tabla de Historial de Lealtad (Loyalty Logs)
CREATE TABLE loyalty_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    pedido_id INT NULL,
    tipo_movimiento NVARCHAR(20) NOT NULL,
    cantidad_puntos INT NOT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Loyalty_User FOREIGN KEY (usuario_id) REFERENCES users(id),
    CONSTRAINT FK_Loyalty_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
    CONSTRAINT CK_Loyalty_Tipo CHECK (tipo_movimiento IN ('acumulacion', 'canje', 'ajuste_manual'))
);
GO
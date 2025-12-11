-- Archivo: /db/init_db_postgres.sql
-- Descripción: Script inicial para crear tablas en PostgreSQL
-- Proyecto: Crepa Urbana

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'cliente',
    puntos_actuales INTEGER DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CK_Users_Rol CHECK (rol IN ('cliente', 'admin', 'staff'))
);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen_url VARCHAR(255),
    categoria_id INTEGER NOT NULL,
    disponible BOOLEAN DEFAULT true,
    CONSTRAINT FK_Products_Category FOREIGN KEY (categoria_id) REFERENCES categories(id)
);

-- 4. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    total_pagar DECIMAL(10,2) NOT NULL,
    puntos_ganados INTEGER DEFAULT 0,
    metodo_pago VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Orders_User FOREIGN KEY (usuario_id) REFERENCES users(id),
    CONSTRAINT CK_Orders_Estado CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
    CONSTRAINT CK_Orders_MetodoPago CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'puntos'))
);

-- 5. Tabla de Detalle de Pedido (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    notas_personalizadas TEXT,
    CONSTRAINT FK_OrderItems_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
    CONSTRAINT FK_OrderItems_Product FOREIGN KEY (producto_id) REFERENCES products(id)
);

-- 6. Tabla de Historial de Lealtad (Loyalty Logs)
CREATE TABLE IF NOT EXISTS loyalty_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    pedido_id INTEGER NULL,
    tipo_movimiento VARCHAR(20) NOT NULL,
    cantidad_puntos INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Loyalty_User FOREIGN KEY (usuario_id) REFERENCES users(id),
    CONSTRAINT FK_Loyalty_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
    CONSTRAINT CK_Loyalty_Tipo CHECK (tipo_movimiento IN ('acumulacion', 'canje', 'ajuste_manual'))
);

-- 7. Tabla de Transacciones (Stripe Payments)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    pedido_id INTEGER NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    estado VARCHAR(30) NOT NULL,
    metodo_pago VARCHAR(50),
    ultimos_4_digitos VARCHAR(4),
    descripcion TEXT,
    error_mensaje TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    fecha_fallida TIMESTAMP,
    CONSTRAINT FK_Transactions_User FOREIGN KEY (usuario_id) REFERENCES users(id),
    CONSTRAINT FK_Transactions_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
    CONSTRAINT CK_Transactions_Estado CHECK (estado IN ('pending', 'succeeded', 'failed', 'canceled', 'requires_action'))
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS IX_Transactions_PaymentIntent ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS IX_Transactions_User ON transactions(usuario_id);
CREATE INDEX IF NOT EXISTS IX_Orders_User ON orders(usuario_id);
CREATE INDEX IF NOT EXISTS IX_LoyaltyLogs_User ON loyalty_logs(usuario_id);
CREATE INDEX IF NOT EXISTS IX_Products_Category ON products(categoria_id);

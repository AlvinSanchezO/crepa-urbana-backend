-- Script para crear tabla de transacciones si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'transactions')
BEGIN
    CREATE TABLE transactions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL,
        pedido_id INT NULL,
        stripe_payment_intent_id NVARCHAR(255),
        stripe_charge_id NVARCHAR(255),
        monto DECIMAL(10,2) NOT NULL,
        moneda NVARCHAR(3) DEFAULT 'USD',
        estado NVARCHAR(30) NOT NULL,
        metodo_pago NVARCHAR(50),
        ultimos_4_digitos NVARCHAR(4),
        descripcion NVARCHAR(MAX),
        error_mensaje NVARCHAR(MAX),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_confirmacion DATETIME,
        fecha_fallida DATETIME,
        CONSTRAINT FK_Transactions_User FOREIGN KEY (usuario_id) REFERENCES users(id),
        CONSTRAINT FK_Transactions_Order FOREIGN KEY (pedido_id) REFERENCES orders(id),
        CONSTRAINT CK_Transactions_Estado CHECK (estado IN ('pending', 'succeeded', 'failed', 'canceled', 'requires_action'))
    );
    
    CREATE INDEX IX_Transactions_PaymentIntent ON transactions(stripe_payment_intent_id);
    CREATE INDEX IX_Transactions_User ON transactions(usuario_id);
    CREATE INDEX IX_Transactions_Order ON transactions(pedido_id);
    
    PRINT 'Tabla transactions creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla transactions ya existe';
END

-- Archivo: /db/seed_data.sql
-- Descripción: Script para insertar datos de prueba en PostgreSQL
-- Proyecto: Crepa Urbana
-- Nota: Ejecutar después de init_db_postgres.sql

-- ============================================
-- 1. INSERTAR CATEGORÍAS
-- ============================================
INSERT INTO categories (nombre, descripcion, activa)
VALUES 
  ('Crepes Dulces', 'Crepes con sabores dulces y postres', true),
  ('Crepes Saladas', 'Crepes con rellenos salados', true);

-- ============================================
-- 2. INSERTAR PRODUCTOS (en PESOS MEXICANOS)
-- ============================================
INSERT INTO products (nombre, descripcion, precio, imagen_url, categoria_id, disponible)
VALUES 
  ('Crepe Nutella', 'Crepe con chocolate y avellanas', 220.00, 'https://via.placeholder.com/300', 1, true),
  ('Crepe Fresa', 'Crepe con fresas frescas y crema', 189.00, 'https://via.placeholder.com/300', 1, true),
  ('Crepe Jamón y Queso', 'Crepe rellena de jamón y queso', 210.00, 'https://via.placeholder.com/300', 2, true),
  ('Crepe Pollo BBQ', 'Crepe con pollo y salsa BBQ', 250.00, 'https://via.placeholder.com/300', 2, true),
  ('Crepe Banana Split', 'Crepe con plátano, chocolate y vainilla', 270.00, 'https://via.placeholder.com/300', 1, true);

-- ============================================
-- 3. INSERTAR USUARIO DE PRUEBA
-- ============================================
-- Nota: Los usuarios normales deben registrarse desde el frontend
-- Este es solo un ejemplo de estructura. Los hashes deben generarse con bcrypt en el backend.
-- Email: test@crepa.com
-- Password: test123 (debes registrarte desde el frontend)

-- Para crear un usuario admin, ve a pgAdmin y ejecuta:
-- UPDATE users SET rol = 'admin' WHERE email = 'tu_email@ejemplo.com';

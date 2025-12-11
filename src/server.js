require('dotenv').config(); // <--- ESTO DEBE IR PRIMERO
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    console.log('🔄 Intentando conectar a PostgreSQL...');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Base de datos: ${process.env.DB_NAME}`);
    
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    process.exit(1);
  }
}

main();
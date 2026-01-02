// En server.js (verificar)
require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/models');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Jobs Out API...');
    console.log('==================================\n');
    
    // Probar conexión a la base de datos
    console.log('🔌 Probando conexión a PostgreSQL...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.error('\n💡 Verifica:');
      console.error('   1. Que PostgreSQL esté corriendo');
      console.error('   2. Las credenciales en .env');
      console.error('   3. Que la base de datos "db-trabajos" exista');
      process.exit(1);
    }
    
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n🎉 =================================');
      console.log('   Servidor iniciado exitosamente');
      console.log('   =================================');
      console.log(`   📡 URL: http://localhost:${PORT}`);
      console.log(`   🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`   📊 Base de datos: ${process.env.DB_DEV_NAME}`);
      console.log(`   🔗 Health: http://localhost:${PORT}/api/health`);
      console.log(`   📚 Swagger: http://localhost:${PORT}/api-docs`);
      console.log('   =================================\n');
      
      console.log('   🛣️  Rutas principales:');
      console.log(`   ├── GET  /                    - Bienvenida`);
      console.log(`   ├── GET  /api/health         - Salud del sistema`);
      console.log(`   ├── GET  /api/provincias     - Provincias de Cuba`);
      console.log(`   ├── GET  /api/municipios     - Municipios de Cuba`);
      console.log(`   ├── POST /api/auth/register  - Registrar usuario`);
      console.log(`   ├── POST /api/auth/login     - Iniciar sesión`);
      console.log(`   └── GET  /api-docs           - Documentación API`);
      console.log('   =================================\n');
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre elegante
process.on('SIGINT', () => {
  console.log('\n👋 Recibido SIGINT. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Recibido SIGTERM. Cerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
});

startServer();
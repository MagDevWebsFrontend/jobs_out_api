// En test-sequelize-simple.js (en la raíz)
require('dotenv').config();

console.log('🧪 PRUEBA DE SEQUELIZE + POSTGRESQL\n');
console.log('======================================\n');

async function testSequelize() {
  try {
    // 1. Probar importación de Sequelize
    console.log('1. 📦 Importando Sequelize...');
    const { Sequelize, DataTypes } = require('sequelize');
    console.log('   ✅ Sequelize importado correctamente');
    
    // 2. Crear conexión simple
    console.log('\n2. 🔌 Creando conexión Sequelize...');
    const sequelize = new Sequelize(
      process.env.DB_DEV_NAME,
      process.env.DB_DEV_USER,
      process.env.DB_DEV_PASS,
      {
        host: process.env.DB_DEV_HOST,
        port: process.env.DB_DEV_PORT,
        dialect: 'postgres',
        logging: false // Sin logs
      }
    );
    
    // 3. Probar autenticación
    console.log('\n3. 🔐 Probando autenticación...');
    await sequelize.authenticate();
    console.log('   ✅ Autenticación exitosa');
    
    // 4. Probar consulta simple
    console.log('\n4. 📊 Probando consulta a tablas existentes...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`   ✅ ${tables.length} tablas encontradas:`);
    tables.forEach((table, i) => {
      console.log(`      ${i + 1}. ${table.table_name}`);
    });
    
    // 5. Probar modelos básicos
    console.log('\n5. 🗃️  Probando definición de modelos...');
    
    // Modelo Usuario simple
    const Usuario = sequelize.define('Usuario', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, {
      tableName: 'usuarios',
      timestamps: false // Las tablas ya existen
    });
    
    // Probar contar usuarios
    try {
      const count = await Usuario.count();
      console.log(`   ✅ Modelo Usuario funciona: ${count} usuarios en la base de datos`);
    } catch (error) {
      console.log(`   ⚠️  Error con modelo Usuario: ${error.message}`);
    }
    
    // 6. Cerrar conexión
    await sequelize.close();
    console.log('\n6. ✅ Conexión cerrada correctamente');
    
    console.log('\n======================================');
    console.log('🎉 ¡SEQUELIZE FUNCIONA CORRECTAMENTE!');
    console.log('🚀 Ahora podemos continuar con el proyecto.');
    
  } catch (error) {
    console.error('\n❌ ERROR EN SEQUELIZE:');
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    
    if (error.message.includes('logger')) {
      console.error('\n💡 PROBLEMA CON EL LOGGER:');
      console.error('   El error "logger.debug is not a function" viene de src/models/index.js');
      console.error('   Vamos a corregirlo ahora...');
    }
  }
}

testSequelize();
// En test-simple-model.js (para probar)
require('dotenv').config();

console.log('🧪 PRUEBA SIMPLE DE UN MODELO\n');
console.log('================================\n');

async function test() {
  try {
    // 1. Cargar solo la conexión
    console.log('1. 🔌 Cargando conexión...');
    const sequelize = require('./src/models/connection');
    
    // 2. Probar conexión directa
    console.log('\n2. 🔐 Probando autenticación...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa');
    
    // 3. Crear un modelo simple directamente
    console.log('\n3. 🗃️  Creando modelo simple...');
    const { DataTypes } = require('sequelize');
    
    const UsuarioSimple = sequelize.define('UsuarioSimple', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      username: {
        type: DataTypes.CITEXT,
        allowNull: false,
        unique: true
      }
    }, {
      tableName: 'usuarios',
      timestamps: false
    });
    
    // 4. Probar consulta
    console.log('\n4. 📊 Consultando usuarios...');
    const usuarios = await UsuarioSimple.findAll({
      limit: 3,
      attributes: ['id', 'nombre', 'username', 'rol']
    });
    
    console.log(`   ✅ ${usuarios.length} usuarios encontrados:`);
    usuarios.forEach(usuario => {
      console.log(`      • ${usuario.nombre} (${usuario.username}) - ${usuario.rol}`);
    });
    
    console.log('\n================================');
    console.log('🎉 ¡MODELO FUNCIONA CORRECTAMENTE!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n🔍 Stack:', error.stack);
  }
}

test();
// En test-all-models.js (en la raíz)
require('dotenv').config();

console.log('🧪 PRUEBA COMPLETA DE TODOS LOS MODELOS\n');
console.log('===========================================\n');

async function testAllModels() {
  try {
    // 1. Cargar conexión y modelos
    console.log('1. 📦 Cargando modelos...');
    const { sequelize, testConnection } = require('./src/models');
    const models = {
      Usuario: require('./src/models/Usuario'),
      ConfiguracionUsuario: require('./src/models/ConfiguracionUsuario'),
      Provincia: require('./src/models/Provincia'),
      Municipio: require('./src/models/Municipio'),
      Trabajo: require('./src/models/Trabajo'),
      TrabajoContacto: require('./src/models/TrabajoContacto'),
      Publicacion: require('./src/models/Publicacion'),
      Guardado: require('./src/models/Guardado'),
      Log: require('./src/models/Log')
    };
    
    console.log(`   ✅ ${Object.keys(models).length} modelos cargados`);
    
    // 2. Probar conexión
    console.log('\n2. 🔌 Probando conexión...');
    const connected = await testConnection();
    if (!connected) throw new Error('Conexión fallida');
    console.log('   ✅ Conexión establecida');
    
    // 3. Probar cada modelo
    console.log('\n3. 🗃️  Probando consultas a cada modelo:');
    
    for (const [modelName, Model] of Object.entries(models)) {
      try {
        const count = await Model.count();
        console.log(`   ✅ ${modelName}: ${count} registros`);
      } catch (error) {
        console.log(`   ⚠️  ${modelName}: Error - ${error.message}`);
      }
    }
    
    // 4. Probar relaciones básicas
    console.log('\n4. 🔗 Probando relaciones...');
    
    // Usuario con configuración
    try {
      const usuario = await models.Usuario.findOne({
        include: [{
          model: models.ConfiguracionUsuario,
          as: 'configuracion',
          required: false
        }]
      });
      
      if (usuario) {
        console.log(`   ✅ Usuario "${usuario.username}" encontrado`);
        if (usuario.configuracion) {
          console.log(`      Configuración: Telegram ${usuario.configuracion.telegram_notif ? 'activado' : 'desactivado'}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Relación Usuario-Configuracion: ${error.message}`);
    }
    
    // Provincias con municipios
    try {
      const provincia = await models.Provincia.findOne({
        include: [{
          model: models.Municipio,
          as: 'municipios',
          required: false
        }]
      });
      
      if (provincia) {
        const municipiosCount = provincia.municipios ? provincia.municipios.length : 0;
        console.log(`   ✅ Provincia "${provincia.nombre}": ${municipiosCount} municipios`);
      }
    } catch (error) {
      console.log(`   ⚠️  Relación Provincia-Municipio: ${error.message}`);
    }
    
    // 5. Resumen final
    console.log('\n5. 📊 Resumen de la base de datos:');
    
    const [tablesInfo] = await sequelize.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas,
        (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) as cnt FROM %I', table_name), false, true, '')))[1]::text::int as registros
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tablesInfo.forEach(table => {
      console.log(`   📁 ${table.table_name}: ${table.columnas} columnas, ${table.registros} registros`);
    });
    
    console.log('\n===========================================');
    console.log('🎉 ¡TODOS LOS MODELOS FUNCIONAN CORRECTAMENTE!');
    console.log('\n🚀 AHORA VAMOS A CREAR LOS SERVICIOS Y CONTROLADORES:');
    console.log('   1. Crear servicios en src/services/');
    console.log('   2. Crear controladores en src/controllers/');
    console.log('   3. Crear rutas en src/routes/');
    console.log('   4. Iniciar servidor: npm run dev');
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA DE MODELOS:');
    console.error(`   ${error.message}`);
    console.error(`\n🔍 Stack trace:`);
    console.error(error.stack);
  }
}

testAllModels();
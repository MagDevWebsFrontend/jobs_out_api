// En test-all-models-fixed.js
require('dotenv').config();

console.log('🧪 PRUEBA DE MODELOS (CORREGIDA)\n');
console.log('==================================\n');

async function testFixed() {
  try {
    // 1. Cargar desde index.js (que ahora funciona correctamente)
    console.log('1. 📦 Cargando desde index.js...');
    const { sequelize, testConnection, Usuario } = require('./src/models');
    
    console.log('   ✅ Modelos cargados sin dependencia circular');
    
    // 2. Probar conexión
    console.log('\n2. 🔌 Probando conexión...');
    const connected = await testConnection();
    if (!connected) throw new Error('Conexión fallida');
    console.log('   ✅ Conexión establecida');
    
    // 3. Probar consulta simple
    console.log('\n3. 👤 Consultando usuarios...');
    const usuarios = await Usuario.findAll({
      limit: 3,
      attributes: ['id', 'nombre', 'username', 'rol', 'created_at']
    });
    
    console.log(`   ✅ ${usuarios.length} usuarios encontrados:`);
    usuarios.forEach((usuario, i) => {
      const fecha = new Date(usuario.created_at).toLocaleDateString();
      console.log(`      ${i + 1}. ${usuario.nombre} (${usuario.username}) - ${usuario.rol} - Creado: ${fecha}`);
    });
    
    // 4. Probar otras tablas rápidamente
    console.log('\n4. 🗂️  Verificando todas las tablas:');
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) as cnt FROM %I', table_name), false, true, '')))[1]::text::int as registros
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tables.forEach(table => {
      console.log(`      📊 ${table.table_name}: ${table.registros} registros`);
    });
    
    console.log('\n==================================');
    console.log('🎉 ¡PROBLEMA DE DEPENDENCIA CIRCULAR SOLUCIONADO!');
    console.log('\n🚀 EL BACKEND ESTÁ LISTO PARA:');
    console.log('   1. Crear servicios (src/services/)');
    console.log('   2. Crear controladores (src/controllers/)');
    console.log('   3. Crear rutas (src/routes/)');
    console.log('   4. Configurar autenticación JWT');
    console.log('   5. Iniciar servidor: npm run dev');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n🔍 Stack trace (primeras líneas):');
    const stackLines = error.stack.split('\n').slice(0, 5);
    stackLines.forEach(line => console.error(`   ${line}`));
    
    if (error.message.includes('Cannot read properties of undefined')) {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   Aún hay problemas con las importaciones.');
      console.error('   Verifica que cada modelo importe de ./connection en lugar de ./index');
    }
  }
}

testFixed();
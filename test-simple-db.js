// En test-simple-db.js (en la raíz)
require('dotenv').config();
const { Client } = require('pg');

async function testPostgreSQL() {
  console.log('🧪 PRUEBA SIMPLE DE POSTGRESQL\n');
  console.log('==================================\n');
  
  // Mostrar configuración
  console.log('📋 Configuración:');
  console.log(`   Base de datos: ${process.env.DB_DEV_NAME}`);
  console.log(`   Usuario: ${process.env.DB_DEV_USER}`);
  console.log(`   Host: ${process.env.DB_DEV_HOST}:${process.env.DB_DEV_PORT}`);
  console.log(`   Contraseña: ${process.env.DB_DEV_PASS ? '••••••••' : 'NO CONFIGURADA'}`);
  
  const client = new Client({
    host: process.env.DB_DEV_HOST || 'localhost',
    port: process.env.DB_DEV_PORT || 5432,
    database: process.env.DB_DEV_NAME,
    user: process.env.DB_DEV_USER,
    password: process.env.DB_DEV_PASS
  });
  
  try {
    console.log('\n🔌 Conectando...');
    await client.connect();
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    
    // 1. Mostrar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;
    console.log(`\n🔧 PostgreSQL: ${version.split(',')[0].trim()}`);
    
    // 2. Mostrar base de datos actual
    const dbResult = await client.query('SELECT current_database()');
    console.log(`📊 Base de datos: ${dbResult.rows[0].current_database}`);
    
    // 3. Verificar si existen tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tablas existentes: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  No hay tablas. Se crearán automáticamente.');
    }
    
    // 4. Verificar extensiones
    const extensionsResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname
    `);
    
    console.log(`\n🔧 Extensiones instaladas: ${extensionsResult.rows.length}`);
    extensionsResult.rows.forEach(ext => {
      console.log(`   • ${ext.extname} (v${ext.extversion})`);
    });
    
    await client.end();
    
    console.log('\n==================================');
    console.log('🎉 ¡POSTGRESQL FUNCIONA CORRECTAMENTE!');
    console.log('🚀 Ahora prueba con Sequelize:');
    console.log('   node test-sequelize-simple.js');
    
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:');
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}`);
    
    console.error('\n🔧 DIAGNÓSTICO:');
    
    if (error.code === '28P01') {
      console.error('   🔐 ERROR DE AUTENTICACIÓN');
      console.error('   La contraseña es incorrecta o el usuario no existe');
      console.error('   💡 Verifica la contraseña en el archivo .env');
      
    } else if (error.code === '3D000') {
      console.error(`   🗄️  LA BASE DE DATOS NO EXISTE`);
      console.error(`   La base de datos "${process.env.DB_DEV_NAME}" no existe`);
      console.error('\n   💡 SOLUCIÓN:');
      console.error('   1. Conéctate a PostgreSQL:');
      console.error('      psql -U postgres');
      console.error('   2. Crea la base de datos:');
      console.error(`      CREATE DATABASE "${process.env.DB_DEV_NAME}";`);
      console.error('   3. Sal:');
      console.error('      \\q');
      console.error('\n   O usa este comando directo:');
      console.error(`      createdb -U postgres "${process.env.DB_DEV_NAME}"`);
      
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   🚫 CONEXIÓN RECHAZADA');
      console.error('   PostgreSQL no está corriendo o el puerto es incorrecto');
      console.error('\n   💡 SOLUCIÓN:');
      console.error('   1. Verifica que PostgreSQL esté instalado');
      console.error('   2. Inicia el servicio PostgreSQL:');
      console.error('      - En Windows: services.msc -> busca "PostgreSQL"');
      console.error('      - O en PowerShell:');
      console.error('        Get-Service postgresql*');
      console.error('        Start-Service postgresql-x64-14');
      
    } else if (error.code === 'ENOTFOUND') {
      console.error('   🌐 HOST NO ENCONTRADO');
      console.error(`   No se puede encontrar el host: ${process.env.DB_DEV_HOST}`);
      console.error('   💡 Verifica que el host sea correcto en .env');
      
    } else {
      console.error('   🔍 ERROR DESCONOCIDO');
      console.error('   💡 Intenta estos comandos:');
      console.error('      1. psql -U postgres');
      console.error('      2. \\l (para ver bases de datos)');
      console.error(`      3. CREATE DATABASE "${process.env.DB_DEV_NAME}";`);
    }
    
    console.error('\n📋 CONFIGURACIÓN ACTUAL EN .env:');
    console.error(`   DB_DEV_NAME=${process.env.DB_DEV_NAME}`);
    console.error(`   DB_DEV_USER=${process.env.DB_DEV_USER}`);
    console.error(`   DB_DEV_HOST=${process.env.DB_DEV_HOST}`);
    console.error(`   DB_DEV_PORT=${process.env.DB_DEV_PORT}`);
    console.error(`   DB_DEV_PASS=${process.env.DB_DEV_PASS ? '••••••••' : 'NO CONFIGURADA'}`);
  }
}

testPostgreSQL();
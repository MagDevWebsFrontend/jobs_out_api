// En debug-jwt.js
require('dotenv').config();
const JWTUtil = require('./src/utils/jwt');

console.log('🔍 DEBUG JWT Configuration\n');
console.log('============================\n');

// 1. Verificar variables de entorno
console.log('1. 📋 Variables de entorno JWT:');
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
console.log(`   JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '7d (default)'}`);
console.log(`   JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
console.log(`   JWT_REFRESH_EXPIRES_IN: ${process.env.JWT_REFRESH_EXPIRES_IN || '30d (default)'}\n`);

// 2. Probar generación y verificación de token
console.log('2. 🔐 Probar generación/verificación de token:');
try {
  const payload = {
    id: 'test-id-123',
    username: 'testuser',
    rol: 'trabajador'
  };
  
  // Generar token
  const token = JWTUtil.generateToken(payload);
  console.log(`   ✅ Token generado: ${token.substring(0, 50)}...`);
  
  // Decodificar sin verificar
  const decoded = JWTUtil.decodeToken(token);
  console.log(`   📅 Expira en: ${new Date(decoded.exp * 1000).toLocaleString()}`);
  console.log(`   ⏰ Tiempo restante: ${Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60 / 60)} horas`);
  
  // Verificar token
  const verified = JWTUtil.verifyToken(token);
  console.log(`   ✅ Token verificado: ${verified.username} (${verified.rol})`);
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 3. Probar con el usuario admin existente
console.log('\n3. 👑 Probar con payload de admin:');
try {
  const adminPayload = {
    id: 'existing-admin-id', // Esto debería ser el ID real de tu admin
    username: 'admin',
    rol: 'admin'
  };
  
  const adminToken = JWTUtil.generateToken(adminPayload);
  console.log(`   ✅ Token admin generado`);
  
  const decodedAdmin = JWTUtil.decodeToken(adminToken);
  console.log(`   📊 Payload decodificado:`);
  console.log(`      id: ${decodedAdmin.id}`);
  console.log(`      username: ${decodedAdmin.username}`);
  console.log(`      rol: ${decodedAdmin.rol}`);
  console.log(`      iat: ${new Date(decodedAdmin.iat * 1000).toLocaleString()}`);
  console.log(`      exp: ${new Date(decodedAdmin.exp * 1000).toLocaleString()}`);
  
} catch (error) {
  console.log(`   ❌ Error admin: ${error.message}`);
}
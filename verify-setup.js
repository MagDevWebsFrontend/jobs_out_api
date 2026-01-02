// En verify-setup.js (en la raíz)
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 =================================');
console.log('   Verificación de Configuración');
console.log('   =================================\n');

// 1. Verificar archivos esenciales
const essentialFiles = [
  '.env',
  '.env.example',
  '.gitignore',
  'package.json',
  'server.js',
  'src/app.js',
  'src/config/database.js',
  'src/models/index.js',
  'src/utils/logger.js',
  'src/utils/bcrypt.js',
  'src/utils/jwt.js',
  'src/errors/AppError.js',
  'src/errors/errorHandler.js'
];

console.log('📁 Archivos esenciales:');
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Verificar variables de entorno críticas
console.log('\n🔧 Variables de entorno críticas:');
const criticalEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_DEV_NAME',
  'DB_DEV_USER',
  'DB_DEV_PASS',
  'DB_DEV_HOST',
  'DB_DEV_PORT',
  'JWT_SECRET',
  'BCRYPT_ROUNDS'
];

criticalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = value && value.trim() !== '';
  const needsAttention = varName.includes('PASS') && value === 'tu_password';
  
  let status = '✅';
  if (!isSet) status = '❌';
  else if (needsAttention) status = '⚠️ ';
  
  const displayValue = varName.includes('PASS') 
    ? (isSet ? '••••••••' : 'NO CONFIGURADO')
    : (value || 'NO CONFIGURADO');
    
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

// 3. Verificar dependencias
console.log('\n📦 Dependencias del proyecto:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log(`   Dependencias principales: ${dependencies.length}`);
console.log(`   Dependencias de desarrollo: ${devDependencies.length}`);

// Verificar dependencias críticas
const criticalDeps = ['express', 'sequelize', 'pg', 'bcrypt', 'jsonwebtoken'];
criticalDeps.forEach(dep => {
  const hasDep = dependencies.includes(dep);
  console.log(`   ${hasDep ? '✅' : '❌'} ${dep}`);
});

// 4. Verificar estructura de directorios
console.log('\n📂 Estructura de directorios:');
const essentialDirs = [
  'src/config',
  'src/controllers',
  'src/errors',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'public/uploads/avatars',
  'public/uploads/trabajos',
  'logs'
];

essentialDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`   ${exists ? '✅' : '❌'} ${dir}/`);
});

// Resumen
console.log('\n📊 =================================');
console.log('   Resumen de Verificación');
console.log('   =================================');

const totalFiles = essentialFiles.length;
const existingFiles = essentialFiles.filter(f => fs.existsSync(f)).length;
const missingFiles = totalFiles - existingFiles;

const totalDirs = essentialDirs.length;
const existingDirs = essentialDirs.filter(d => fs.existsSync(d)).length;
const missingDirs = totalDirs - existingDirs;

console.log(`   Archivos: ${existingFiles}/${totalFiles} ${missingFiles > 0 ? `(${missingFiles} faltantes)` : '✅'}`);
console.log(`   Directorios: ${existingDirs}/${totalDirs} ${missingDirs > 0 ? `(${missingDirs} faltantes)` : '✅'}`);
console.log(`   Variables de entorno: ${criticalEnvVars.filter(v => process.env[v] && process.env[v].trim() !== '').length}/${criticalEnvVars.length}`);

// Recomendaciones
if (missingFiles > 0 || missingDirs > 0) {
  console.log('\n⚠️  Recomendaciones:');
  if (missingFiles > 0) {
    console.log('   - Crea los archivos faltantes mencionados arriba');
  }
  if (missingDirs > 0) {
    console.log('   - Crea los directorios faltantes mencionados arriba');
  }
}

console.log('\n🚀 Comandos a ejecutar:');
console.log('   npm install                    - Instalar dependencias');
console.log('   npm run db:test                - Probar conexión a PostgreSQL');
console.log('   npm run dev                    - Iniciar servidor en desarrollo');
console.log('   =================================\n');
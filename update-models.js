// En update-models.js (ejecutar una vez)
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');
const modelFiles = fs.readdirSync(modelsDir).filter(file => 
  file.endsWith('.js') && 
  file !== 'index.js' && 
  file !== 'connection.js' &&
  file !== 'update-models.js'
);

console.log('🔄 Actualizando modelos para usar conexión centralizada...\n');

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar importaciones
  content = content.replace(
    /const\s*{\s*DataTypes\s*}\s*=\s*require\s*\(\s*['"]sequelize['"]\s*\);\s*\n\s*const\s*{\s*sequelize\s*}\s*=\s*require\s*\(\s*['"]\.\/index['"]\s*\);/,
    'const { DataTypes } = require(\'sequelize\');\nconst sequelize = require(\'./connection\');'
  );
  
  content = content.replace(
    /const\s*{\s*sequelize,\s*DataTypes\s*}\s*=\s*require\s*\(\s*['"]\.\/index['"]\s*\);/,
    'const { DataTypes } = require(\'sequelize\');\nconst sequelize = require(\'./connection\');'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Actualizado: ${file}`);
});

console.log('\n🎉 ¡Todos los modelos actualizados!');
console.log('🚀 Ahora ejecuta: node test-all-models-fixed.js');
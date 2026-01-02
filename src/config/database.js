 
// En src/config/database.js (actualiza si ya existe)
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_DEV_USER,
    password: process.env.DB_DEV_PASS,
    database: process.env.DB_DEV_NAME,
    host: process.env.DB_DEV_HOST,
    port: process.env.DB_DEV_PORT,
    dialect: 'postgres',
    logging: (msg) => console.log(`📊 Sequelize: ${msg}`),
    dialectOptions: {
      ssl: process.env.DB_DEV_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,           // Agrega createdAt y updatedAt automáticamente
      underscored: true,          // Convierte camelCase a snake_case
      paranoid: true,             // Agrega deletedAt para soft deletes
      freezeTableName: true       // Previene pluralización de nombres de tablas
    }
  },
  test: {
    username: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASS,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_TEST_HOST,
    port: process.env.DB_TEST_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_TEST_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  },
  production: {
    username: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PASS,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_PROD_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Determinar entorno actual
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

console.log('🔌 =================================');
console.log(`   Cargando configuración de BD`);
console.log('   =================================');
console.log(`   🌍 Entorno: ${env}`);
console.log(`   📊 Base de datos: ${currentConfig.database}`);
console.log(`   🏠 Host: ${currentConfig.host}:${currentConfig.port}`);
console.log(`   👤 Usuario: ${currentConfig.username}`);
console.log(`   🔐 SSL: ${currentConfig.dialectOptions?.ssl ? 'Activado' : 'Desactivado'}`);
console.log('   =================================');

module.exports = currentConfig;
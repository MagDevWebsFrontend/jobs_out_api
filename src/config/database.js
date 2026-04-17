require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const configByEnv = {
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
    }
  }
};

const dbConfig = configByEnv[env];

console.log('🔌 =================================');
console.log('   Cargando configuración de BD');
console.log('   =================================');
console.log(`   🌍 Entorno: ${env}`);
console.log(`   📊 Base de datos: ${dbConfig.database}`);
console.log(`   🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   👤 Usuario: ${dbConfig.username}`);
console.log(`   🔐 SSL: ${dbConfig.dialectOptions?.ssl ? 'Activado' : 'Desactivado'}`);
console.log('   =================================');

module.exports = dbConfig;
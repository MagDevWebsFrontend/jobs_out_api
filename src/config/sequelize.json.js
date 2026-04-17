require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_DEV_USER || 'postgres',
    password: process.env.DB_DEV_PASS || 'postgres',
    database: process.env.DB_DEV_NAME || 'db-trabajos',
    host: process.env.DB_DEV_HOST || 'localhost',
    port: process.env.DB_DEV_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: process.env.DB_TEST_USER || 'postgres',
    password: process.env.DB_TEST_PASS || 'postgres',
    database: process.env.DB_TEST_NAME || 'trabajos_test',
    host: process.env.DB_TEST_HOST || 'localhost',
    port: process.env.DB_TEST_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_PROD_USER || 'postgres',
    password: process.env.DB_PROD_PASS || 'postgres',
    database: process.env.DB_PROD_NAME || 'jobs_out_prod',
    host: process.env.DB_PROD_HOST || 'localhost',
    port: process.env.DB_PROD_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
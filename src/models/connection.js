// En src/models/connection.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
    dialectOptions: config.dialectOptions,
    pool: config.pool,
    define: {
      timestamps: false,
      underscored: true,
      paranoid: false,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;
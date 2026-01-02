// En src/models/Log.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  accion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  entidad: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  entidad_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  detalles: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'logs',
  timestamps: false,
  underscored: true
});

module.exports = Log;
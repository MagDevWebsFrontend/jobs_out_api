// src/models/Log.js
const { Model, DataTypes } = require('sequelize')
const sequelize = require('./connection')

class Log extends Model {}

Log.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  accion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  entidad: DataTypes.TEXT,
  entidad_id: DataTypes.UUID,
  detalles: DataTypes.JSONB,
  ip: DataTypes.INET,
  user_agent: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'logs',
  timestamps: false,
  underscored: true
})

module.exports = Log

// En src/models/ConfiguracionUsuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const ConfiguracionUsuario = sequelize.define('ConfiguracionUsuario', {
  usuario_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  telegram_notif: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'configuraciones_usuario',
  timestamps: false,
  underscored: true
});

module.exports = ConfiguracionUsuario;
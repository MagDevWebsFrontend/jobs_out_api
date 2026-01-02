// En src/models/Guardado.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Guardado = sequelize.define('Guardado', {
  usuario_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  publicacion_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'guardados',
  timestamps: false,
  underscored: true
});

module.exports = Guardado;
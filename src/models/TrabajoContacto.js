// En src/models/TrabajoContacto.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const TrabajoContacto = sequelize.define('TrabajoContacto', {
  trabajo_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('telefono', 'whatsapp', 'email', 'sitio_web'),
    primaryKey: true,
    allowNull: false
  },
  valor: {
    type: DataTypes.TEXT,
    primaryKey: true,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'trabajo_contactos',
  timestamps: false,
  underscored: true
});

module.exports = TrabajoContacto;
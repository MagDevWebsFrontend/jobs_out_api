// En src/models/Publicacion.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Publicacion = sequelize.define('Publicacion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trabajo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  autor_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  publicado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'publicado', 'archivado'),
    defaultValue: 'publicado'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'publicaciones',
  timestamps: false,
  underscored: true
});

module.exports = Publicacion;
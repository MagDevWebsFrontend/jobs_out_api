// En src/models/Trabajo.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Trabajo = sequelize.define('Trabajo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  autor_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  titulo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experiencia_min: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  jornada: {
    type: DataTypes.ENUM('tiempo_completo', 'tiempo_parcial', 'por_turnos'),
    defaultValue: 'tiempo_completo'
  },
  modo: {
    type: DataTypes.ENUM('presencial', 'remoto', 'hibrido'),
    defaultValue: 'presencial'
  },
  municipio_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'publicado', 'archivado'),
    defaultValue: 'borrador'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'trabajos',
  timestamps: false,
  underscored: true,
  paranoid: true
});

module.exports = Trabajo;
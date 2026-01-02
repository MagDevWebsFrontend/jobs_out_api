// En src/models/Municipio.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Municipio = sequelize.define('Municipio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  provincia_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'municipios',
  timestamps: false,
  underscored: true,
  
  indexes: [
    {
      unique: true,
      fields: ['provincia_id', 'nombre']
    }
  ]
});

module.exports = Municipio;
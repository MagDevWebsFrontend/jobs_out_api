// En src/models/Provincia.js
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Provincia = sequelize.define('Provincia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'provincias',
  timestamps: false,
  underscored: true
});

module.exports = Provincia;
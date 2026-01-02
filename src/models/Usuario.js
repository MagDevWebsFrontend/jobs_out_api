// En src/models/Usuario.js (actualizar)
const { DataTypes } = require('sequelize');
const sequelize = require('./connection');
const BcryptUtil = require('../utils/bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  username: {
    type: DataTypes.CITEXT,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.CITEXT,
    allowNull: true,
    unique: true
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin', 'trabajador'),
    defaultValue: 'trabajador'
  },
  telefono_e164: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  municipio_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'usuarios',
  timestamps: false,
  underscored: true,
  paranoid: true,
  
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash && !usuario.password_hash.startsWith('$2b$')) {
        usuario.password_hash = await BcryptUtil.hashPassword(usuario.password_hash);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash') && !usuario.password_hash.startsWith('$2b$')) {
        usuario.password_hash = await BcryptUtil.hashPassword(usuario.password_hash);
      }
    }
  }
});

// Métodos de instancia
Usuario.prototype.verifyPassword = async function(password) {
  return await BcryptUtil.comparePassword(password, this.password_hash);
};

// Método estático para buscar por username o email
Usuario.findByUsernameOrEmail = async function(identifier) {
  return await this.findOne({
    where: sequelize.where(
      sequelize.fn('LOWER', sequelize.col('username')),
      '=',
      identifier.toLowerCase()
    )
  });
};

module.exports = Usuario;
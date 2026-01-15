// En src/models/index.js (REEMPLAZAR TODO)
const sequelize = require('./connection');
const { DataTypes } = require('sequelize');

// Importar modelos
const Usuario = require('./Usuario');
const ConfiguracionUsuario = require('./ConfiguracionUsuario');
const Provincia = require('./Provincia');
const Municipio = require('./Municipio');
const Trabajo = require('./Trabajo');
const TrabajoContacto = require('./TrabajoContacto');
const Publicacion = require('./Publicacion');
const Guardado = require('./Guardado');
const Log = require('./Log');

// Función para probar conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

// Función para sincronizar base de datos
async function syncDatabase(options = {}) {
  try {
    const syncOptions = {
      force: false,
      alter: false,
      logging: false,
      ...options
    };

    console.log('🔄 Verificando modelos con base de datos...');
    await sequelize.sync(syncOptions);
    console.log('✅ Modelos sincronizados con tablas existentes');
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    return false;
  }
}

// ====================
// DEFINIR RELACIONES
// ====================

// Usuario ↔ ConfiguracionUsuario (1:1)
Usuario.hasOne(ConfiguracionUsuario, {
  foreignKey: 'usuario_id',
  as: 'configuracion'
});
ConfiguracionUsuario.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Provincia ↔ Municipio (1:N)
Provincia.hasMany(Municipio, {
  foreignKey: 'provincia_id',
  as: 'municipios'
});
Municipio.belongsTo(Provincia, {
  foreignKey: 'provincia_id',
  as: 'provincia'
});

// Usuario ↔ Municipio (N:1)
Usuario.belongsTo(Municipio, {
  foreignKey: 'municipio_id',
  as: 'municipio'
});
Municipio.hasMany(Usuario, {
  foreignKey: 'municipio_id',
  as: 'usuarios'
});

// Usuario ↔ Trabajo (1:N)
Usuario.hasMany(Trabajo, {
  foreignKey: 'autor_id',
  as: 'trabajos'
});
Trabajo.belongsTo(Usuario, {
  foreignKey: 'autor_id',
  as: 'autor'
});

// Trabajo ↔ Municipio (N:1)
Trabajo.belongsTo(Municipio, {
  foreignKey: 'municipio_id',
  as: 'municipio'
});
Municipio.hasMany(Trabajo, {
  foreignKey: 'municipio_id',
  as: 'trabajos'
});

// Trabajo ↔ TrabajoContacto (1:N)
Trabajo.hasMany(TrabajoContacto, {
  foreignKey: 'trabajo_id',
  as: 'contactos'
});
TrabajoContacto.belongsTo(Trabajo, {
  foreignKey: 'trabajo_id',
  as: 'trabajo'
});

// Trabajo ↔ Publicacion (1:N)
Trabajo.hasMany(Publicacion, {
  foreignKey: 'trabajo_id',
  as: 'publicaciones'
});
Publicacion.belongsTo(Trabajo, {
  foreignKey: 'trabajo_id',
  as: 'trabajo'
});

// Usuario ↔ Publicacion (1:N)
Usuario.hasMany(Publicacion, {
  foreignKey: 'autor_id',
  as: 'publicaciones'
});
Publicacion.belongsTo(Usuario, {
  foreignKey: 'autor_id',
  as: 'autor'
});

// Reemplazar las relaciones de Guardado (N:M) por estas:

// Usuario ↔ Guardado (1:N)
Usuario.hasMany(Guardado, {
  foreignKey: 'usuario_id',
  as: 'guardados'
});
Guardado.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Publicacion ↔ Guardado (1:N)
Publicacion.hasMany(Guardado, {
  foreignKey: 'publicacion_id',
  as: 'guardados'
});
Guardado.belongsTo(Publicacion, {
  foreignKey: 'publicacion_id',
  as: 'publicacion'
});

// Usuario ↔ Log (1:N)
Usuario.hasMany(Log, {
  foreignKey: 'usuario_id',
  as: 'logs'
});
Log.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Exportar todo
module.exports = {
  sequelize,
  DataTypes,
  testConnection,
  syncDatabase,
  // Modelos
  Usuario,
  ConfiguracionUsuario,
  Provincia,
  Municipio,
  Trabajo,
  TrabajoContacto,
  Publicacion,
  Guardado,
  Log
};
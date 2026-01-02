 // En swagger.js
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jobs Out API',
      version: '1.0.0',
      description: 'API para la plataforma de búsqueda de trabajos en Cuba',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@jobsout.cu',
        url: 'https://jobsout.cu'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `${process.env.APP_URL || 'http://localhost:4000'}${process.env.API_PREFIX || '/api'}`,
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.jobsout.cu/api',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en el formato: Bearer {token}'
        }
      },
      schemas: {
        // Esquemas se agregarán automáticamente
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y autorización'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Trabajos',
        description: 'Ofertas de trabajo'
      },
      {
        name: 'Publicaciones',
        description: 'Publicaciones de trabajos'
      },
      {
        name: 'Ubicaciones',
        description: 'Provincias y municipios'
      },
      {
        name: 'Sistema',
        description: 'Salud y monitoreo'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

console.log('📚 =================================');
console.log('   Documentación Swagger Generada');
console.log('   =================================');
console.log(`   🔗 Swagger UI: ${process.env.APP_URL || 'http://localhost:4000'}/api-docs`);
console.log(`   📄 Endpoints documentados: ${Object.keys(specs.paths || {}).length}`);
console.log('   =================================\n');

// Mostrar endpoints documentados
if (specs.paths) {
  Object.entries(specs.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      console.log(`   ${method.toUpperCase()} ${path} - ${details.summary || 'Sin título'}`);
    });
  });
}

module.exports = specs;

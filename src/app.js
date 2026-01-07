const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { testConnection } = require('./models');
const errorHandler = require('./errors/errorHandler');
const swaggerSpec = require('./config/swaggerConfig');

const app = express();

// =========================
// Configuración de Rate Limiting
// =========================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =========================
// Middlewares Globales
// =========================

// CORS - DEBE IR PRIMERO, antes de cualquier otro middleware
// Configuración más flexible para desarrollo
app.use(cors({
  origin: function (origin, callback) {
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, usar la lista de orígenes permitidos
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // Permitir solicitudes sin origen (como curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`⚠️  Origen bloqueado por CORS: ${origin}`);
      console.warn(`   Orígenes permitidos: ${allowedOrigins.join(', ')}`);
      const msg = 'El origen de la solicitud no está permitido';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  exposedHeaders: ['Authorization', 'Refresh-Token', 'X-Token-Expiring-Soon'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Seguridad HTTP (después de CORS)
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar temporalmente para evitar conflictos con Swagger
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parse JSON
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '5mb'
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: process.env.MAX_FILE_SIZE || '5mb'
}));

// Aplicar rate limiting a todas las rutas API
app.use('/api', limiter);

// =========================
// Servir archivos estáticos
// =========================
app.use('/uploads', express.static('public/uploads'));

// =========================
// Documentación Swagger
// =========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Jobs Out API - Documentación",
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  },
  explorer: true
}));

// =========================
// Rutas de la API
// =========================
const router = express.Router();
const apiPrefix = process.env.API_PREFIX || '/api';

// Importar rutas
const authRoutes = require('./routes/auth.route');
const usuarioRoutes = require('./routes/usuario.route');
const ubicacionRoutes = require('./routes/ubicacion.route');
const trabajoRoutes = require('./routes/trabajo.route');
const publicacionRoutes = require('./routes/publicacion.route'); 
const guardadoRoutes = require('./routes/guardado.route');     
const trabajoContactoRoutes = require('./routes/trabajoContacto.route');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/', ubicacionRoutes); // Esto incluye /provincias y /municipios
router.use('/trabajos', trabajoRoutes);
router.use('/publicaciones', publicacionRoutes);
router.use('/guardados', guardadoRoutes);
router.use('/trabajosContacto', trabajoContactoRoutes); // Contactos bajo /trabajos

// Montar todas las rutas bajo el prefijo
app.use(apiPrefix, router);

// =========================
// Rutas de salud y pruebas
// =========================
app.get(`${apiPrefix}/health`, async (req, res) => {
  try {
    const dbStatus = await testConnection();
    
    res.json({ 
      success: true,
      status: 'OK', 
      environment: process.env.NODE_ENV,
      database: dbStatus ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      uptime: process.uptime(),
      cors: {
        enabled: true,
        mode: process.env.NODE_ENV === 'development' ? 'permissive' : 'restrictive'
      },
      endpoints: {
        auth: `${req.protocol}://${req.get('host')}${apiPrefix}/auth`,
        users: `${req.protocol}://${req.get('host')}${apiPrefix}/usuarios`,
        provinces: `${req.protocol}://${req.get('host')}${apiPrefix}/provincias`,
        municipalities: `${req.protocol}://${req.get('host')}${apiPrefix}/municipios`,
        jobs: `${req.protocol}://${req.get('host')}${apiPrefix}/trabajos`,
        publications: `${req.protocol}://${req.get('host')}${apiPrefix}/publicaciones`,
        bookmarks: `${req.protocol}://${req.get('host')}${apiPrefix}/guardados`,
        docs: `${req.protocol}://${req.get('host')}/api-docs`
      },
      modules: {
        auth: '✓',
        users: '✓',
        locations: '✓',
        jobs: '✓',
        publications: '✓',
        bookmarks: '✓',
        swagger: '✓'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error en health check',
        details: error.message,
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

app.get(`${apiPrefix}/test-db`, async (req, res) => {
  try {
    const dbStatus = await testConnection();
    
    if (dbStatus) {
      res.json({ 
        success: true,
        message: 'Conexión a la base de datos exitosa',
        environment: process.env.NODE_ENV,
        database: process.env.DB_DEV_NAME,
        timestamp: new Date().toISOString(),
        tables: [
          'usuarios',
          'provincias',
          'municipios',
          'trabajos',
          'publicaciones',
          'guardados',
          'trabajo_contactos',
          'configuraciones_usuario',
          'logs'
        ]
      });
    } else {
      res.status(503).json({ 
        success: false,
        error: {
          message: 'No se pudo conectar a la base de datos',
          statusCode: 503,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Verifica que PostgreSQL esté corriendo',
            'Revisa las credenciales en .env',
            'Asegúrate que la base de datos exista'
          ]
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Error probando la base de datos',
        details: error.message,
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// =========================
// Ruta de bienvenida
// =========================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Bienvenido a Jobs Out API',
    description: 'API para plataforma de búsqueda de trabajos en Cuba',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    cors: 'enabled',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health_check: `${req.protocol}://${req.get('host')}/api/health`,
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}/api/auth`,
      users: `${req.protocol}://${req.get('host')}/api/usuarios`,
      provinces: `${req.protocol}://${req.get('host')}/api/provincias`,
      municipalities: `${req.protocol}://${req.get('host')}/api/municipios`,
      jobs: `${req.protocol}://${req.get('host')}/api/trabajos`,
      publications: `${req.protocol}://${req.get('host')}/api/publicaciones`,
      bookmarks: `${req.protocol}://${req.get('host')}/api/guardados`,
      swagger: `${req.protocol}://${req.get('host')}/api-docs`
    },
    quick_start: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me (con token)',
      provinces: 'GET /api/provincias',
      jobs_search: 'GET /api/trabajos?search=desarrollador&modo=remoto',
      publications_search: 'GET /api/publicaciones?busqueda=web&jornada=tiempo_completo',
      create_job: 'POST /api/trabajos (autenticado)',
      create_publication: 'POST /api/publicaciones (autenticado)',
      save_bookmark: 'POST /api/guardados (autenticado)'
    },
    features: {
      authentication: 'JWT + Refresh Tokens',
      authorization: 'Roles (admin/trabajador)',
      search: 'Búsqueda avanzada con filtros',
      pagination: 'Paginación en todos los listados',
      images: 'Soporte para imágenes en usuarios y publicaciones',
      notifications: 'Configuración de notificaciones por Telegram',
      bookmarks: 'Sistema de publicaciones guardadas',
      republication: 'Sistema de republicación de trabajos',
      statistics: 'Estadísticas para administradores',
      swagger: 'Documentación interactiva completa'
    }
  });
});

// =========================
// Manejo de errores 404
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      suggestion: 'Verifica la URL o consulta la documentación en /api-docs',
      available_endpoints: [
        'GET /api/health',
        'GET /api/provincias',
        'GET /api/municipios',
        'GET /api/trabajos',
        'GET /api/publicaciones',
        'GET /api/guardados',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api-docs'
      ]
    }
  });
});

// =========================
// Manejador global de errores
// =========================
app.use(errorHandler);

// Manejo específico para errores de CORS
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Error de política CORS',
        details: process.env.NODE_ENV === 'development' ? err.message : 'El origen de la solicitud no está permitido',
        statusCode: 403,
        timestamp: new Date().toISOString(),
        allowed_origins: process.env.NODE_ENV === 'development' ? 'Todos en desarrollo' : process.env.ALLOWED_ORIGINS,
        current_origin: req.headers.origin || 'No especificado'
      }
    });
  }
  next(err);
});

module.exports = app;
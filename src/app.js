require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const { testConnection } = require('./models');
const errorHandler = require('./errors/errorHandler');
const swaggerSpec = require('./config/swaggerConfig');

// Telegram bot
require('./services/telegram/telegramBot');

const app = express();

/* =========================================================
   📁 STATIC FILES (UPLOADS - PUBLIC ACCESS)
   URL REAL: http://localhost:4000/uploads/...
========================================================= */
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

app.use('/uploads', express.static(UPLOAD_DIR));

/* =========================================================
   🛡 RATE LIMIT
========================================================= */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes'
  }
});

/* =========================================================
   🌐 CORS
========================================================= */
app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV === 'development') return cb(null, true);

    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');

    if (!origin || allowed.includes(origin)) return cb(null, true);

    return cb(new Error('CORS blocked'), false);
  },
  credentials: true
}));

/* =========================================================
   🔐 SECURITY
========================================================= */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* =========================================================
   🧾 MIDDLEWARES
========================================================= */
app.use(morgan('dev'));

app.use(express.json({
  limit: process.env.MAX_FILE_SIZE || '5mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: process.env.MAX_FILE_SIZE || '5mb'
}));

app.use('/api', limiter);

/* =========================================================
   📚 SWAGGER
========================================================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================================================
   🔌 ROUTER
========================================================= */
const router = express.Router();
const apiPrefix = process.env.API_PREFIX || '/api';

/* =========================================================
   📦 ROUTES
========================================================= */
const authRoutes = require('./routes/auth.route');
const usuarioRoutes = require('./routes/usuario.route');
const ubicacionRoutes = require('./routes/ubicacion.route');
const trabajoRoutes = require('./routes/trabajo.route');
const publicacionRoutes = require('./routes/publicacion.route');
const guardadoRoutes = require('./routes/guardado.route');
const trabajoContactoRoutes = require('./routes/trabajoContacto.route');
const uploadsRoutes = require('./routes/uploads.routes');
const logsRoutes = require('./routes/logs.route');
const adminRoutes = require('./routes/admin.routes');

/* =========================================================
   🔥 API ROUTES CLEAN
========================================================= */
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/', ubicacionRoutes);
router.use('/trabajos', trabajoRoutes);
router.use('/publicaciones', publicacionRoutes);
router.use('/guardados', guardadoRoutes);
router.use('/trabajosContacto', trabajoContactoRoutes);

/* ⚠️ IMPORTANTE: uploads debe ser /uploads */
router.use('/uploads', uploadsRoutes);

router.use('/', logsRoutes);

app.use('/api/admin', adminRoutes);
app.use(apiPrefix, router);

/* =========================================================
   🧪 DEBUG UPLOADS
========================================================= */
app.get('/api/debug/uploads', (req, res) => {
  const fs = require('fs');

  const data = {
    uploadDir: UPLOAD_DIR,
    exists: fs.existsSync(UPLOAD_DIR),
    cwd: process.cwd(),
    env: process.env.NODE_ENV
  };

  res.json({ success: true, data });
});

/* =========================================================
   ❤️ HEALTH
========================================================= */
app.get(`${apiPrefix}/health`, async (req, res) => {
  const db = await testConnection();

  res.json({
    success: true,
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

/* =========================================================
   ❌ 404
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* =========================================================
   ❗ ERROR HANDLER
========================================================= */
app.use(errorHandler);

module.exports = app;
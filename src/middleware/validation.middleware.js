const { body, query, param } = require('express-validator')
const { validate } = require('./validate.middleware')

/* =========================
   VALIDACIÓN DE AUTH
========================= */
const validateAuth = {
  register: [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es requerido')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/),

    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .normalizeEmail(),

    body('password')
      .trim()
      .notEmpty()
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),

    body('nombre')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 100 }),

    body('telefono_e164')
      .optional()
      .trim()
      .matches(/^\+\d{7,15}$/),

    body('municipio_id')
      .optional()
      .isUUID(),

    body('rol')
      .optional()
      .isIn(['admin', 'trabajador']),

    validate
  ],

  login: [
    body('username').notEmpty(),
    body('password').notEmpty(),
    validate
  ],

  refreshToken: [
    body('refresh_token').notEmpty(),
    validate
  ]
}

/* =========================
   VALIDACIÓN DE USUARIO
========================= */
const validateUsuario = {
  update: [
    body('nombre').optional().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail(),
    body('telefono_e164').optional().matches(/^\+\d{7,15}$/),
    body('municipio_id').optional().isUUID(),
    body('avatar_url').optional().isString(),
    body('rol').optional().isIn(['admin', 'trabajador']),
    validate
  ]
}

/* =========================
   VALIDACIÓN DE TRABAJOS
========================= */
const validateTrabajo = {
  create: [
    body('titulo').notEmpty().isLength({ min: 3, max: 200 }),
    body('descripcion').notEmpty().isLength({ min: 10, max: 5000 }),

    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']),

    body('jornada')
      .optional()
      .isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']),

    body('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']),

    body('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 10 }),

    body('salario_min')
      .optional()
      .isFloat({ min: 0 }),

    body('salario_max')
      .optional()
      .isFloat({ min: 0 }),

    body('municipio_id')
      .optional()
      .isUUID(),

    body('beneficios')
      .optional()
      .isArray(),

    body('contactos')
      .optional()
      .isArray(),

    validate
  ],

  update: [
    body('titulo').optional().isLength({ min: 3, max: 200 }),
    body('descripcion').optional().isLength({ min: 10, max: 5000 }),
    body('estado').optional().isIn(['borrador', 'publicado', 'archivado']),
    body('jornada').optional().isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']),
    body('modo').optional().isIn(['presencial', 'remoto', 'hibrido']),
    body('experiencia_min').optional().isInt({ min: 0, max: 10 }),
    body('salario_min').optional().isFloat({ min: 0 }),
    body('salario_max').optional().isFloat({ min: 0 }),
    body('municipio_id').optional().isUUID(),
    body('beneficios').optional().isArray(),
    validate
  ]
}

/* =========================
   VALIDACIÓN DE CONTACTO
========================= */
const validateContacto = [
  body('tipo')
    .notEmpty()
    .isIn(['telefono', 'whatsapp', 'email', 'sitio_web']),

  body('valor')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 255 }),

  validate
]

/* =========================
   VALIDACIÓN DE PUBLICACIONES
========================= */
const validatePublicacion = {
  create: [
    body('trabajo_id').notEmpty().isUUID(),

    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']),

    body('imagen_url')
      .optional()
      .custom(value => {
        if (!value.startsWith('/uploads/')) {
          throw new Error('Ruta de imagen inválida')
        }
        return true
      }),

    validate
  ],

  getAll: [
    query('estado').optional().isIn(['borrador', 'publicado', 'archivado']),
    query('municipio_id').optional().isUUID(),
    query('provincia_id').optional().isUUID(),
    query('modo').optional().isIn(['presencial', 'remoto', 'hibrido']),
    query('jornada').optional().isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']),
    query('busqueda').optional().isLength({ min: 2 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    validate
  ],

  getMisPublicaciones: [
    query('estado').optional().isIn(['borrador', 'publicado', 'archivado']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    validate
  ],

  getById: [
    param('id').isUUID(),
    validate
  ],

  delete: [
    param('id').isUUID(),
    validate
  ],

  update: [
  param('id').isUUID(),

  body('estado')
    .optional()
    .isIn(['borrador', 'publicado', 'archivado']),

  body('imagen_url')
    .optional()
    .custom(value => {
      if (!value.startsWith('/uploads/')) {
        throw new Error('Ruta de imagen inválida')
      }
      return true
    }),

  validate
]

}


const validateGuardado = {
  create: [
    body('publicacion_id')
      .notEmpty().withMessage('El ID de la publicación es requerido')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    validate
  ],

  delete: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    validate
  ],

  getAll: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100')
      .toInt(),
    
    query('offset')
      .optional()
      .isInt({ min: 0 }).withMessage('El offset debe ser 0 o mayor')
      .toInt(),
    
    validate
  ]
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  validateAuth,
  validateUsuario,
  validateTrabajo,
  validatePublicacion,
  validateContacto,
  validateGuardado
}

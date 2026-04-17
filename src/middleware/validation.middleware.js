const { body, query, param } = require('express-validator');
const { validate } = require('./validate.middleware');

const validateAuth = {
  register: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es requerido')
      .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('El username solo puede contener letras, números y guiones bajos'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),
    
    body('password')
      .trim()
      .notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener entre 6 y 100 caracteres'),
    
    body('telefono_e164')
      .optional()
      .trim()
      .matches(/^\+\d{7,15}$/).withMessage('El teléfono debe tener formato internacional (ej: +5350000000)'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El ID del municipio debe ser un UUID válido'),
    
    body('rol')
      .optional()
      .isIn(['admin', 'trabajador']).withMessage('El rol debe ser admin o trabajador'),
    
    validate
  ],

  login: [
    body('identifier')
      .trim()
      .notEmpty().withMessage('El username o email es requerido'),
    
    body('password')
      .trim()
      .notEmpty().withMessage('La contraseña es requerida'),
    
    validate
  ],

  refreshToken: [
    body('refreshToken')
      .trim()
      .notEmpty().withMessage('El refresh token es requerido'),
    
    validate
  ],

  changePassword: [
    body('currentPassword')
      .trim()
      .notEmpty().withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
      .trim()
      .notEmpty().withMessage('La nueva contraseña es requerida')
      .isLength({ min: 6, max: 100 }).withMessage('La nueva contraseña debe tener entre 6 y 100 caracteres'),
    
    validate
  ]
};

const validateUsuario = {
  update: [
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),
    
    body('telefono_e164')
      .optional()
      .trim()
      .matches(/^\+\d{7,15}$/).withMessage('El teléfono debe tener formato internacional'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El ID del municipio debe ser un UUID válido'),
    
    body('avatar_url')
      .optional()
      .isString().withMessage('La URL del avatar debe ser un texto'),
    
    body('rol')
      .optional()
      .isIn(['admin', 'trabajador']).withMessage('El rol debe ser admin o trabajador'),
    
    validate
  ]
};

const validateTrabajo = {
  create: [
    body('titulo')
      .trim()
      .notEmpty().withMessage('El título es requerido')
      .isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
    
    body('descripcion')
      .trim()
      .notEmpty().withMessage('La descripción es requerida')
      .isLength({ min: 10, max: 5000 }).withMessage('La descripción debe tener entre 10 y 5000 caracteres'),
    
    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    body('jornada')
      .optional()
      .isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']).withMessage('Jornada inválida'),
    
    body('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo de trabajo inválido'),
    
    body('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 50 }).withMessage('La experiencia mínima debe ser entre 0 y 50 años'),
    
    body('salario_min')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo'),
    
    body('salario_max')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El ID del municipio debe ser un UUID válido'),
    
    body('beneficios')
      .optional()
      .isArray().withMessage('Los beneficios deben ser un array'),
    
    body('contactos')
      .optional()
      .isArray().withMessage('Los contactos deben ser un array'),
    
    validate
  ],

  update: [
    body('titulo')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
    
    body('descripcion')
      .optional()
      .trim()
      .isLength({ min: 10, max: 5000 }).withMessage('La descripción debe tener entre 10 y 5000 caracteres'),
    
    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    body('jornada')
      .optional()
      .isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']).withMessage('Jornada inválida'),
    
    body('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo de trabajo inválido'),
    
    body('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 50 }).withMessage('La experiencia mínima debe ser entre 0 y 50 años'),
    
    body('salario_min')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo'),
    
    body('salario_max')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El ID del municipio debe ser un UUID válido'),
    
    body('beneficios')
      .optional()
      .isArray().withMessage('Los beneficios deben ser un array'),
    
    validate
  ]
};

const validateContacto = [
  body('tipo')
    .trim()
    .notEmpty().withMessage('El tipo de contacto es requerido')
    .isIn(['telefono', 'whatsapp', 'email', 'sitio_web']).withMessage('Tipo de contacto inválido'),

  body('valor')
    .trim()
    .notEmpty().withMessage('El valor del contacto es requerido')
    .isLength({ min: 3, max: 255 }).withMessage('El valor debe tener entre 3 y 255 caracteres'),

  validate
];

const validatePublicacion = {
  create: [
    body('trabajo_id')
      .notEmpty().withMessage('El ID del trabajo es requerido')
      .isUUID().withMessage('El ID del trabajo debe ser un UUID válido'),

    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),

    body('imagen_url')
      .optional()
      .custom((value) => {
        if (value && !value.startsWith('/uploads/')) {
          throw new Error('Ruta de imagen inválida');
        }
        return true;
      }),

    validate
  ],

  getAll: [
    query('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    query('municipio_id')
      .optional()
      .isUUID().withMessage('El ID del municipio debe ser un UUID válido'),
    
    query('provincia_id')
      .optional()
      .isUUID().withMessage('El ID de la provincia debe ser un UUID válido'),
    
    query('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo de trabajo inválido'),
    
    query('jornada')
      .optional()
      .isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']).withMessage('Jornada inválida'),
    
    query('busqueda')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100')
      .toInt(),
    
    query('offset')
      .optional()
      .isInt({ min: 0 }).withMessage('El offset debe ser 0 o mayor')
      .toInt(),
    
    validate
  ],

  getMisPublicaciones: [
    query('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100')
      .toInt(),
    
    query('offset')
      .optional()
      .isInt({ min: 0 }).withMessage('El offset debe ser 0 o mayor')
      .toInt(),
    
    validate
  ],

  getById: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    validate
  ],

  delete: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    validate
  ],

  update: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),

    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),

    body('imagen_url')
      .optional()
      .custom((value) => {
        if (value && !value.startsWith('/uploads/')) {
          throw new Error('Ruta de imagen inválida');
        }
        return true;
      }),

    validate
  ]
};

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

module.exports = {
  validateAuth,
  validateUsuario,
  validateTrabajo,
  validatePublicacion,
  validateContacto,
  validateGuardado
};
const { body, query, param } = require('express-validator');
const { validate } = require('./validate.middleware');

// =========================
// Validación de Autenticación
// =========================
const validateAuth = {
  register: [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es requerido')
      .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo se permiten letras, números y guiones bajos'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('El email es requerido')
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),
    
    body('password')
      .trim()
      .notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('telefono_e164')
      .optional()
      .trim()
      .matches(/^\+\d{7,15}$/).withMessage('El teléfono debe estar en formato E.164 (ej: +584141234567)'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
    body('rol')
      .optional()
      .isIn(['admin', 'trabajador']).withMessage('Rol inválido. Valores permitidos: admin, trabajador'),
    
    validate
  ],

  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario o email es requerido'),
    
    body('password')
      .trim()
      .notEmpty().withMessage('La contraseña es requerida'),
    
    validate
  ],

  refreshToken: [
    body('refresh_token')
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
      .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    validate
  ]
};

// =========================
// Validación de Usuarios
// =========================
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
      .matches(/^\+\d{7,15}$/).withMessage('El teléfono debe estar en formato E.164 (ej: +584141234567)'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
    body('avatar_url')
      .optional()
      .isURL().withMessage('Debe ser una URL válida'),
    
    body('rol')
      .optional()
      .isIn(['admin', 'trabajador']).withMessage('Rol inválido'),
    
    validate
  ]
};

// =========================
// Validación de Trabajos
// =========================
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
      .isIn(['completa', 'parcial', 'temporal', 'freelance', 'turnos']).withMessage('Jornada inválida'),
    
    body('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo inválido'),
    
    body('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 10 }).withMessage('La experiencia mínima debe ser entre 0 y 10 años'),
    
    body('salario_min')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo'),
    
    body('salario_max')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
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
      .isIn(['completa', 'parcial', 'temporal', 'freelance', 'turnos']).withMessage('Jornada inválida'),
    
    body('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo inválido'),
    
    body('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 10 }).withMessage('La experiencia mínima debe ser entre 0 y 10 años'),
    
    body('salario_min')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo'),
    
    body('salario_max')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo'),
    
    body('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
    body('beneficios')
      .optional()
      .isArray().withMessage('Los beneficios deben ser un array'),
    
    validate
  ],

  contacto: [
    body('tipo')
      .notEmpty().withMessage('El tipo de contacto es requerido')
      .isIn(['telefono', 'whatsapp', 'email', 'sitio_web']).withMessage('Tipo de contacto inválido'),
    
    body('valor')
      .trim()
      .notEmpty().withMessage('El valor del contacto es requerido')
      .isLength({ min: 3, max: 255 }).withMessage('El valor debe tener entre 3 y 255 caracteres'),
    
    validate
  ],

  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('La página debe ser un número mayor que 0')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100')
      .toInt(),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    
    query('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    query('jornada')
      .optional()
      .isIn(['completa', 'parcial', 'temporal', 'freelance', 'turnos']).withMessage('Jornada inválida'),
    
    query('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo inválido'),
    
    query('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
    query('provincia_id')
      .optional()
      .isUUID().withMessage('El provincia ID debe ser un UUID válido'),
    
    query('experiencia_min')
      .optional()
      .isInt({ min: 0, max: 10 }).withMessage('La experiencia mínima debe ser entre 0 y 10 años'),
    
    validate
  ],

  getById: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    validate
  ]
};

const validatePublicacion = {
  // Crear publicación
  create: [
    body('trabajo_id')
      .notEmpty().withMessage('El ID del trabajo es requerido')
      .isUUID().withMessage('El ID del trabajo debe ser un UUID válido'),
    
    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido. Valores permitidos: borrador, publicado, archivado')
      .default('publicado'),
    
    body('imagen_url')
      .optional()
      .trim()
      .isURL().withMessage('Debe ser una URL válida')
      .custom((value) => {
        if (value && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          throw new Error('La URL debe apuntar a una imagen válida (jpg, jpeg, png, gif, webp)');
        }
        return true;
      }),
    
    validate
  ],

  // Actualizar publicación
  update: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    body('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    body('imagen_url')
      .optional()
      .trim()
      .isURL().withMessage('Debe ser una URL válida')
      .custom((value) => {
        if (value && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          throw new Error('La URL debe apuntar a una imagen válida');
        }
        return true;
      }),
    
    body()
      .custom((value, { req }) => {
        // Verificar que al menos un campo esté presente para actualizar
        const { estado, imagen_url } = req.body;
        if (!estado && !imagen_url) {
          throw new Error('Debe proporcionar al menos un campo para actualizar: estado o imagen_url');
        }
        return true;
      }),
    
    validate
  ],

  // Republicar trabajo
  republicar: [
    body('trabajo_id')
      .notEmpty().withMessage('El ID del trabajo es requerido')
      .isUUID().withMessage('El ID del trabajo debe ser un UUID válido'),
    
    body('imagen_url')
      .optional()
      .trim()
      .isURL().withMessage('Debe ser una URL válida')
      .custom((value) => {
        if (value && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          throw new Error('La URL debe apuntar a una imagen válida');
        }
        return true;
      }),
    
    validate
  ],

  // Obtener todas las publicaciones (con filtros)
  getAll: [
    query('estado')
      .optional()
      .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    
    query('municipio_id')
      .optional()
      .isUUID().withMessage('El municipio ID debe ser un UUID válido'),
    
    query('provincia_id')
      .optional()
      .isUUID().withMessage('La provincia ID debe ser un UUID válido'),
    
    query('modo')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modo inválido. Valores permitidos: presencial, remoto, hibrido'),
    
    query('jornada')
      .optional()
      .isIn(['tiempo_completo', 'tiempo_parcial', 'por_turnos']).withMessage('Jornada inválida. Valores permitidos: tiempo_completo, tiempo_parcial, por_turnos'),
    
    query('busqueda')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100')
      .toInt()
      .default(50),
    
    query('offset')
      .optional()
      .isInt({ min: 0 }).withMessage('El offset debe ser 0 o mayor')
      .toInt()
      .default(0),
    
    query('orden')
      .optional()
      .isIn(['mas_reciente', 'mas_antiguo', 'mas_guardado']).withMessage('Orden inválido. Valores permitidos: mas_reciente, mas_antiguo, mas_guardado'),
    
    validate
  ],

  // Obtener publicación por ID
  getById: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    validate
  ],

  // Obtener publicaciones del usuario autenticado
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

  // Eliminar/archivar publicación
  delete: [
    param('id')
      .isUUID().withMessage('El ID debe ser un UUID válido'),
    
    validate
  ]
};

// =========================
// Validación de Guardados
// =========================
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


// =========================
// Exportar todas las validaciones
// =========================
module.exports = {
  validateAuth,
  validateUsuario,
  validateTrabajo,
  validatePublicacion,
  validateGuardado
};
# Jobs Out API

API RESTful para la plataforma de búsqueda y publicación de trabajos en Cuba.

## Características

- Autenticación JWT con refresh tokens
- CRUD completo para usuarios, trabajos, publicaciones
- Roles de usuario (admin/trabajador)
- Sistema de notificaciones por Telegram
- Documentación Swagger automática
- Manejo de errores centralizado
- Validación de datos con express-validator
- Paginación y filtros en consultas
- Seeders con datos de prueba

## Arquitectura del Proyecto

```
src/
├── config/           # Configuraciones (DB, Swagger)
├── controllers/     # Controladores HTTP
├── errors/          # Clases de errores personalizados
├── middleware/      # Middlewares (auth, upload, validation)
├── models/          # Modelos Sequelize
├── routes/         # Rutas de la API
├── services/        # Lógica de negocio
│   └── telegram/   # Bot de Telegram
├── seeders/        # Datos iniciales
│   └── data/      # JSON de provincias y municipios
└── utils/          # Utilidades (logger, bcrypt, jwt)
```

## Requisitos

- Node.js 16+
- PostgreSQL 12+

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos
createdb -U postgres db-trabajos

# Ejecutar seeders (datos iniciales)
npm run seed

# Iniciar servidor
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| NODE_ENV | Entorno | development |
| PORT | Puerto del servidor | 4000 |
| DB_DEV_* | Configuración de BD desarrollo | localhost:5432 |
| JWT_SECRET | Clave secreta JWT | - |
| JWT_EXPIRES_IN | Expiración token | 7d |
| JWT_REFRESH_SECRET | Clave refresh | - |
| BCRYPT_ROUNDS | Rondas de hashing | 12 |
| ALLOWED_ORIGINS | Orígenes permitidos CORS | localhost:3000 |
| TELEGRAM_BOT_TOKEN | Token del bot | (configurado) |

## Scripts

| Script | Descripción |
|--------|-------------|
| npm start | Iniciar producción |
| npm run dev | Iniciar desarrollo |
| npm run seed | Ejecutar seeders |
| npm run db:sync | Sincronizar modelos |

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Perfil actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Ubicaciones
- `GET /api/provincias` - Provincias de Cuba
- `GET /api/provincias/:id` - Provincia con municipios
- `GET /api/municipios` - Municipios
- `GET /api/municipios/:id` - Municipio

### Trabajos
- `POST /api/trabajos` - Crear trabajo
- `GET /api/trabajos` - Listar trabajos
- `GET /api/trabajos/:id` - Obtener trabajo
- `PUT /api/trabajos/:id` - Actualizar trabajo
- `DELETE /api/trabajos/:id` - Eliminar trabajo

### Publicaciones
- `POST /api/publicaciones` - Crear publicación
- `GET /api/publicaciones` - Listar publicaciones
- `GET /api/publicaciones/:id` - Obtener publicación
- `DELETE /api/publicaciones/:id` - Eliminar publicación

### Guardados (Bookmarks)
- `POST /api/guardados` - Guardar publicación
- `GET /api/guardados` - Ver guardados
- `DELETE /api/guardados/:id` - Quitar guardado

## Documentación

Swagger UI disponible en: `http://localhost:4000/api-docs`

## Datos de Prueba

Los seeders incluyen:
- 3 usuarios (admin, carlos, laura)
- Provincias y municipios de Cuba
- 3 trabajos de ejemplo
- 3 publicaciones
- 3 contactos de trabajo
- 3 guardados
- 3 configuraciones de usuario

### Usuarios de Prueba

| Username | Password | Rol |
|----------|----------|-----|
| admin | Password123 | admin |
| carlos | Password123 | trabajador |
| laura | Password123 | trabajador |

## Tecnologías

- Express.js - Framework web
- Sequelize - ORM PostgreSQL
- PostgreSQL - Base de datos
- JWT - Autenticación
- bcrypt - Hashing de contraseñas
- express-validator - Validación
- node-telegram-bot-api - Notificaciones Telegram
- Swagger - Documentación

## Seguridad

- JWT con expiración y refresh tokens
- bcrypt para contraseñas
- Helmet para headers seguros
- CORS configurado
- Rate limiting
- Validación de entrada
- Soft delete

## Licencia

MIT
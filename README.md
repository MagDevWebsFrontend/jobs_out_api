 # 🚀 Jobs Out API - Backend

API REST para la plataforma de búsqueda y publicación de trabajos en Cuba, desarrollada con Node.js, Express, PostgreSQL y Sequelize.

## 📋 Características

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **CRUD completo** para usuarios, provincias, municipios
- ✅ **Roles de usuario** (admin/trabajador)
- ✅ **Sistema de notificaciones** por Telegram
- ✅ **Documentación Swagger** automática
- ✅ **Manejo de errores** centralizado
- ✅ **Validación de datos** con Sequelize
- ✅ **Soft delete** para usuarios y trabajos
- ✅ **Paginación y filtros** en consultas

## 🏗️ Arquitectura
src/
├── config/ # Configuraciones (DB, Swagger)
├── controllers/ # Controladores HTTP
├── errors/ # Clases de errores personalizados
├── middleware/ # Middlewares (auth, upload, validation)
├── models/ # Modelos Sequelize
├── routes/ # Rutas de la API
├── services/ # Lógica de negocio
└── utils/ # Utilidades (logger, bcrypt, jwt)


## 📚 Documentación API

La documentación completa está disponible en Swagger UI:

🔗 **Swagger UI:** http://localhost:4000/api-docs

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token JWT
- `GET /api/auth/me` - Obtener perfil del usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

#### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin only)
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (soft delete)
- `PATCH /api/usuarios/:id/restore` - Restaurar usuario (admin only)
- `PUT /api/usuarios/:id/notificaciones` - Actualizar notificaciones

#### Ubicaciones
- `GET /api/provincias` - Listar todas las provincias
- `GET /api/provincias/:id` - Obtener provincia con municipios
- `POST /api/provincias` - Crear provincia (admin only)
- `GET /api/municipios` - Listar municipios
- `GET /api/municipios/:id` - Obtener municipio
- `POST /api/municipios` - Crear municipio (admin only)

## 🚀 Instalación Rápida

### 1. Prerrequisitos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

### 2. Configuración

```bash
# Clonar repositorio
git clone <repo-url>
cd jobs_out_api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Crear base de datos
createdb -U postgres db-trabajos

# Iniciar servidor
npm run dev

# PostgreSQL
DB_DEV_NAME=db-trabajos
DB_DEV_USER=postgres
DB_DEV_PASS=tu_password
DB_DEV_HOST=localhost
DB_DEV_PORT=5432

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

# App
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000


# Iniciar servidor en desarrollo
npm run dev

# Probar conexión a base de datos
npm run db:test

# Verificar configuración
npm run verify

📦 Dependencias Principales
Express - Framework web

Sequelize - ORM para PostgreSQL

PostgreSQL - Base de datos

JWT - Autenticación por tokens

Bcrypt - Encriptación de contraseñas

Swagger - Documentación API

Winston - Logging

Zod - Validación de datos

🔐 Seguridad
✅ JWT con expiración y refresh tokens

✅ Bcrypt para hashing de contraseñas

✅ Helmet para headers de seguridad

✅ CORS configurado específicamente

✅ Rate limiting por IP

✅ Validación de entrada con Sequelize

✅ Sanitización de datos

🤝 Contribución
Fork el proyecto

Crea una rama (git checkout -b feature/AmazingFeature)

Commit los cambios (git commit -m 'Add AmazingFeature')

Push a la rama (git push origin feature/AmazingFeature)

Abre un Pull Request

📄 Licencia
Distribuido bajo la licencia MIT. Ver LICENSE para más información.

👥 Autores
Equipo Jobs Out - Desarrollo inicial

🙏 Agradecimientos
A todos los contribuidores

A la comunidad de Node.js y PostgreSQL

A los profesores de la carrera de Ingeniería Informática



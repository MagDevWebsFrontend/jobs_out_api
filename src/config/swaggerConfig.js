const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jobs Out API - Plataforma de Trabajos en Cuba',
      version: '2.0.0',
      description: 'API REST para la plataforma de búsqueda y publicación de trabajos en Cuba',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'magdev.websfrontend@gmail.com',
        url: 'https://jobsout.vercel.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.jobsout.vercel.app/api',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Mensaje de error'
                },
                statusCode: {
                  type: 'integer',
                  example: 400
                },
                status: {
                  type: 'string',
                  example: 'fail'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-01T12:00:00Z'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            data: {
              type: 'object',
              additionalProperties: true
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            nombre: {
              type: 'string',
              example: 'Juan Pérez'
            },
            username: {
              type: 'string',
              example: 'juanperez'
            },
            email: {
              type: 'string',
              example: 'juan@example.com'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'trabajador'],
              example: 'trabajador'
            },
            telefono_e164: {
              type: 'string',
              example: '+584141234567'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Provincia: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nombre: {
              type: 'string',
              example: 'La Habana'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Municipio: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            provincia_id: {
              type: 'string',
              format: 'uuid'
            },
            nombre: {
              type: 'string',
              example: 'Playa'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // =========================
        // ESQUEMAS PARA TRABAJOS (YA EXISTENTES)
        // =========================
        Trabajo: {
          type: 'object',
          required: ['titulo', 'descripcion'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            titulo: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Desarrollador Full Stack Senior'
            },
            descripcion: {
              type: 'string',
              minLength: 10,
              maxLength: 5000,
              example: 'Buscamos desarrollador con experiencia en Node.js y React'
            },
            estado: {
              type: 'string',
              enum: ['borrador', 'publicado', 'archivado'],
              example: 'publicado',
              default: 'borrador'
            },
            jornada: {
              type: 'string',
              enum: ['tiempo_completo','tiempo_parcial','por_turnos'],
              example: 'completa'
            },
            modo: {
              type: 'string',
              enum: ['presencial', 'remoto', 'hibrido'],
              example: 'remoto'
            },
            experiencia_min: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
              example: 3,
              description: 'Años de experiencia mínima requerida'
            },
            salario_min: {
              type: 'number',
              minimum: 0,
              example: 20000,
              description: 'Salario mínimo en CUP'
            },
            salario_max: {
              type: 'number',
              minimum: 0,
              example: 40000,
              description: 'Salario máximo en CUP'
            },
            beneficios: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Seguro médico', 'Bonos por resultados', 'Capacitación']
            },
            autor_id: {
              type: 'string',
              format: 'uuid'
            },
            municipio_id: {
              type: 'string',
              format: 'uuid'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            },
            deleted_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            }
          }
        },
        TrabajoContacto: {
          type: 'object',
          required: ['tipo', 'valor'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            trabajo_id: {
              type: 'string',
              format: 'uuid'
            },
            tipo: {
              type: 'string',
              enum: ['telefono', 'whatsapp', 'email', 'sitio_web'],
              example: 'telefono'
            },
            valor: {
              type: 'string',
              example: '+584141234567'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        TrabajoCompleto: {
          allOf: [
            { $ref: '#/components/schemas/Trabajo' },
            {
              type: 'object',
              properties: {
                autor: {
                  $ref: '#/components/schemas/Usuario'
                },
                municipio: {
                  $ref: '#/components/schemas/Municipio'
                },
                contactos: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/TrabajoContacto'
                  }
                }
              }
            }
          ]
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 150
            },
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            pages: {
              type: 'integer',
              example: 15
            }
          }
        },
        TrabajoListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                trabajos: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/TrabajoCompleto'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                },
                filters: {
                  type: 'object',
                  additionalProperties: true
                }
              }
            }
          }
        },
        EstadisticasTrabajos: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 150
            },
            por_estado: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  estado: {
                    type: 'string'
                  },
                  total: {
                    type: 'integer'
                  }
                }
              }
            },
            por_jornada: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  jornada: {
                    type: 'string'
                  },
                  total: {
                    type: 'integer'
                  }
                }
              }
            },
            por_modo: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modo: {
                    type: 'string'
                  },
                  total: {
                    type: 'integer'
                  }
                }
              }
            },
            trabajos_este_mes: {
              type: 'integer',
              example: 25
            },
            fecha_consulta: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // =========================
        // NUEVOS ESQUEMAS PARA PUBLICACIONES
        // =========================
        Publicacion: {
          type: 'object',
          required: ['trabajo_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'ID único de la publicación'
            },
            trabajo_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'ID del trabajo publicado'
            },
            autor_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174002',
              description: 'ID del autor de la publicación'
            },
            publicado_en: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
              description: 'Fecha y hora de publicación'
            },
            estado: {
              type: 'string',
              enum: ['borrador', 'publicado', 'archivado'],
              example: 'publicado',
              default: 'publicado',
              description: 'Estado actual de la publicación'
            },
            imagen_url: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/micuenta/image/upload/v1234567890/publicacion.jpg',
              description: 'URL de la imagen asociada a la publicación',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
              description: 'Fecha de creación del registro'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-16T14:45:00Z',
              description: 'Fecha de última actualización'
            }
          }
        },
        
        PublicacionCreateRequest: {
          type: 'object',
          required: ['trabajo_id'],
          properties: {
            trabajo_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'ID del trabajo a publicar'
            },
            estado: {
              type: 'string',
              enum: ['borrador', 'publicado', 'archivado'],
              default: 'publicado',
              example: 'publicado',
              description: 'Estado inicial de la publicación'
            },
            imagen_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/imagen-publicacion.jpg',
              description: 'URL opcional de imagen para la publicación',
              nullable: true
            }
          }
        },
        
        PublicacionUpdateRequest: {
          type: 'object',
          properties: {
            estado: {
              type: 'string',
              enum: ['borrador', 'publicado', 'archivado'],
              example: 'archivado',
              description: 'Nuevo estado de la publicación'
            },
            imagen_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/nueva-imagen.jpg',
              description: 'Nueva URL de imagen para la publicación',
              nullable: true
            }
          },
          minProperties: 1,
          description: 'Debe proporcionar al menos un campo para actualizar'
        },
        
        RepublicarRequest: {
          type: 'object',
          required: ['trabajo_id'],
          properties: {
            trabajo_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'ID del trabajo a republicar'
            },
            imagen_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/imagen-republicacion.jpg',
              description: 'URL opcional de imagen para la republicación',
              nullable: true
            }
          }
        },
        
        PublicacionCompleta: {
          allOf: [
            { $ref: '#/components/schemas/Publicacion' },
            {
              type: 'object',
              properties: {
                trabajo: {
                  $ref: '#/components/schemas/TrabajoCompleto',
                  description: 'Información completa del trabajo publicado'
                },
                autor: {
                  $ref: '#/components/schemas/Usuario',
                  description: 'Información del autor de la publicación'
                }
              }
            }
          ]
        },
        
        PublicacionListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                publicaciones: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/PublicacionCompleta'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                },
                filtros: {
                  type: 'object',
                  properties: {
                    estado: {
                      type: 'string',
                      nullable: true
                    },
                    municipio_id: {
                      type: 'string',
                      format: 'uuid',
                      nullable: true
                    },
                    provincia_id: {
                      type: 'string',
                      format: 'uuid',
                      nullable: true
                    }
                  }
                }
              }
            }
          }
        },
        
        EstadisticasPublicaciones: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 100,
              description: 'Total de publicaciones'
            },
            publicados: {
              type: 'integer',
              example: 75,
              description: 'Publicaciones en estado "publicado"'
            },
            borradores: {
              type: 'integer',
              example: 15,
              description: 'Publicaciones en estado "borrador"'
            },
            archivados: {
              type: 'integer',
              example: 10,
              description: 'Publicaciones en estado "archivado"'
            },
            ultimas24Horas: {
              type: 'integer',
              example: 5,
              description: 'Publicaciones creadas en las últimas 24 horas'
            },
            fecha_consulta: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        
        // =========================
        // NUEVOS ESQUEMAS PARA GUARDADOS
        // =========================
        Guardado: {
          type: 'object',
          required: ['usuario_id', 'publicacion_id'],
          properties: {
            usuario_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'ID del usuario que guardó la publicación'
            },
            publicacion_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174002',
              description: 'ID de la publicación guardada'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
              description: 'Fecha en que se guardó la publicación'
            }
          }
        },
        
        GuardadoCreateRequest: {
          type: 'object',
          required: ['publicacion_id'],
          properties: {
            publicacion_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174002',
              description: 'ID de la publicación a guardar'
            }
          }
        },
        
        GuardadoCompleto: {
          allOf: [
            { $ref: '#/components/schemas/Guardado' },
            {
              type: 'object',
              properties: {
                publicacion: {
                  $ref: '#/components/schemas/PublicacionCompleta',
                  description: 'Información completa de la publicación guardada'
                }
              }
            }
          ]
        },
        
        GuardadoListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                guardados: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/GuardadoCompleto'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                },
                total: {
                  type: 'integer',
                  example: 25,
                  description: 'Total de publicaciones guardadas'
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token no válido o no proporcionado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'No autorizado',
                  statusCode: 401,
                  status: 'fail',
                  timestamp: '2024-01-01T12:00:00Z'
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'No tienes permisos para esta acción',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        TooManyRequestsError: {
          description: 'Demasiadas solicitudes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.',
                  statusCode: 429,
                  status: 'fail',
                  timestamp: '2024-01-01T12:00:00Z'
                }
              }
            }
          }
        },
        ConflictError: {
          description: 'Conflicto de datos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'La publicación ya ha sido guardada anteriormente',
                  statusCode: 409,
                  status: 'fail',
                  timestamp: '2024-01-01T12:00:00Z'
                }
              }
            }
          }
        }
      }
    },
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
        name: 'Ubicaciones',
        description: 'Provincias y municipios de Cuba'
      },
      {
        name: 'Trabajos',
        description: 'Gestión de ofertas de trabajo'
      },
      {
        name: 'Publicaciones', // ← NUEVO TAG
        description: 'Publicación y republicación de trabajos'
      },
      {
        name: 'Guardados', // ← NUEVO TAG
        description: 'Publicaciones guardadas (bookmarks) por usuarios'
      },
      {
        name: 'Sistema',
        description: 'Salud y monitoreo del sistema'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/routes/*.route.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

// Verificar que la especificación sea válida
console.log('📚 Swagger configurado correctamente');
console.log(`📄 Version: ${swaggerSpec.openapi}`);
console.log(`🏷️  Tags: ${swaggerSpec.tags?.length || 0}`);
console.log(`🛣️  Paths: ${Object.keys(swaggerSpec.paths || {}).length}`);
console.log(`📋 Schemas: ${Object.keys(swaggerSpec.components?.schemas || {}).length}`);

module.exports = swaggerSpec;
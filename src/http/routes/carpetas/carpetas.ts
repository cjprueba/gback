import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';
import { MinIOUtils } from '@/utils/minio-utils';
import { CarpetaDBUtils } from '@/utils/carpeta-db-utils';

export async function carpetasRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    .post('/carpetas', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Crear una nueva carpeta',
        description: 'Crea una nueva carpeta en el sistema de archivos y en MinIO. La carpeta puede ser una carpeta raíz, una subcarpeta de otra carpeta, o una carpeta asociada a un proyecto específico.',
        body: z.object({
          nombre: z.string().max(255),
          descripcion: z.string().optional(),
          carpeta_padre_id: z.number().optional(),
          proyecto_id: z.number().optional(),
          etapa_tipo_id: z.number(),
          usuario_creador: z.number(),
          orden_visualizacion: z.number().optional().default(0),
          max_tamaño_mb: z.number().optional(),
          tipos_archivo_permitidos: z.array(z.string()).optional(),
          permisos_lectura: z.array(z.string()).optional(),
          permisos_escritura: z.array(z.string()).optional()
        }),
        response: {
          201: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            carpeta_padre_id: z.number().nullable(),
            proyecto_id: z.number().nullable(),
            etapa_tipo_id: z.number().nullable(),
            s3_path: z.string(),
            s3_bucket_name: z.string().nullable(),
            s3_created: z.boolean(),
            orden_visualizacion: z.number(),
            max_tamaño_mb: z.number().nullable(),
            tipos_archivo_permitidos: z.array(z.string()),
            permisos_lectura: z.array(z.string()),
            permisos_escritura: z.array(z.string()),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean()
          }),
          400: z.object({
            message: z.string(),
            carpeta_existente: z.object({
              id: z.number(),
              nombre: z.string(),
              s3_path: z.string()
            }).optional()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const {
          nombre,
          descripcion,
          carpeta_padre_id,
          proyecto_id,
          etapa_tipo_id,
          usuario_creador,
          orden_visualizacion = 0,
          max_tamaño_mb,
          tipos_archivo_permitidos = [],
          permisos_lectura = [],
          permisos_escritura = []
        } = request.body;

        // Validar que el usuario existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: usuario_creador }
        });

        if (!usuario) {
          return reply.status(400).send({
            message: 'Usuario no encontrado'
          });
        }

        // Si se especifica carpeta_padre_id, validar que existe
        if (carpeta_padre_id) {
          const carpetaPadre = await prisma.carpetas.findUnique({
            where: { id: carpeta_padre_id }
          });

          if (!carpetaPadre) {
            return reply.status(400).send({
              message: 'Carpeta padre no encontrada'
            });
          }
        }

        // Si se especifica proyecto_id, validar que existe
        if (proyecto_id) {
          const proyecto = await prisma.proyectos.findUnique({
            where: { id: proyecto_id }
          });

          if (!proyecto) {
            return reply.status(400).send({
              message: 'Proyecto no encontrado'
            });
          }
        }

        // Si se especifica etapa_tipo_id, validar que existe
        if (etapa_tipo_id) {
          const etapaTipo = await prisma.etapas_tipo.findUnique({
            where: { id: etapa_tipo_id }
          });

          if (!etapaTipo) {
            return reply.status(400).send({
              message: 'Tipo de etapa no encontrado'
            });
          }
        }

        // Construir el path de S3
        let s3Path = '';
        
        if (carpeta_padre_id) {
          // Si tiene carpeta padre, obtener su path y agregar el nombre de la nueva carpeta
          const carpetaPadre = await prisma.carpetas.findUnique({
            where: { id: carpeta_padre_id },
            select: { s3_path: true }
          });
          
          if (carpetaPadre) {
            s3Path = `${carpetaPadre.s3_path}/${nombre}`;
          }
        } else if (proyecto_id) {
          // Si es carpeta de proyecto, usar el nombre del proyecto como base
          const proyecto = await prisma.proyectos.findUnique({
            where: { id: proyecto_id },
            select: { nombre: true }
          });
          
          if (proyecto) {
            s3Path = `proyectos/${proyecto.nombre}/${nombre}`;
          }
        } else {
          // Carpeta raíz
          s3Path = nombre;
        }

        // Verificar si ya existe una carpeta con el mismo nombre en el mismo nivel
        const carpetaExistente = await prisma.carpetas.findFirst({
          where: {
            nombre: nombre,
            carpeta_padre_id: carpeta_padre_id || null,
            proyecto_id: proyecto_id || null,
            activa: true
          }
        });

        if (carpetaExistente) {
          return reply.status(400).send({
            message: `Ya existe una carpeta con el nombre "${nombre}" en esta ubicación`,
            carpeta_existente: {
              id: carpetaExistente.id,
              nombre: carpetaExistente.nombre,
              s3_path: carpetaExistente.s3_path
            }
          });
        }

        // Crear la carpeta en MinIO
        try {
          await MinIOUtils.createFolder(s3Path);
          console.log(`Carpeta creada en MinIO: ${s3Path}`);
        } catch (minioError) {
          console.error('Error creando carpeta en MinIO:', minioError);
          return reply.status(500).send({
            message: 'Error creando carpeta en el almacenamiento'
          });
        }

        // Crear el registro en la base de datos
        const carpeta = await prisma.carpetas.create({
          data: {
            nombre,
            descripcion,
            carpeta_padre_id,
            proyecto_id,
            etapa_tipo_id,
            s3_path: s3Path,
            s3_bucket_name: process.env.MINIO_BUCKET,
            s3_created: true,
            orden_visualizacion,
            max_tamaño_mb,
            tipos_archivo_permitidos,
            permisos_lectura,
            permisos_escritura,
            usuario_creador,
            activa: true
          }
        });

        console.log(`Carpeta creada exitosamente: ${carpeta.nombre} (ID: ${carpeta.id})`);

        return reply.status(201).send(carpeta);

      } catch (error) {
        console.error('Error creando carpeta:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    })

    .get('/carpetas', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Obtener lista de carpetas',
        description: 'Obtiene una lista paginada de carpetas con múltiples opciones de filtrado, ordenamiento y relaciones. Permite filtrar por proyecto, carpeta padre, usuario creador, estado activo, nombre, descripción, permisos, tipos de archivo permitidos, fechas y tamaños. También permite incluir relaciones como carpeta padre, proyecto, creador, carpetas hijas y documentos.',
        querystring: z.object({
          // Filtros básicos
          proyecto_id: z.string().optional(),
          carpeta_padre_id: z.string().optional(),
          usuario_creador: z.string().optional(),
          activa: z.string().optional(),
          
          // Filtros de búsqueda
          nombre: z.string().optional(),
          descripcion: z.string().optional(),
          
          // Filtros de permisos
          permisos_lectura: z.string().optional(),
          permisos_escritura: z.string().optional(),
          
          // Filtros de tipos de archivo
          tipo_archivo: z.string().optional(),
          
          // Paginación
          page: z.string().optional(),
          limit: z.string().optional(),
          
          // Ordenamiento
          sort_by: z.enum(['nombre', 'fecha_creacion', 'orden_visualizacion']).optional(),
          sort_order: z.enum(['asc', 'desc']).optional(),
          
          // Filtros de fecha
          fecha_desde: z.string().optional(),
          fecha_hasta: z.string().optional(),
          
          // Filtros de tamaño
          max_tamaño_min: z.string().optional(),
          max_tamaño_max: z.string().optional(),
          
          // Incluir relaciones
          include_hijos: z.string().optional(),
          include_padre: z.string().optional(),
          include_proyecto: z.string().optional(),
          include_creador: z.string().optional(),
          include_documentos: z.string().optional()
        }),
        response: {
          200: z.object({
            carpetas: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              descripcion: z.string().nullable(),
              carpeta_padre_id: z.number().nullable(),
              proyecto_id: z.number().nullable(),
              s3_path: z.string(),
              s3_bucket_name: z.string().nullable(),
              s3_created: z.boolean(),
              orden_visualizacion: z.number(),
              max_tamaño_mb: z.number().nullable(),
              tipos_archivo_permitidos: z.array(z.string()),
              permisos_lectura: z.array(z.string()),
              permisos_escritura: z.array(z.string()),
              usuario_creador: z.number(),
              fecha_creacion: z.date(),
              fecha_actualizacion: z.date(),
              activa: z.boolean(),
              // Relaciones opcionales
              carpeta_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }).nullable().optional(),
              proyecto: z.object({
                id: z.number(),
                nombre: z.string()
              }).nullable().optional(),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string()
              }).nullable().optional(),
              carpetas_hijas: z.array(z.object({
                id: z.number(),
                nombre: z.string()
              })).optional(),
              documentos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string()
              })).optional(),
              total_documentos: z.number().optional()
            })),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              total_pages: z.number()
            }).optional(),
            filters: z.object({
              aplicados: z.record(z.any()),
              total_resultados: z.number()
            }).optional()
          }),
          400: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const {
          proyecto_id,
          carpeta_padre_id,
          usuario_creador,
          activa,
          nombre,
          descripcion,
          permisos_lectura,
          permisos_escritura,
          tipo_archivo,
          page = '1',
          limit = '20',
          sort_by = 'orden_visualizacion',
          sort_order = 'asc',
          fecha_desde,
          fecha_hasta,
          max_tamaño_min,
          max_tamaño_max,
          include_hijos,
          include_padre,
          include_proyecto,
          include_creador,
          include_documentos
        } = request.query;

        // Construir filtros
        const where: any = {};
        const filters: any = {};

        // Filtros básicos
        if (proyecto_id) {
          where.proyecto_id = parseInt(proyecto_id);
          filters.proyecto_id = proyecto_id;
        }

        if (carpeta_padre_id) {
          where.carpeta_padre_id = parseInt(carpeta_padre_id);
          filters.carpeta_padre_id = carpeta_padre_id;
        }

        if (usuario_creador) {
          where.usuario_creador = parseInt(usuario_creador);
          filters.usuario_creador = usuario_creador;
        }

        if (activa !== undefined) {
          where.activa = activa === 'true';
          filters.activa = activa;
        }

        // Filtros de búsqueda
        if (nombre) {
          where.nombre = {
            contains: nombre,
            mode: 'insensitive'
          };
          filters.nombre = nombre;
        }

        if (descripcion) {
          where.descripcion = {
            contains: descripcion,
            mode: 'insensitive'
          };
          filters.descripcion = descripcion;
        }

        // Filtros de permisos
        if (permisos_lectura) {
          where.permisos_lectura = {
            has: permisos_lectura
          };
          filters.permisos_lectura = permisos_lectura;
        }

        if (permisos_escritura) {
          where.permisos_escritura = {
            has: permisos_escritura
          };
          filters.permisos_escritura = permisos_escritura;
        }

        // Filtro de tipo de archivo
        if (tipo_archivo) {
          where.tipos_archivo_permitidos = {
            has: tipo_archivo
          };
          filters.tipo_archivo = tipo_archivo;
        }

        // Filtros de fecha
        if (fecha_desde || fecha_hasta) {
          where.fecha_creacion = {};
          if (fecha_desde) {
            where.fecha_creacion.gte = new Date(fecha_desde);
            filters.fecha_desde = fecha_desde;
          }
          if (fecha_hasta) {
            where.fecha_creacion.lte = new Date(fecha_hasta);
            filters.fecha_hasta = fecha_hasta;
          }
        }

        // Filtros de tamaño
        if (max_tamaño_min || max_tamaño_max) {
          where.max_tamaño_mb = {};
          if (max_tamaño_min) {
            where.max_tamaño_mb.gte = parseInt(max_tamaño_min);
            filters.max_tamaño_min = max_tamaño_min;
          }
          if (max_tamaño_max) {
            where.max_tamaño_mb.lte = parseInt(max_tamaño_max);
            filters.max_tamaño_max = max_tamaño_max;
          }
        }

        // Configurar ordenamiento
        const orderBy: any = {};
        orderBy[sort_by] = sort_order;

        // Configurar paginación
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Configurar includes
        const include: any = {};
        
        if (include_padre === 'true') {
          include.carpeta_padre = {
            select: {
              id: true,
              nombre: true
            }
          };
        }

        if (include_proyecto === 'true') {
          include.proyecto = {
            select: {
              id: true,
              nombre: true
            }
          };
        }

        if (include_creador === 'true') {
          include.creador = {
            select: {
              id: true,
              nombre_completo: true
            }
          };
        }

        if (include_hijos === 'true') {
          include.carpetas_hijas = {
            select: {
              id: true,
              nombre: true
            }
          };
        }

        if (include_documentos === 'true') {
          include.documentos = {
            where: {
              eliminado: false
            },
            select: {
              id: true,
              nombre_archivo: true
            }
          };
        }

        // Obtener total de registros para paginación
        const total = await prisma.carpetas.count({ where });

        // Obtener carpetas
        const carpetas = await prisma.carpetas.findMany({
          where,
          include,
          orderBy,
          skip,
          take: limitNum
        });

        // Calcular total de documentos si se incluye (excluyendo eliminados)
        if (include_documentos === 'true') {
          for (const carpeta of carpetas) {
            const totalDocs = await prisma.documentos.count({
              where: { 
                carpeta_id: carpeta.id,
                eliminado: false
              }
            });
            (carpeta as any).total_documentos = totalDocs;
          }
        }

        // Construir respuesta
        const response: any = {
          carpetas,
          filters: {
            aplicados: filters,
            total_resultados: total
          }
        };

        // Agregar información de paginación si hay más de un resultado
        if (total > limitNum) {
          response.pagination = {
            page: pageNum,
            limit: limitNum,
            total,
            total_pages: Math.ceil(total / limitNum)
          };
        }

        return reply.send(response);

      } catch (error) {
        console.error('Error obteniendo carpetas:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    })

    .get('/carpetas/:id', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Obtener detalles de una carpeta específica',
        description: 'Obtiene los detalles completos de una carpeta específica por su ID. Retorna toda la información de la carpeta incluyendo su configuración, permisos, tipos de archivo permitidos y metadatos.',
        params: z.object({
          id: z.string()
        }),
        response: {
          200: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            carpeta_padre_id: z.number().nullable(),
            proyecto_id: z.number().nullable(),
            s3_path: z.string(),
            s3_bucket_name: z.string().nullable(),
            s3_created: z.boolean(),
            orden_visualizacion: z.number(),
            max_tamaño_mb: z.number().nullable(),
            tipos_archivo_permitidos: z.array(z.string()),
            permisos_lectura: z.array(z.string()),
            permisos_escritura: z.array(z.string()),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean()
          }),
          404: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const { id } = request.params;

        const carpeta = await prisma.carpetas.findUnique({
          where: { id: parseInt(id) }
        });

        if (!carpeta) {
          return reply.status(404).send({
            message: 'Carpeta no encontrada'
          });
        }

        return reply.send(carpeta);

      } catch (error) {
        console.error('Error obteniendo carpeta:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    })

    .get('/carpetas/:id/contenido', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Obtener el contenido de una carpeta',
        description: 'Obtiene el contenido completo de una carpeta específica, incluyendo sus subcarpetas y documentos. Permite configurar qué elementos incluir, límites de resultados y ordenamiento. También proporciona estadísticas detalladas sobre el contenido de la carpeta como total de elementos, tamaño total y tipos de archivo únicos.',
        params: z.object({
          id: z.string()
        }),
        querystring: z.object({
          include_documentos: z.string().optional(),
          include_carpetas: z.string().optional(),
          limit_documentos: z.string().optional(),
          limit_carpetas: z.string().optional(),
          sort_documentos: z.enum(['nombre_archivo', 'fecha_creacion', 'tamano']).optional(),
          sort_carpetas: z.enum(['nombre', 'orden_visualizacion', 'fecha_creacion']).optional(),
          sort_order: z.enum(['asc', 'desc']).optional()
        }),
        response: {
          200: z.object({
            carpeta: z.object({
              id: z.number(),
              nombre: z.string(),
              descripcion: z.string().nullable(),
              s3_path: z.string(),
              orden_visualizacion: z.number(),
              max_tamaño_mb: z.number().nullable(),
              tipos_archivo_permitidos: z.array(z.string()),
              permisos_lectura: z.array(z.string()),
              permisos_escritura: z.array(z.string()),
              fecha_creacion: z.date(),
              fecha_actualizacion: z.date(),
              activa: z.boolean(),
              // Información del proyecto si existe
              proyecto: z.object({
                id: z.number(),
                nombre: z.string()
              }).nullable().optional(),
              // Información de la carpeta padre si existe
              carpeta_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }).nullable().optional()
            }),
            contenido: z.object({
              carpetas: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                orden_visualizacion: z.number(),
                fecha_creacion: z.date(),
                fecha_actualizacion: z.date(),
                activa: z.boolean(),
                total_documentos: z.number(),
                total_carpetas_hijas: z.number()
              })),
              documentos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                tamano: z.number().nullable(),
                tipo_mime: z.string().nullable(),
                fecha_creacion: z.date(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                version: z.string().nullable(),
                etiquetas: z.array(z.string()),
                usuario_creador: z.number(),
                subido_por: z.number()
              }))
            }),
            estadisticas: z.object({
              total_carpetas: z.number(),
              total_documentos: z.number(),
              tamano_total_mb: z.number().nullable(),
              tipos_archivo_unicos: z.array(z.string()),
              fecha_ultima_actualizacion: z.date().nullable()
            })
          }),
          404: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const { id } = request.params;
        const {
          include_documentos = 'true',
          include_carpetas = 'true',
          limit_documentos = '50',
          limit_carpetas = '50',
          sort_documentos = 'nombre_archivo',
          sort_carpetas = 'orden_visualizacion',
          sort_order = 'asc'
        } = request.query;

        // Obtener la carpeta principal
        const carpeta = await prisma.carpetas.findUnique({
          where: { id: parseInt(id) },
          include: {
            proyecto: {
              select: {
                id: true,
                nombre: true
              }
            },
            carpeta_padre: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        });

        if (!carpeta) {
          return reply.status(404).send({
            message: 'Carpeta no encontrada'
          });
        }

        // Inicializar respuesta
        const response: any = {
          carpeta,
          contenido: {
            carpetas: [],
            documentos: []
          },
          estadisticas: {
            total_carpetas: 0,
            total_documentos: 0,
            tamano_total_mb: 0,
            tipos_archivo_unicos: [],
            fecha_ultima_actualizacion: null
          }
        };

        // Obtener carpetas hijas si se solicita
        if (include_carpetas === 'true') {
          const carpetasHijas = await prisma.carpetas.findMany({
            where: {
              carpeta_padre_id: parseInt(id),
              activa: true
            },
            orderBy: {
              [sort_carpetas]: sort_order
            },
            take: parseInt(limit_carpetas)
          });

          // Calcular estadísticas para cada carpeta hija (excluyendo documentos eliminados)
          for (const carpetaHija of carpetasHijas) {
            const totalDocs = await prisma.documentos.count({
              where: { 
                carpeta_id: carpetaHija.id,
                eliminado: false
              }
            });

            const totalCarpetasHijas = await prisma.carpetas.count({
              where: { 
                carpeta_padre_id: carpetaHija.id,
                activa: true
              }
            });

            (carpetaHija as any).total_documentos = totalDocs;
            (carpetaHija as any).total_carpetas_hijas = totalCarpetasHijas;
          }

          response.contenido.carpetas = carpetasHijas;
          response.estadisticas.total_carpetas = carpetasHijas.length;
        }

        // Obtener documentos si se solicita (excluyendo eliminados)
        if (include_documentos === 'true') {
          const documentos = await prisma.documentos.findMany({
            where: {
              carpeta_id: parseInt(id),
              eliminado: false
            },
            orderBy: {
              [sort_documentos]: sort_order
            },
            take: parseInt(limit_documentos),
            include: {
              creador: {
                select: {
                  id: true,
                  nombre_completo: true
                }
              },
              subio_por: {
                select: {
                  id: true,
                  nombre_completo: true
                }
              }
            }
          });

          // Convertir BigInt a number para la respuesta
          const documentosFormateados = documentos.map(doc => ({
            ...doc,
            tamano: doc.tamano ? Number(doc.tamano) : null
          }));

          response.contenido.documentos = documentosFormateados;
          response.estadisticas.total_documentos = documentos.length;

          // Calcular estadísticas de documentos
          if (documentos.length > 0) {
            const tamanoTotal = documentos.reduce((sum, doc) => {
              return sum + (doc.tamano ? Number(doc.tamano) : 0);
            }, 0);

            const tiposUnicos = Array.from(new Set(
              documentos
                .map(doc => doc.extension)
                .filter(ext => ext)
            ));

            const fechaUltima = documentos.reduce((latest, doc) => {
              return doc.fecha_ultima_actualizacion > latest ? doc.fecha_ultima_actualizacion : latest;
            }, documentos[0].fecha_ultima_actualizacion);

            response.estadisticas.tamano_total_mb = Math.round(tamanoTotal / (1024 * 1024) * 100) / 100; // Convertir a MB
            response.estadisticas.tipos_archivo_unicos = tiposUnicos;
            response.estadisticas.fecha_ultima_actualizacion = fechaUltima;
          }
        }

        return reply.send(response);

      } catch (error) {
        console.error('Error obteniendo contenido de carpeta:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    })

    .put('/carpetas/:id/renombrar', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Renombrar una carpeta',
        description: 'Renombra una carpeta específica tanto en la base de datos como en el almacenamiento MinIO. Actualiza el nombre de la carpeta y recalcula las rutas S3 de todas las subcarpetas y documentos asociados.',
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          nuevo_nombre: z.string().max(255),
          usuario_modificador: z.number()
        }),
        response: {
          200: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            carpeta_padre_id: z.number().nullable(),
            proyecto_id: z.number().nullable(),
            etapa_tipo_id: z.number().nullable(),
            s3_path: z.string(),
            s3_bucket_name: z.string().nullable(),
            s3_created: z.boolean(),
            orden_visualizacion: z.number(),
            max_tamaño_mb: z.number().nullable(),
            tipos_archivo_permitidos: z.array(z.string()),
            permisos_lectura: z.array(z.string()),
            permisos_escritura: z.array(z.string()),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean(),
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          }),
          404: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const { id } = request.params;
        const { nuevo_nombre, usuario_modificador } = request.body;

        // Validar que la carpeta existe
        const carpeta = await prisma.carpetas.findUnique({
          where: { id: parseInt(id) }
        });

        if (!carpeta) {
          return reply.status(404).send({
            message: 'Carpeta no encontrada'
          });
        }

        // Validar que el usuario modificador existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: usuario_modificador }
        });

        if (!usuario) {
          return reply.status(400).send({
            message: 'Usuario modificador no encontrado'
          });
        }

        // Validar que el nuevo nombre no esté vacío
        if (!nuevo_nombre || nuevo_nombre.trim() === '') {
          return reply.status(400).send({
            message: 'El nuevo nombre no puede estar vacío'
          });
        }

        // Validar que no existe otra carpeta con el mismo nombre en el mismo nivel
        const carpetaExistente = await prisma.carpetas.findFirst({
          where: {
            nombre: nuevo_nombre,
            carpeta_padre_id: carpeta.carpeta_padre_id,
            proyecto_id: carpeta.proyecto_id,
            activa: true,
            id: { not: parseInt(id) }
          }
        });

        if (carpetaExistente) {
          return reply.status(400).send({
            message: 'Ya existe una carpeta con ese nombre en el mismo nivel'
          });
        }

        // Calcular la nueva ruta S3
        let nuevaRutaS3 = '';
        
        if (carpeta.carpeta_padre_id) {
          // Si tiene carpeta padre, obtener su path y agregar el nuevo nombre
          const carpetaPadre = await prisma.carpetas.findUnique({
            where: { id: carpeta.carpeta_padre_id },
            select: { s3_path: true }
          });
          
          if (carpetaPadre) {
            nuevaRutaS3 = `${carpetaPadre.s3_path}/${nuevo_nombre}`;
          }
        } else if (carpeta.proyecto_id) {
          // Si es carpeta de proyecto, usar el nombre del proyecto como base
          const proyecto = await prisma.proyectos.findUnique({
            where: { id: carpeta.proyecto_id },
            select: { nombre: true }
          });
          
          if (proyecto) {
            nuevaRutaS3 = `proyectos/${proyecto.nombre}/${nuevo_nombre}`;
          }
        } else {
          // Carpeta raíz
          nuevaRutaS3 = nuevo_nombre;
        }

        // Renombrar la carpeta en MinIO
        try {
          await MinIOUtils.renameFolder(carpeta.s3_path, nuevaRutaS3);
          console.log(`Carpeta renombrada en MinIO: ${carpeta.s3_path} -> ${nuevaRutaS3}`);
        } catch (minioError) {
          console.error('Error renombrando carpeta en MinIO:', minioError);
          return reply.status(500).send({
            message: 'Error renombrando carpeta en el almacenamiento'
          });
        }

        // Actualizar la carpeta principal en la base de datos
        const carpetaActualizada = await prisma.carpetas.update({
          where: { id: parseInt(id) },
          data: {
            nombre: nuevo_nombre,
            s3_path: nuevaRutaS3,
            fecha_actualizacion: new Date()
          }
        });

        // Actualizar las rutas S3 de todas las subcarpetas recursivamente
        await actualizarRutasSubcarpetas(parseInt(id), carpeta.s3_path, nuevaRutaS3);

        // Actualizar las rutas S3 de todos los documentos en esta carpeta
        await prisma.$executeRaw`
          UPDATE documentos 
          SET s3_path = REPLACE(s3_path, ${carpeta.s3_path}, ${nuevaRutaS3})
          WHERE carpeta_id = ${parseInt(id)}
        `;

        console.log(`Carpeta renombrada exitosamente: ${carpeta.nombre} -> ${nuevo_nombre} (ID: ${carpeta.id})`);

        return reply.send({
          ...carpetaActualizada,
          message: `Carpeta renombrada exitosamente de "${carpeta.nombre}" a "${nuevo_nombre}"`
        });

      } catch (error) {
        console.error('Error renombrando carpeta:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    })

    .put('/carpetas/:id/mover', {
      schema: {
        tags: ['Carpetas'],
        summary: 'Mover una carpeta a otra ubicación',
        description: 'Mueve una carpeta de una ubicación a otra, actualizando tanto la base de datos como el almacenamiento MinIO. Permite mover carpetas entre diferentes proyectos, carpetas padre, o convertir carpetas en carpetas raíz. Actualiza automáticamente las rutas S3 de todas las subcarpetas y documentos asociados.',
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          nueva_carpeta_padre_id: z.number(),
          usuario_modificador: z.number()
        }),
        response: {
          200: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            carpeta_padre_id: z.number().nullable(),
            proyecto_id: z.number().nullable(),
            s3_path: z.string(),
            s3_bucket_name: z.string().nullable(),
            s3_created: z.boolean(),
            orden_visualizacion: z.number(),
            max_tamaño_mb: z.number().nullable(),
            tipos_archivo_permitidos: z.array(z.string()),
            permisos_lectura: z.array(z.string()),
            permisos_escritura: z.array(z.string()),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean(),
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          }),
          404: z.object({
            message: z.string()
          }),
          500: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      try {
        const { id } = request.params;
        const { nueva_carpeta_padre_id, usuario_modificador } = request.body;

        // Validar que la carpeta existe
        const carpeta = await prisma.carpetas.findUnique({
          where: { id: parseInt(id) }
        });

        if (!carpeta) {
          return reply.status(404).send({
            message: 'Carpeta no encontrada'
          });
        }

        // Validar que el usuario modificador existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: usuario_modificador }
        });

        if (!usuario) {
          return reply.status(400).send({
            message: 'Usuario modificador no encontrado'
          });
        }

        // Validar que no se está intentando mover la carpeta a sí misma
        if (nueva_carpeta_padre_id === parseInt(id)) {
          return reply.status(400).send({
            message: 'No se puede mover una carpeta a sí misma'
          });
        }

        // Validar que la nueva carpeta padre existe si se especifica
        if (nueva_carpeta_padre_id) {
          const nuevaCarpetaPadre = await prisma.carpetas.findUnique({
            where: { id: nueva_carpeta_padre_id }
          });

          if (!nuevaCarpetaPadre) {
            return reply.status(400).send({
              message: 'Carpeta padre de destino no encontrada'
            });
          }

          // Validar que no se está intentando mover a una subcarpeta de sí misma
          /*const esSubcarpeta = await esSubcarpetaDe(parseInt(id), nueva_carpeta_padre_id);
          if (esSubcarpeta) {
            return reply.status(400).send({
              message: 'No se puede mover una carpeta a una de sus subcarpetas'
            });
          }*/
        }

        // Obtener información de la carpeta padre para determinar el proyecto
        const carpetaPadre = await prisma.carpetas.findUnique({
          where: { id: nueva_carpeta_padre_id },
          select: { proyecto_id: true }
        });

        if (!carpetaPadre) {
          return reply.status(400).send({
            message: 'Carpeta padre de destino no encontrada'
          });
        }

        const nuevo_proyecto_id = carpetaPadre.proyecto_id;

        // Validar que no existe otra carpeta con el mismo nombre en el destino
        const carpetaExistente = await prisma.carpetas.findFirst({
          where: {
            nombre: carpeta.nombre,
            carpeta_padre_id: nueva_carpeta_padre_id,
            proyecto_id: nuevo_proyecto_id,
            activa: true,
            id: { not: parseInt(id) }
          }
        });

        if (carpetaExistente) {
          return reply.status(400).send({
            message: 'Ya existe una carpeta con ese nombre en el destino'
          });
        }

        // Calcular la nueva ruta S3
        let nuevaRutaS3 = '';
        
        // Obtener la carpeta padre para calcular la nueva ruta
        const carpetaPadreInfo = await prisma.carpetas.findUnique({
          where: { id: nueva_carpeta_padre_id },
          select: { s3_path: true }
        });
        
        if (carpetaPadreInfo) {
          nuevaRutaS3 = `${carpetaPadreInfo.s3_path}/${carpeta.nombre}`;
        }

        // Mover la carpeta en MinIO
        try {
          await MinIOUtils.moveFolder(carpeta.s3_path, nuevaRutaS3);
          console.log(`Carpeta movida en MinIO: ${carpeta.s3_path} -> ${nuevaRutaS3}`);
        } catch (minioError) {
          console.error('Error moviendo carpeta en MinIO:', minioError);
          return reply.status(500).send({
            message: 'Error moviendo carpeta en el almacenamiento'
          });
        }

        // Actualizar la carpeta principal en la base de datos
        const carpetaActualizada = await prisma.carpetas.update({
          where: { id: parseInt(id) },
          data: {
            carpeta_padre_id: nueva_carpeta_padre_id,
            proyecto_id: nuevo_proyecto_id,
            s3_path: nuevaRutaS3,
            fecha_actualizacion: new Date()
          }
        });

        // Actualizar las rutas S3 de todas las subcarpetas recursivamente
        await actualizarRutasSubcarpetas(parseInt(id), carpeta.s3_path, nuevaRutaS3);

        // Actualizar las rutas S3 de todos los documentos en esta carpeta
        await prisma.$executeRaw`
          UPDATE documentos 
          SET s3_path = REPLACE(s3_path, ${carpeta.s3_path}, ${nuevaRutaS3})
          WHERE carpeta_id = ${parseInt(id)}
        `;

        console.log(`Carpeta movida exitosamente: ${carpeta.nombre} (ID: ${carpeta.id})`);

        return reply.send({
          ...carpetaActualizada,
          message: `Carpeta "${carpeta.nombre}" movida exitosamente`
        });

      } catch (error) {
        console.error('Error moviendo carpeta:', error);
        return reply.status(500).send({
          message: 'Error interno del servidor'
        });
      }
    });
}

// Función auxiliar para actualizar rutas de subcarpetas recursivamente
async function actualizarRutasSubcarpetas(
  carpetaId: number, 
  rutaAntigua: string, 
  rutaNueva: string
): Promise<void> {
  try {
    // Obtener todas las subcarpetas directas
    const subcarpetas = await prisma.carpetas.findMany({
      where: { carpeta_padre_id: carpetaId }
    });

    for (const subcarpeta of subcarpetas) {
      // Calcular la nueva ruta para esta subcarpeta
      const nuevaRutaSubcarpeta = subcarpeta.s3_path.replace(rutaAntigua, rutaNueva);
      
      // Actualizar la subcarpeta
      await prisma.carpetas.update({
        where: { id: subcarpeta.id },
        data: {
          s3_path: nuevaRutaSubcarpeta,
          fecha_actualizacion: new Date()
        }
      });

      // Actualizar documentos en esta subcarpeta
      await prisma.$executeRaw`
        UPDATE documentos 
        SET s3_path = REPLACE(s3_path, ${subcarpeta.s3_path}, ${nuevaRutaSubcarpeta})
        WHERE carpeta_id = ${subcarpeta.id}
      `;

      // Recursivamente actualizar subcarpetas de esta subcarpeta
      await actualizarRutasSubcarpetas(subcarpeta.id, subcarpeta.s3_path, nuevaRutaSubcarpeta);
    }
  } catch (error) {
    console.error('Error actualizando rutas de subcarpetas:', error);
    throw error;
  }
}

// Función auxiliar para verificar si una carpeta es subcarpeta de otra
async function esSubcarpetaDe(carpetaId: number, carpetaPadreId: number): Promise<boolean> {
  try {
    const carpeta = await prisma.carpetas.findUnique({
      where: { id: carpetaId },
      select: { carpeta_padre_id: true }
    });

    if (!carpeta) {
      return false;
    }

    // Si la carpeta no tiene padre, no es subcarpeta
    if (!carpeta.carpeta_padre_id) {
      return false;
    }

    // Si el padre es el que estamos buscando, es subcarpeta
    if (carpeta.carpeta_padre_id === carpetaPadreId) {
      return true;
    }

    // Recursivamente verificar el padre del padre
    return await esSubcarpetaDe(carpeta.carpeta_padre_id, carpetaPadreId);
  } catch (error) {
    console.error('Error verificando si es subcarpeta:', error);
    return false;
  }
}
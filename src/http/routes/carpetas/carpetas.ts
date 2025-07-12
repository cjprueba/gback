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
        body: z.object({
          nombre: z.string().max(255),
          descripcion: z.string().optional(),
          carpeta_padre_id: z.number().optional(),
          proyecto_id: z.number().optional(),
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
          nombre,
          descripcion,
          carpeta_padre_id,
          proyecto_id,
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
        description: 'Obtener detalles de una carpeta específica',
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
        description: 'Obtener el contenido de una carpeta',
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
    });
}

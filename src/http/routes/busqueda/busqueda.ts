import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma'

export async function busquedaRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    .get('/busqueda', {
      schema: {
        tags: ['Búsqueda'],
        summary: 'Búsqueda general de archivos y carpetas',
        description: 'Realiza una búsqueda general en archivos y carpetas con múltiples opciones de filtrado',
        querystring: z.object({
          // Parámetros de búsqueda
          query: z.string().min(1, 'La consulta de búsqueda es requerida'),
          tipo_busqueda: z.enum(['general', 'archivos', 'carpetas']).optional().default('general'),
          
          // Filtros de archivos
          extension: z.string().optional(),
          categoria: z.string().optional(),
          estado: z.string().optional(),
          etiquetas: z.string().optional(), // Array separado por comas
          tamano_min: z.string().optional(),
          tamano_max: z.string().optional(),
          fecha_desde: z.string().optional(),
          fecha_hasta: z.string().optional(),
          
          // Filtros de carpetas
          carpeta_padre_id: z.string().optional(),
          proyecto_id: z.string().optional(),
          usuario_creador: z.string().optional(),
          
          // Filtros generales
          activo: z.string().optional(),
          
          // Paginación
          page: z.string().optional().default('1'),
          limit: z.string().optional().default('20'),
          
          // Ordenamiento
          sort_by: z.enum(['nombre', 'fecha_creacion', 'tamano', 'relevancia']).optional().default('relevancia'),
          sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
          
          // Incluir relaciones
          include_creador: z.string().optional(),
          include_carpeta: z.string().optional(),
          include_proyecto: z.string().optional()
        }),
        response: {
          200: z.object({
            resultados: z.object({
              archivos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                tamano: z.number().nullable(),
                tipo_mime: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                version: z.string().nullable(),
                carpeta_id: z.number(),
                s3_path: z.string().nullable(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable(),
                subido_por: z.number(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable()
                }).optional(),
                carpeta: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  s3_path: z.string()
                }).optional(),
                proyecto: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).optional()
              })),
              carpetas: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                carpeta_padre_id: z.number().nullable(),
                proyecto_id: z.number().nullable(),
                s3_path: z.string(),
                orden_visualizacion: z.number(),
                max_tamaño_mb: z.number().nullable(),
                tipos_archivo_permitidos: z.array(z.string()),
                permisos_lectura: z.array(z.string()),
                permisos_escritura: z.array(z.string()),
                usuario_creador: z.number(),
                fecha_creacion: z.date(),
                fecha_actualizacion: z.date(),
                activa: z.boolean(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable()
                }).optional(),
                carpeta_padre: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).optional(),
                proyecto: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).optional()
              }))
            }),
            paginacion: z.object({
              page: z.number(),
              limit: z.number(),
              total_archivos: z.number(),
              total_carpetas: z.number(),
              total_resultados: z.number(),
              total_pages: z.number()
            }),
            estadisticas: z.object({
              tiempo_busqueda_ms: z.number(),
              consulta_original: z.string(),
              tipo_busqueda: z.string()
            })
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
        const startTime = Date.now()
        const {
          query,
          tipo_busqueda = 'general',
          extension,
          categoria,
          estado,
          etiquetas,
          tamano_min,
          tamano_max,
          fecha_desde,
          fecha_hasta,
          carpeta_padre_id,
          proyecto_id,
          usuario_creador,
          activo,
          page = '1',
          limit = '20',
          sort_by = 'relevancia',
          sort_order = 'desc',
          include_creador,
          include_carpeta,
          include_proyecto
        } = request.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const offset = (pageNum - 1) * limitNum

        // Construir condiciones de búsqueda para archivos
        const archivosWhere: any = {
          eliminado: false
        }

        // Construir condiciones de búsqueda para carpetas
        const carpetasWhere: any = {
          activa: true
        }

        // Búsqueda por texto en nombre
        const searchCondition = {
          OR: [
            { nombre_archivo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } }
          ]
        }

        const carpetasSearchCondition = {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } }
          ]
        }

        // Aplicar filtros específicos para archivos
        if (extension) {
          archivosWhere.extension = { contains: extension, mode: 'insensitive' }
        }

        if (categoria) {
          archivosWhere.categoria = { contains: categoria, mode: 'insensitive' }
        }

        if (estado) {
          archivosWhere.estado = { contains: estado, mode: 'insensitive' }
        }

        if (etiquetas) {
          const etiquetasArray = etiquetas.split(',').map(tag => tag.trim())
          archivosWhere.etiquetas = { hasSome: etiquetasArray }
        }

        if (tamano_min) {
          archivosWhere.tamano = { gte: BigInt(parseInt(tamano_min) * 1024 * 1024) }
        }

        if (tamano_max) {
          archivosWhere.tamano = { ...archivosWhere.tamano, lte: BigInt(parseInt(tamano_max) * 1024 * 1024) }
        }

        if (fecha_desde) {
          archivosWhere.fecha_creacion = { gte: new Date(fecha_desde) }
        }

        if (fecha_hasta) {
          archivosWhere.fecha_creacion = { ...archivosWhere.fecha_creacion, lte: new Date(fecha_hasta) }
        }

        if (proyecto_id) {
          archivosWhere.proyecto_id = parseInt(proyecto_id)
          carpetasWhere.proyecto_id = parseInt(proyecto_id)
        }

        if (usuario_creador) {
          archivosWhere.subido_por = parseInt(usuario_creador)
          carpetasWhere.usuario_creador = parseInt(usuario_creador)
        }

        if (carpeta_padre_id) {
          carpetasWhere.carpeta_padre_id = parseInt(carpeta_padre_id)
        }

        // Combinar condiciones de búsqueda
        archivosWhere.AND = [searchCondition]
        carpetasWhere.AND = [carpetasSearchCondition]

        // Preparar includes
        const archivosInclude: any = {}
        const carpetasInclude: any = {}

        if (include_creador === 'true') {
          archivosInclude.creador = {
            select: {
              id: true,
              nombre_completo: true,
              correo_electronico: true
            }
          }
          carpetasInclude.creador = {
            select: {
              id: true,
              nombre_completo: true,
              correo_electronico: true
            }
          }
        }

        if (include_carpeta === 'true') {
          archivosInclude.carpeta = {
            select: {
              id: true,
              nombre: true,
              s3_path: true
            }
          }
        }

        if (include_proyecto === 'true') {
          archivosInclude.proyecto = {
            select: {
              id: true,
              nombre: true
            }
          }
          carpetasInclude.proyecto = {
            select: {
              id: true,
              nombre: true
            }
          }
        }

        if (include_carpeta === 'true') {
          carpetasInclude.carpeta_padre = {
            select: {
              id: true,
              nombre: true
            }
          }
        }

        // Determinar ordenamiento
        let archivosOrderBy: any = {}
        let carpetasOrderBy: any = {}

        if (sort_by === 'relevancia') {
          // Ordenar por relevancia (simulado por fecha de creación)
          archivosOrderBy.fecha_creacion = sort_order
          carpetasOrderBy.fecha_creacion = sort_order
        } else if (sort_by === 'nombre') {
          archivosOrderBy.nombre_archivo = sort_order
          carpetasOrderBy.nombre = sort_order
        } else if (sort_by === 'fecha_creacion') {
          archivosOrderBy.fecha_creacion = sort_order
          carpetasOrderBy.fecha_creacion = sort_order
        } else if (sort_by === 'tamano') {
          archivosOrderBy.tamano = sort_order
          // Para carpetas no hay tamaño, usar fecha
          carpetasOrderBy.fecha_creacion = sort_order
        }

        // Realizar búsquedas según el tipo
        let archivos: any[] = []
        let carpetas: any[] = []
        let totalArchivos = 0
        let totalCarpetas = 0

        if (tipo_busqueda === 'general' || tipo_busqueda === 'archivos') {
          const [archivosResult, archivosCount] = await Promise.all([
            prisma.documentos.findMany({
              where: archivosWhere,
              include: archivosInclude,
              orderBy: archivosOrderBy,
              skip: offset,
              take: limitNum
            }),
            prisma.documentos.count({ where: archivosWhere })
          ])

          archivos = archivosResult
          totalArchivos = archivosCount
        }

        if (tipo_busqueda === 'general' || tipo_busqueda === 'carpetas') {
          const [carpetasResult, carpetasCount] = await Promise.all([
            prisma.carpetas.findMany({
              where: carpetasWhere,
              include: carpetasInclude,
              orderBy: carpetasOrderBy,
              skip: offset,
              take: limitNum
            }),
            prisma.carpetas.count({ where: carpetasWhere })
          ])

          carpetas = carpetasResult
          totalCarpetas = carpetasCount
        }

        // Calcular estadísticas
        const tiempoBusqueda = Date.now() - startTime
        const totalResultados = totalArchivos + totalCarpetas
        const totalPages = Math.ceil(totalResultados / limitNum)

        // Transformar resultados para la respuesta
        const archivosTransformados = archivos.map(archivo => ({
          ...archivo,
          tamano: archivo.tamano ? Number(archivo.tamano) : null
        }))

        const carpetasTransformadas = carpetas.map(carpeta => ({
          ...carpeta,
          max_tamaño_mb: carpeta.max_tamaño_mb ? Number(carpeta.max_tamaño_mb) : null
        }))

        return reply.send({
          resultados: {
            archivos: archivosTransformados,
            carpetas: carpetasTransformadas
          },
          paginacion: {
            page: pageNum,
            limit: limitNum,
            total_archivos: totalArchivos,
            total_carpetas: totalCarpetas,
            total_resultados: totalResultados,
            total_pages: totalPages
          },
          estadisticas: {
            tiempo_busqueda_ms: tiempoBusqueda,
            consulta_original: query,
            tipo_busqueda
          }
        })

      } catch (error) {
        console.error('Error en búsqueda:', error)
        return reply.status(500).send({
          message: 'Error interno del servidor durante la búsqueda'
        })
      }
    })

    .get('/busqueda/archivos', {
      schema: {
        tags: ['Búsqueda'],
        summary: 'Búsqueda específica de archivos',
        description: 'Realiza una búsqueda específica en archivos con filtros avanzados',
        querystring: z.object({
          query: z.string().min(1, 'La consulta de búsqueda es requerida'),
          extension: z.string().optional(),
          categoria: z.string().optional(),
          estado: z.string().optional(),
          etiquetas: z.string().optional(),
          tamano_min: z.string().optional(),
          tamano_max: z.string().optional(),
          fecha_desde: z.string().optional(),
          fecha_hasta: z.string().optional(),
          proyecto_id: z.string().optional(),
          carpeta_id: z.string().optional(),
          usuario_creador: z.string().optional(),
          page: z.string().optional().default('1'),
          limit: z.string().optional().default('20'),
          sort_by: z.enum(['nombre', 'fecha_creacion', 'tamano', 'relevancia']).optional().default('relevancia'),
          sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
          include_creador: z.string().optional(),
          include_carpeta: z.string().optional(),
          include_proyecto: z.string().optional()
        }),
        response: {
          200: z.object({
            archivos: z.array(z.object({
              id: z.string(),
              nombre_archivo: z.string(),
              extension: z.string().nullable(),
              tamano: z.number().nullable(),
              tipo_mime: z.string().nullable(),
              descripcion: z.string().nullable(),
              categoria: z.string().nullable(),
              estado: z.string().nullable(),
              version: z.string().nullable(),
              carpeta_id: z.number(),
              s3_path: z.string().nullable(),
              etiquetas: z.array(z.string()),
              proyecto_id: z.number().nullable(),
              subido_por: z.number(),
              fecha_creacion: z.date(),
              fecha_ultima_actualizacion: z.date(),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable(),
                correo_electronico: z.string().nullable()
              }).optional(),
              carpeta: z.object({
                id: z.number(),
                nombre: z.string(),
                s3_path: z.string()
              }).optional(),
              proyecto: z.object({
                id: z.number(),
                nombre: z.string()
              }).optional()
            })),
            paginacion: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              total_pages: z.number()
            }),
            estadisticas: z.object({
              tiempo_busqueda_ms: z.number(),
              consulta_original: z.string()
            })
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
        const startTime = Date.now()
        const {
          query,
          extension,
          categoria,
          estado,
          etiquetas,
          tamano_min,
          tamano_max,
          fecha_desde,
          fecha_hasta,
          proyecto_id,
          carpeta_id,
          usuario_creador,
          page = '1',
          limit = '20',
          sort_by = 'relevancia',
          sort_order = 'desc',
          include_creador,
          include_carpeta,
          include_proyecto
        } = request.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const offset = (pageNum - 1) * limitNum

        // Construir condiciones de búsqueda
        const where: any = {
          eliminado: false,
          OR: [
            { nombre_archivo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } }
          ]
        }

        // Aplicar filtros
        if (extension) {
          where.extension = { contains: extension, mode: 'insensitive' }
        }

        if (categoria) {
          where.categoria = { contains: categoria, mode: 'insensitive' }
        }

        if (estado) {
          where.estado = { contains: estado, mode: 'insensitive' }
        }

        if (etiquetas) {
          const etiquetasArray = etiquetas.split(',').map(tag => tag.trim())
          where.etiquetas = { hasSome: etiquetasArray }
        }

        if (tamano_min) {
          where.tamano = { gte: BigInt(parseInt(tamano_min) * 1024 * 1024) }
        }

        if (tamano_max) {
          where.tamano = { ...where.tamano, lte: BigInt(parseInt(tamano_max) * 1024 * 1024) }
        }

        if (fecha_desde) {
          where.fecha_creacion = { gte: new Date(fecha_desde) }
        }

        if (fecha_hasta) {
          where.fecha_creacion = { ...where.fecha_creacion, lte: new Date(fecha_hasta) }
        }

        if (proyecto_id) {
          where.proyecto_id = parseInt(proyecto_id)
        }

        if (carpeta_id) {
          where.carpeta_id = parseInt(carpeta_id)
        }

        if (usuario_creador) {
          where.subido_por = parseInt(usuario_creador)
        }

        // Preparar includes
        const include: any = {}

        if (include_creador === 'true') {
          include.creador = {
            select: {
              id: true,
              nombre_completo: true,
              correo_electronico: true
            }
          }
        }

        if (include_carpeta === 'true') {
          include.carpeta = {
            select: {
              id: true,
              nombre: true,
              s3_path: true
            }
          }
        }

        if (include_proyecto === 'true') {
          include.proyecto = {
            select: {
              id: true,
              nombre: true
            }
          }
        }

        // Determinar ordenamiento
        let orderBy: any = {}

        if (sort_by === 'relevancia') {
          orderBy.fecha_creacion = sort_order
        } else if (sort_by === 'nombre') {
          orderBy.nombre_archivo = sort_order
        } else if (sort_by === 'fecha_creacion') {
          orderBy.fecha_creacion = sort_order
        } else if (sort_by === 'tamano') {
          orderBy.tamano = sort_order
        }

        // Realizar búsqueda
        const [archivos, total] = await Promise.all([
          prisma.documentos.findMany({
            where,
            include,
            orderBy,
            skip: offset,
            take: limitNum
          }),
          prisma.documentos.count({ where })
        ])

        // Transformar resultados
        const archivosTransformados = archivos.map(archivo => ({
          ...archivo,
          tamano: archivo.tamano ? Number(archivo.tamano) : null
        }))

        const tiempoBusqueda = Date.now() - startTime
        const totalPages = Math.ceil(total / limitNum)

        return reply.send({
          archivos: archivosTransformados,
          paginacion: {
            page: pageNum,
            limit: limitNum,
            total,
            total_pages: totalPages
          },
          estadisticas: {
            tiempo_busqueda_ms: tiempoBusqueda,
            consulta_original: query
          }
        })

      } catch (error) {
        console.error('Error en búsqueda de archivos:', error)
        return reply.status(500).send({
          message: 'Error interno del servidor durante la búsqueda de archivos'
        })
      }
    })

    .get('/busqueda/carpetas', {
      schema: {
        tags: ['Búsqueda'],
        summary: 'Búsqueda específica de carpetas',
        description: 'Realiza una búsqueda específica en carpetas con filtros avanzados',
        querystring: z.object({
          query: z.string().min(1, 'La consulta de búsqueda es requerida'),
          carpeta_padre_id: z.string().optional(),
          proyecto_id: z.string().optional(),
          usuario_creador: z.string().optional(),
          activa: z.string().optional(),
          fecha_desde: z.string().optional(),
          fecha_hasta: z.string().optional(),
          page: z.string().optional().default('1'),
          limit: z.string().optional().default('20'),
          sort_by: z.enum(['nombre', 'fecha_creacion', 'relevancia']).optional().default('relevancia'),
          sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
          include_creador: z.string().optional(),
          include_padre: z.string().optional(),
          include_proyecto: z.string().optional()
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
              orden_visualizacion: z.number(),
              max_tamaño_mb: z.number().nullable(),
              tipos_archivo_permitidos: z.array(z.string()),
              permisos_lectura: z.array(z.string()),
              permisos_escritura: z.array(z.string()),
              usuario_creador: z.number(),
              fecha_creacion: z.date(),
              fecha_actualizacion: z.date(),
              activa: z.boolean(),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable(),
                correo_electronico: z.string().nullable()
              }).optional(),
              carpeta_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }).optional(),
              proyecto: z.object({
                id: z.number(),
                nombre: z.string()
              }).optional()
            })),
            paginacion: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              total_pages: z.number()
            }),
            estadisticas: z.object({
              tiempo_busqueda_ms: z.number(),
              consulta_original: z.string()
            })
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
        const startTime = Date.now()
        const {
          query,
          carpeta_padre_id,
          proyecto_id,
          usuario_creador,
          activa,
          fecha_desde,
          fecha_hasta,
          page = '1',
          limit = '20',
          sort_by = 'relevancia',
          sort_order = 'desc',
          include_creador,
          include_padre,
          include_proyecto
        } = request.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const offset = (pageNum - 1) * limitNum

        // Construir condiciones de búsqueda
        const where: any = {
          activa: true,
          OR: [
            { nombre: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } }
          ]
        }

        // Aplicar filtros
        if (carpeta_padre_id) {
          where.carpeta_padre_id = parseInt(carpeta_padre_id)
        }

        if (proyecto_id) {
          where.proyecto_id = parseInt(proyecto_id)
        }

        if (usuario_creador) {
          where.usuario_creador = parseInt(usuario_creador)
        }

        if (activa !== undefined) {
          where.activa = activa === 'true'
        }

        if (fecha_desde) {
          where.fecha_creacion = { gte: new Date(fecha_desde) }
        }

        if (fecha_hasta) {
          where.fecha_creacion = { ...where.fecha_creacion, lte: new Date(fecha_hasta) }
        }

        // Preparar includes
        const include: any = {}

        if (include_creador === 'true') {
          include.creador = {
            select: {
              id: true,
              nombre_completo: true,
              correo_electronico: true
            }
          }
        }

        if (include_padre === 'true') {
          include.carpeta_padre = {
            select: {
              id: true,
              nombre: true
            }
          }
        }

        if (include_proyecto === 'true') {
          include.proyecto = {
            select: {
              id: true,
              nombre: true
            }
          }
        }

        // Determinar ordenamiento
        let orderBy: any = {}

        if (sort_by === 'relevancia') {
          orderBy.fecha_creacion = sort_order
        } else if (sort_by === 'nombre') {
          orderBy.nombre = sort_order
        } else if (sort_by === 'fecha_creacion') {
          orderBy.fecha_creacion = sort_order
        }

        // Realizar búsqueda
        const [carpetas, total] = await Promise.all([
          prisma.carpetas.findMany({
            where,
            include,
            orderBy,
            skip: offset,
            take: limitNum
          }),
          prisma.carpetas.count({ where })
        ])

        // Transformar resultados
        const carpetasTransformadas = carpetas.map(carpeta => ({
          ...carpeta,
          max_tamaño_mb: carpeta.max_tamaño_mb ? Number(carpeta.max_tamaño_mb) : null
        }))

        const tiempoBusqueda = Date.now() - startTime
        const totalPages = Math.ceil(total / limitNum)

        return reply.send({
          carpetas: carpetasTransformadas,
          paginacion: {
            page: pageNum,
            limit: limitNum,
            total,
            total_pages: totalPages
          },
          estadisticas: {
            tiempo_busqueda_ms: tiempoBusqueda,
            consulta_original: query
          }
        })

      } catch (error) {
        console.error('Error en búsqueda de carpetas:', error)
        return reply.status(500).send({
          message: 'Error interno del servidor durante la búsqueda de carpetas'
        })
      }
    })
}

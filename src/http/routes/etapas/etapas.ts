import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

// Esquema Zod para crear etapa
const createEtapaSchema = z.object({
  etapa_tipo_id: z.number().int().min(1, 'ID de tipo de etapa es requerido'),
  
  // Información de la etapa - usando IDs en lugar de strings
  tipo_iniciativa_id: z.number().int().min(1).optional(),
  tipo_obra_id: z.number().int().min(1).optional(),
  region_id: z.number().int().min(1).optional(),
  provincia_id: z.number().int().min(1).optional(),
  comuna_id: z.number().int().min(1).optional(),
  volumen: z.string().optional(),
  
  // Información financiera
  presupuesto_oficial: z.string().max(100, 'Presupuesto oficial debe ser mayor 0').optional(),
  valor_referencia: z.string().max(255).optional(),
  
  // Fechas importantes - usando string que se convertirá a Date
  fecha_llamado_licitacion: z.string().datetime().optional(),
  fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
  fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
  fecha_inicio_concesion: z.string().datetime().optional(),
  plazo_total_concesion: z.string().optional(),
  
  // Información de la adjudicación
  decreto_adjudicacion: z.string().optional(),
  sociedad_concesionaria: z.string().max(255, 'Sociedad concesionaria no puede exceder 255 caracteres').optional(),
  
  // Inspector fiscal asignado
  inspector_fiscal_id: z.number().int().min(1).optional(),
  
  // Usuario creador (requerido)
  usuario_creador: z.number().int().min(1, 'Usuario creador es requerido')
});

// Esquema para actualizar etapa (todos los campos opcionales excepto validaciones)
const updateEtapaSchema = createEtapaSchema.partial().extend({
  activa: z.boolean().optional()
});

// Esquema para parámetros de ruta
const etapaParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser un número válido').transform(Number)
});

// Tipos inferidos de los esquemas
type CreateEtapaBody = z.infer<typeof createEtapaSchema>;
type UpdateEtapaBody = z.infer<typeof updateEtapaSchema>;
type EtapaParams = z.infer<typeof etapaParamsSchema>;

export  async function etapasRoutes(app: FastifyInstance) {
  // Registrar el provider de tipos Zod
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /etapas - Lista de etapas
  server.get('/etapas', async (request, reply) => {
    try {
      const etapas = await prisma.etapas_registro.findMany({
        where: { activa: true },
        include: {
          etapa_tipo: true,
          tipo_iniciativa: true,
          tipo_obra: true,
          region: true,
          provincia: true,
          comuna: true,
          inspector_fiscal: {
            select: {
              id: true,
              correo_electronico: true,
              nombre_completo: true
            }
          },
          usuario_creador_rel: {
            select: {
              id: true,
              correo_electronico: true,
              nombre_completo: true
            }
          }
        },
        orderBy: { fecha_creacion: 'desc' }
      });
  
      return {
        success: true,
        message: 'Lista de etapas obtenida exitosamente',
        data: etapas
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al obtener las etapas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // GET /etapas/:id - Detalle de etapa
  server.get('/etapas/:id', {
    schema: {
      tags: ['Etapas'],
      params: etapaParamsSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            etapa_tipo_id: z.number(),
            tipo_iniciativa_id: z.number().nullable(),
            tipo_obra_id: z.number().nullable(),
            region_id: z.number().nullable(),
            provincia_id: z.number().nullable(),
            comuna_id: z.number().nullable(),
            volumen: z.string().nullable(),
            presupuesto_oficial: z.string().nullable(),
            valor_referencia: z.string().nullable(),
            fecha_llamado_licitacion: z.date().nullable(),
            fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
            fecha_apertura_ofertas_economicas: z.date().nullable(),
            fecha_inicio_concesion: z.date().nullable(),
            plazo_total_concesion: z.string().nullable(),
            decreto_adjudicacion: z.string().nullable(),
            sociedad_concesionaria: z.string().nullable(),
            inspector_fiscal_id: z.number().nullable(),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean(),
            etapa_tipo: z.object({
              id: z.number(),
              nombre: z.string(),
              descripcion: z.string().nullable()
            }),
            tipo_iniciativa: z.object({
              id: z.number(),
              nombre: z.string()
            }).nullable(),
            tipo_obra: z.object({
              id: z.number(),
              nombre: z.string()
            }).nullable(),
            region: z.object({
              id: z.number(),
              nombre: z.string(),
              codigo: z.string()
            }).nullable(),
            provincia: z.object({
              id: z.number(),
              nombre: z.string(),
              codigo: z.string()
            }).nullable(),
            comuna: z.object({
              id: z.number(),
              nombre: z.string(),
              codigo: z.string()
            }).nullable(),
            inspector_fiscal: z.object({
              id: z.number(),
              correo_electronico: z.string().nullable(),
              nombre_completo: z.string().nullable()
            }).nullable(),
            usuario_creador_rel: z.object({
              id: z.number(),
              correo_electronico: z.string().nullable(),
              nombre_completo: z.string().nullable()
            })
          }).optional()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const etapa = await prisma.etapas_registro.findUnique({
        where: { id, activa: true },
        include: {
          etapa_tipo: true,
          tipo_iniciativa: true,
          tipo_obra: true,
          region: true,
          provincia: true,
          comuna: true,
          inspector_fiscal: {
            select: {
              id: true,
              correo_electronico: true,
              nombre_completo: true
            }
          },
          usuario_creador_rel: {
            select: {
              id: true,
              correo_electronico: true,
              nombre_completo: true
            }
          }
        }
      });
  
      if (!etapa) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada'
        };
      }
  
      return {
        success: true,
        message: `Detalle de etapa ${id} obtenido exitosamente`,
        data: etapa
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al obtener el detalle de la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // POST /etapas - Crear nueva etapa
  server.post('/etapas', {
    schema: {
      tags: ['Etapas'],
      body: createEtapaSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            etapa_tipo_id: z.number(),
            tipo_iniciativa_id: z.number().nullable(),
            tipo_obra_id: z.number().nullable(),
            region_id: z.number().nullable(),
            provincia_id: z.number().nullable(),
            comuna_id: z.number().nullable(),
            volumen: z.string().nullable(),
            presupuesto_oficial: z.string().nullable(),
            valor_referencia: z.string().nullable(),
            fecha_llamado_licitacion: z.date().nullable(),
            fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
            fecha_apertura_ofertas_economicas: z.date().nullable(),
            fecha_inicio_concesion: z.date().nullable(),
            plazo_total_concesion: z.string().nullable(),
            decreto_adjudicacion: z.string().nullable(),
            sociedad_concesionaria: z.string().nullable(),
            inspector_fiscal_id: z.number().nullable(),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean()
          })
        })
      }
    }
  }, async (request, reply) => {

    try {
    const body = request.body;
    
    // Preparar los datos para la creación, convirtiendo fechas si están presentes
    const etapaData: any = {
      etapa_tipo_id: body.etapa_tipo_id,
      tipo_iniciativa_id: body.tipo_iniciativa_id,
      tipo_obra_id: body.tipo_obra_id,
      region_id: body.region_id,
      provincia_id: body.provincia_id,
      comuna_id: body.comuna_id,
      volumen: body.volumen,
      presupuesto_oficial: body.presupuesto_oficial,
      valor_referencia: body.valor_referencia,
      decreto_adjudicacion: body.decreto_adjudicacion,
      sociedad_concesionaria: body.sociedad_concesionaria,
      inspector_fiscal_id: body.inspector_fiscal_id,
      usuario_creador: body.usuario_creador,
    };

    // Convertir fechas si están presentes
    if (body.fecha_llamado_licitacion) {
      etapaData.fecha_llamado_licitacion = new Date(body.fecha_llamado_licitacion);
    }
    if (body.fecha_recepcion_ofertas_tecnicas) {
      etapaData.fecha_recepcion_ofertas_tecnicas = new Date(body.fecha_recepcion_ofertas_tecnicas);
    }
    if (body.fecha_apertura_ofertas_economicas) {
      etapaData.fecha_apertura_ofertas_economicas = new Date(body.fecha_apertura_ofertas_economicas);
    }
    if (body.fecha_inicio_concesion) {
      etapaData.fecha_inicio_concesion = new Date(body.fecha_inicio_concesion);
    }
    if (body.plazo_total_concesion) {
      etapaData.plazo_total_concesion = body.plazo_total_concesion;
    }
    
      const nuevaEtapa = await prisma.etapas_registro.create({
        data: etapaData
      });
      
      return {
        success: true,
        message: 'Etapa creada exitosamente',
        data: nuevaEtapa
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al crear la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // PUT /etapas/:id - Actualizar etapa
  server.put('/etapas/:id', {
    schema: {
      tags: ['Etapas'],
      params: etapaParamsSchema,
      body: updateEtapaSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            cambios_aplicados: z.record(z.any())
          })
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    
    try {
      // Preparar los datos para la actualización
      const updateData: any = { ...body };
      
      // Convertir fechas si están presentes
      if (body.fecha_llamado_licitacion) {
        updateData.fecha_llamado_licitacion = new Date(body.fecha_llamado_licitacion);
      }
      if (body.fecha_recepcion_ofertas_tecnicas) {
        updateData.fecha_recepcion_ofertas_tecnicas = new Date(body.fecha_recepcion_ofertas_tecnicas);
      }
      if (body.fecha_apertura_ofertas_economicas) {
        updateData.fecha_apertura_ofertas_economicas = new Date(body.fecha_apertura_ofertas_economicas);
      }
      if (body.fecha_inicio_concesion) {
        updateData.fecha_inicio_concesion = new Date(body.fecha_inicio_concesion);
      }
      
      const etapaActualizada = await prisma.etapas_registro.update({
        where: { id },
        data: updateData
      });
      
      return {
        success: true,
        message: `Etapa ${id} actualizada exitosamente`,
        data: {
          id,
          cambios_aplicados: body
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al actualizar la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // DELETE /etapas/:id - Eliminar etapa (soft delete)
  server.delete('/etapas/:id', {
    schema: {
      tags: ['Etapas'],
      params: etapaParamsSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            eliminada: z.boolean()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const etapaEliminada = await prisma.etapas_registro.update({
        where: { id },
        data: { activa: false }
      });
      
      return {
        success: true,
        message: `Etapa ${id} eliminada exitosamente`,
        data: {
          id,
          eliminada: true
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al eliminar la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });
}
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

// Esquema Zod para crear etapa
const createEtapaSchema = z.object({
  etapa_tipo_id: z.number().int().min(1, 'ID de tipo de etapa es requerido'),
  
  // Información de la etapa
  tipo_iniciativa: z.string().max(20, 'Tipo de iniciativa no puede exceder 20 caracteres'),
  tipo_obra: z.string().max(100, 'Tipo de obra no puede exceder 100 caracteres').optional(),
  region: z.string().max(50, 'Región no puede exceder 50 caracteres').optional(),
  provincia: z.string().max(50, 'Provincia no puede exceder 50 caracteres').optional(),
  comuna: z.string().max(50, 'Comuna no puede exceder 50 caracteres').optional(),
  volumen: z.string().optional(),
  
  // Información financiera
  presupuesto_oficial: z.string().max(100, 'Presupuesto oficial debe ser mayor 0').optional(),
  
  // Fechas importantes - usando string que se convertirá a Date
  fecha_llamado_licitacion: z.string().datetime().optional(),
  fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
  fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
  fecha_inicio_concesion: z.string().datetime().optional(),
  plazo_total_meses: z.number().int().min(0, 'Plazo total debe ser mayor o igual a 0').optional(),
  
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
            tipo_iniciativa: z.string(),
            tipo_obra: z.string().nullable(),
            region: z.string().nullable(),
            provincia: z.string().nullable(),
            comuna: z.string().nullable(),
            volumen: z.string().nullable(),
            presupuesto_oficial: z.string().nullable(),
            fecha_llamado_licitacion: z.date().nullable(),
            fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
            fecha_apertura_ofertas_economicas: z.date().nullable(),
            fecha_inicio_concesion: z.date().nullable(),
            plazo_total_meses: z.number().nullable(),
            decreto_adjudicacion: z.string().nullable(),
            sociedad_concesionaria: z.string().nullable(),
            inspector_fiscal_id: z.number().nullable(),
            usuario_creador: z.number(),
            fecha_creacion: z.date(),
            fecha_actualizacion: z.date(),
            activa: z.boolean()
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
            tipo_iniciativa: z.string(),
            tipo_obra: z.string().nullable(),
            region: z.string().nullable(),
            provincia: z.string().nullable(),
            comuna: z.string().nullable(),
            volumen: z.string().nullable(),
            presupuesto_oficial: z.string().nullable(),
            fecha_llamado_licitacion: z.date().nullable(),
            fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
            fecha_apertura_ofertas_economicas: z.date().nullable(),
            fecha_inicio_concesion: z.date().nullable(),
            plazo_total_meses: z.number().nullable(),
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
    const etapaData = {
      etapa_tipo_id: body.etapa_tipo_id,
      tipo_iniciativa: body.tipo_iniciativa,
      tipo_obra: body.tipo_obra,
      region: body.region,
      provincia: body.provincia,
      comuna: body.comuna,
      volumen: body.volumen,
      presupuesto_oficial: body.presupuesto_oficial,
      fecha_llamado_licitacion: body.fecha_llamado_licitacion,
      fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas,
      fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas,
      fecha_inicio_concesion: body.fecha_inicio_concesion,
      plazo_total_meses: body.plazo_total_meses,
      decreto_adjudicacion: body.decreto_adjudicacion,
      sociedad_concesionaria: body.sociedad_concesionaria,
      inspector_fiscal_id: body.inspector_fiscal_id,
      usuario_creador: body.usuario_creador,
    };
    
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
      // Aquí iría la lógica para actualizar la etapa en la base de datos
      // const etapaActualizada = await prisma.etapas_registro.update({
      //   where: { id },
      //   data: {
      //     ...body,
      //     fecha_llamado_licitacion: body.fecha_llamado_licitacion ? new Date(body.fecha_llamado_licitacion) : undefined,
      //     fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas ? new Date(body.fecha_recepcion_ofertas_tecnicas) : undefined,
      //     fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas ? new Date(body.fecha_apertura_ofertas_economicas) : undefined,
      //     fecha_inicio_concesion: body.fecha_inicio_concesion ? new Date(body.fecha_inicio_concesion) : undefined,
      //   }
      // });
      
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
      // Aquí iría la lógica para hacer soft delete de la etapa
      // const etapaEliminada = await prisma.etapas_registro.update({
      //   where: { id },
      //   data: { activa: false }
      // });
      
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
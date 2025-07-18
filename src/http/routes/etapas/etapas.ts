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
  bip: z.string().optional(),
  
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
  server.get('/etapas', {
    schema: {
      tags: ['Etapas'],
      summary: 'Obtener lista de etapas activas',
      description: 'Retorna todas las etapas activas ordenadas por fecha de creación descendente. Incluye información completa con relaciones (tipo de etapa, iniciativa, obra, ubicación geográfica, inspector fiscal y usuario creador).',
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
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
            bip: z.string().nullable(),
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
          }))
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.string()
        })
      }
    }
  }, async (request, reply) => {
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
      summary: 'Obtener detalle de etapa específica',
      description: 'Obtiene información detallada de una etapa específica por su ID. Solo retorna etapas activas. Incluye todas las relaciones (tipo de etapa, iniciativa, obra, ubicación geográfica, inspector fiscal y usuario creador).',
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
        }),
        404: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.string()
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
      summary: 'Crear nueva etapa',
      description: 'Crea una nueva etapa en el sistema. Requiere como mínimo el tipo de etapa y el usuario creador. Todos los demás campos son opcionales pero permiten almacenar información completa del proyecto de concesión, incluyendo datos financieros, fechas importantes del proceso de licitación y adjudicación, y ubicación geográfica.',
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
              bip: z.string().nullable(),
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
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string()
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
      bip: body.bip,
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
      summary: 'Actualizar etapa existente',
      description: 'Actualiza una etapa existente permitiendo modificar cualquier campo. Todos los campos son opcionales en la actualización, permitiendo actualizaciones parciales. Las fechas se convierten automáticamente al formato Date si se proporcionan como strings datetime.',
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
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string()
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
      summary: 'Eliminar etapa (soft delete)',
      description: 'Elimina una etapa mediante soft delete, marcándola como inactiva en lugar de eliminarla físicamente de la base de datos. Esto permite mantener el historial y la integridad referencial de los datos.',
      params: etapaParamsSchema,
              response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              eliminada: z.boolean()
            })
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string()
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

  // GET /etapas/:proyecto_id/avanzar - Obtener etapa actual y siguiente etapa del proyecto
  server.get('/etapas/:proyecto_id/avanzar', {
    schema: {
      tags: ['Etapas'],
      summary: 'Obtener etapa actual y siguiente etapa del proyecto',
      description: 'Obtiene la información completa de la etapa actual del proyecto y determina cuál sería la siguiente etapa en el flujo. Incluye todos los datos de la etapa actual y la información del tipo de etapa siguiente.',
      params: z.object({
        proyecto_id: z.string().regex(/^\d+$/, 'ID del proyecto debe ser un número válido').transform(Number)
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            siguiente_etapa: z.object({
               id: z.number(),
               nombre: z.string(),
               descripcion: z.string().nullable(),
               color: z.string().nullable(),
               carpetas_iniciales: z.record(z.any()),
               // Campos booleanos que indican qué información requiere esta etapa
               tipo_iniciativa: z.boolean(),
               tipo_obra: z.boolean(),
               region: z.boolean(),
               provincia: z.boolean(),
               comuna: z.boolean(),
               volumen: z.boolean(),
               presupuesto_oficial: z.boolean(),
               valor_referencia: z.boolean(),
               bip: z.boolean(),
               fecha_llamado_licitacion: z.boolean(),
               fecha_recepcion_ofertas_tecnicas: z.boolean(),
               fecha_apertura_ofertas_economicas: z.boolean(),
               fecha_inicio_concesion: z.boolean(),
               plazo_total_concesion: z.boolean(),
               decreto_adjudicacion: z.boolean(),
               sociedad_concesionaria: z.boolean(),
               inspector_fiscal_id: z.boolean()
             }).nullable(),
             etapas_anteriores: z.array(z.object({
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
               bip: z.string().nullable(),
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
                 descripcion: z.string().nullable(),
                 color: z.string().nullable()
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
             })),
             es_ultima_etapa: z.boolean()
          })
        }),
        404: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { proyecto_id } = request.params;
    
    try {
      // Obtener la etapa actual del proyecto con todas sus relaciones
      const etapaActual = await prisma.etapas_registro.findFirst({
        where: { proyecto_id, activa: true },
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

      if (!etapaActual) {
        reply.status(404);
        return {
          success: false,
          message: 'No se encontró una etapa activa para este proyecto'
        };
      }

      // Obtener todas las etapas anteriores del proyecto (excluyendo la actual) ordenadas por fecha de creación
      const etapasAnteriores = await prisma.etapas_registro.findMany({
        where: {
          proyecto_id,
          id: { not: etapaActual.id } // Excluir la etapa actual
        },
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
        orderBy: { fecha_creacion: 'asc' }
      });

      // Unir la etapa actual al inicio del array etapas_anteriores
      const todasLasEtapasAnteriores = [etapaActual, ...etapasAnteriores];

      // Determinar la siguiente etapa basándose en el último etapa_tipo_id usado + 1
      const ultimoEtapaTipoId = Math.max(...todasLasEtapasAnteriores.map(etapa => etapa.etapa_tipo_id));
      const siguienteEtapaTipoId = ultimoEtapaTipoId + 1;
      // Buscar si existe el siguiente tipo de etapa
      const siguienteEtapa = await prisma.etapas_tipo.findUnique({
        where: { id: siguienteEtapaTipoId }
      });
      const esUltimaEtapa = !siguienteEtapa;

      return {
        success: true,
        message: `Información completa del proyecto ${proyecto_id} obtenida exitosamente`,
        data: {
          etapas_anteriores: todasLasEtapasAnteriores,
          siguiente_etapa: siguienteEtapa,
          es_ultima_etapa: esUltimaEtapa
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al obtener la información de la etapa y siguiente etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });
}

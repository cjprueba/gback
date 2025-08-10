import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

// Helper function to transform flat geographical data into deeply nested hierarchical structure
function transformGeographicalData(etapasGeografia: any[]) {
  // Create a map of regions with their provinces and communes
  const regionsMap = new Map();
  
  // Process all geographical data from the unified table
  // Now each record represents a specific commune with its complete hierarchy
  etapasGeografia.forEach(etapaGeo => {
    const { region, provincia, comuna } = etapaGeo;
    
    // Ensure we have all the geographical data
    if (region && provincia && comuna) {
      // Add region if not exists
      if (!regionsMap.has(region.id)) {
        regionsMap.set(region.id, {
          ...region,
          etapas_provincias: []
        });
      }
      
      const regionData = regionsMap.get(region.id);
      
      // Add province if not exists
      let provinciaData = regionData.etapas_provincias.find((p: any) => p.provincia.id === provincia.id);
      if (!provinciaData) {
        provinciaData = {
          provincia: {
            ...provincia,
            etapas_comunas: []
          }
        };
        regionData.etapas_provincias.push(provinciaData);
      }
      
      // Add comuna if not exists
      if (!provinciaData.provincia.etapas_comunas.find((c: any) => c.comuna.id === comuna.id)) {
        provinciaData.provincia.etapas_comunas.push({
          comuna: comuna
        });
      }
    }
  });
  
  // Convert map to array
  return Array.from(regionsMap.values());
}

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
            etapas_regiones: z.array(z.object({
              id: z.number(),
              codigo: z.string(),
              nombre: z.string(),
              nombre_corto: z.string().nullable(),
              etapas_provincias: z.array(z.object({
                provincia: z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string(),
                  region_id: z.number()
                }),
                etapas_comunas: z.array(z.object({
                  comuna: z.object({
                    id: z.number(),
                    nombre: z.string(),
                    provincia_id: z.number(),
                    region_id: z.number()
                  })
                }))
              }))
            })).nullable(),
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
          etapas_geografia: {
            include: {
              region: true,
              provincia: true,
              comuna: true
            }
          },
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
        data: etapas.map(etapa => ({
          ...etapa,
          etapas_regiones: transformGeographicalData(etapa.etapas_geografia)
        }))
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
            etapas_regiones: z.array(z.object({
              id: z.number(),
              codigo: z.string(),
              nombre: z.string(),
              nombre_corto: z.string().nullable(),
              etapas_provincias: z.array(z.object({
                provincia: z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string(),
                  etapas_comunas: z.array(z.object({
                    comuna: z.object({
                      id: z.number(),
                      nombre: z.string()
                    })
                  }))
                })
            })),
            })).nullable(),
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
          etapas_geografia: {
            include: {
              region: true,
              provincia: true,
              comuna: true
            }
          },
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
  
      // Transform geographical data to nested structure
      let etapasRegiones = null;
      let region_id = null;
      let provincia_id = null;
      let comuna_id = null;
      
      if (etapa.etapas_geografia && etapa.etapas_geografia.length > 0) {
        etapasRegiones = transformGeographicalData(etapa.etapas_geografia);
        const firstGeo = etapa.etapas_geografia[0];
        region_id = firstGeo.region?.id || null;
        provincia_id = firstGeo.provincia?.id || null;
        comuna_id = firstGeo.comuna?.id || null;
      }
      
      return {
        success: true,
        message: `Detalle de etapa ${id} obtenido exitosamente`,
        data: {
          id: etapa.id,
          etapa_tipo_id: etapa.etapa_tipo_id,
          tipo_iniciativa_id: etapa.tipo_iniciativa_id,
          tipo_obra_id: etapa.tipo_obra_id,
          region_id,
          provincia_id,
          comuna_id,
          volumen: etapa.volumen,
          presupuesto_oficial: etapa.presupuesto_oficial,
          valor_referencia: etapa.valor_referencia,
          fecha_llamado_licitacion: etapa.fecha_llamado_licitacion,
          fecha_recepcion_ofertas_tecnicas: etapa.fecha_recepcion_ofertas_tecnicas,
          fecha_apertura_ofertas_economicas: etapa.fecha_apertura_ofertas_economicas,
          fecha_inicio_concesion: etapa.fecha_inicio_concesion,
          plazo_total_concesion: etapa.plazo_total_concesion,
          decreto_adjudicacion: etapa.decreto_adjudicacion,
          sociedad_concesionaria: etapa.sociedad_concesionaria,
          inspector_fiscal_id: etapa.inspector_fiscal_id,
          usuario_creador: etapa.usuario_creador,
          fecha_creacion: etapa.fecha_creacion,
          fecha_actualizacion: etapa.fecha_actualizacion,
          activa: etapa.activa,
          etapa_tipo: etapa.etapa_tipo,
          tipo_iniciativa: etapa.tipo_iniciativa,
          tipo_obra: etapa.tipo_obra,
          etapas_regiones: etapasRegiones,
          inspector_fiscal: etapa.inspector_fiscal,
          usuario_creador_rel: etapa.usuario_creador_rel
        }
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
      description: 'Obtiene la información completa de la etapa actual del proyecto y determina cuál sería la siguiente etapa en el flujo. Incluye todos los datos de la etapa actual, la información del tipo de etapa siguiente y las carpetas transversales asociadas.',
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
               inspector_fiscal_id: z.boolean(),
               carpetas_transversales: z.array(z.object({
                 id: z.number(),
                 nombre: z.string(),
                 descripcion: z.string().nullable(),
                 color: z.string(),
                 orden: z.number().nullable(),
                 activa: z.boolean(),
                 estructura_carpetas: z.record(z.any()).nullable()
               }))
             }).nullable(),
             etapas_anteriores: z.array(z.object({
               id: z.number(),
               etapa_tipo_id: z.number(),
               tipo_iniciativa_id: z.number().nullable(),
               tipo_obra_id: z.number().nullable(),
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
               // Deeply nested hierarchical geographical data
               etapas_regiones: z.array(z.object({
                 id: z.number(),
                 codigo: z.string(),
                 nombre: z.string(),
                 nombre_corto: z.string().nullable(),
                 etapas_provincias: z.array(z.object({
                   provincia: z.object({
                     id: z.number(),
                     codigo: z.string(),
                     nombre: z.string(),
                     etapas_comunas: z.array(z.object({
                       comuna: z.object({
                         id: z.number(),
                         nombre: z.string()
                       })
                     }))
                   })
                 }))
               })),
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
          // Include unified geographical data
          etapas_geografia: {
            include: {
              region: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  nombre_corto: true
                }
              },
              provincia: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true
                }
              },
              comuna: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
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
          // Include unified geographical data
          etapas_geografia: {
            include: {
              region: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  nombre_corto: true
                }
              },
              provincia: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true
                }
              },
              comuna: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
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
      // Buscar si existe el siguiente tipo de etapa con sus carpetas transversales
      const siguienteEtapa = await prisma.etapas_tipo.findUnique({
        where: { id: siguienteEtapaTipoId },
        include: {
          carpetas_transversales: {
            where: { activa: true },
            orderBy: { orden: 'asc' }
          }
        }
      });
      const esUltimaEtapa = !siguienteEtapa;

      return {
        success: true,
        message: `Información completa del proyecto ${proyecto_id} obtenida exitosamente`,
        data: {
          etapas_anteriores: todasLasEtapasAnteriores.map(etapa => ({
            ...etapa,
            etapas_regiones: transformGeographicalData(etapa.etapas_geografia)
          })),
          siguiente_etapa: siguienteEtapa ? {
            ...siguienteEtapa,
            carpetas_transversales: siguienteEtapa.carpetas_transversales.map(carpeta => ({
              id: carpeta.id,
              nombre: carpeta.nombre,
              descripcion: carpeta.descripcion,
              color: carpeta.color,
              orden: carpeta.orden,
              activa: carpeta.activa,
              estructura_carpetas: carpeta.estructura_carpetas || {}
            }))
          } : null,
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

  // GET /etapas/orden - Obtener orden actual de etapas
  server.get('/etapas/orden', {
    schema: {
      tags: ['Etapas'],
      summary: 'Obtener orden actual de etapas',
      description: 'Retorna el orden actual de todas las etapas activas, ordenadas por su posición en el flujo. Útil para mostrar la jerarquía y secuencia de etapas en la interfaz de usuario.',
      querystring: z.object({
        proyecto_id: z.string().regex(/^\d+$/, 'ID del proyecto debe ser un número válido').transform(Number).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
            id: z.number(),
            etapa_tipo_id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            orden_actual: z.number(),
            fecha_creacion: z.date(),
            activa: z.boolean()
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
      const { proyecto_id } = request.query;
      
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const etapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              color: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      const etapasConOrden = etapas.map((etapa, index) => ({
        id: etapa.id,
        etapa_tipo_id: etapa.etapa_tipo_id,
        nombre: etapa.etapa_tipo.nombre,
        descripcion: etapa.etapa_tipo.descripcion,
        color: etapa.etapa_tipo.color,
        orden_actual: index + 1,
        fecha_creacion: etapa.fecha_creacion,
        activa: etapa.activa
      }));

      return {
        success: true,
        message: 'Orden de etapas obtenido exitosamente',
        data: etapasConOrden
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al obtener el orden de las etapas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // PUT /etapas/:id/mover - Mover etapa a nueva posición
  server.put('/etapas/:id/mover', {
    schema: {
      tags: ['Etapas'],
      summary: 'Mover etapa a nueva posición',
      description: 'Mueve una etapa específica a una nueva posición en el orden. Permite cambiar la jerarquía de las etapas moviendo una etapa hacia arriba o hacia abajo en la secuencia.',
      params: etapaParamsSchema,
      body: z.object({
        nueva_posicion: z.number().int().min(1, 'Nueva posición debe ser mayor a 0'),
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            posicion_anterior: z.number(),
            nueva_posicion: z.number(),
            etapas_reordenadas: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              orden: z.number()
            }))
          })
        }),
        404: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        400: z.object({
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
    const { nueva_posicion, proyecto_id } = request.body;
    
    try {
      // Verificar que la etapa existe
      const etapa = await prisma.etapas_registro.findUnique({
        where: { id, activa: true },
        include: {
          etapa_tipo: {
            select: {
              nombre: true
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

      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Encontrar la posición actual de la etapa
      const posicionActual = todasLasEtapas.findIndex(etapa => etapa.id === id) + 1;
      
      if (posicionActual === 0) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada en la lista'
        };
      }

      // Validar que la nueva posición es válida
      if (nueva_posicion < 1 || nueva_posicion > todasLasEtapas.length) {
        reply.status(400);
        return {
          success: false,
          message: `Nueva posición debe estar entre 1 y ${todasLasEtapas.length}`
        };
      }

      // Si la posición es la misma, no hacer nada
      if (posicionActual === nueva_posicion) {
        return {
          success: true,
          message: 'La etapa ya está en la posición especificada',
          data: {
            id,
            posicion_anterior: posicionActual,
            nueva_posicion,
            etapas_reordenadas: todasLasEtapas.map((etapa, index) => ({
              id: etapa.id,
              nombre: etapa.etapa_tipo.nombre,
              orden: index + 1
            }))
          }
        };
      }

      // Reordenar las etapas
      const etapasReordenadas = [...todasLasEtapas];
      const etapaAMover = etapasReordenadas.splice(posicionActual - 1, 1)[0];
      etapasReordenadas.splice(nueva_posicion - 1, 0, etapaAMover);

      // Actualizar las fechas de creación para mantener el orden
      for (let i = 0; i < etapasReordenadas.length; i++) {
        const nuevaFecha = new Date();
        nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
        
        await prisma.etapas_registro.update({
          where: { id: etapasReordenadas[i].id },
          data: { fecha_creacion: nuevaFecha }
        });
      }

      return {
        success: true,
        message: `Etapa "${etapa.etapa_tipo.nombre}" movida de posición ${posicionActual} a ${nueva_posicion}`,
        data: {
          id,
          posicion_anterior: posicionActual,
          nueva_posicion,
          etapas_reordenadas: etapasReordenadas.map((etapa, index) => ({
            id: etapa.id,
            nombre: etapa.etapa_tipo.nombre,
            orden: index + 1
          }))
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al mover la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // PUT /etapas/reordenar - Reordenar múltiples etapas
  server.put('/etapas/reordenar', {
    schema: {
      tags: ['Etapas'],
      summary: 'Reordenar múltiples etapas',
      description: 'Reordena múltiples etapas a la vez especificando el nuevo orden. Permite reorganizar completamente la jerarquía de etapas de un proyecto.',
      body: z.object({
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional(),
        etapas: z.array(z.object({
          id: z.number().int().min(1, 'ID de etapa es requerido'),
          nueva_posicion: z.number().int().min(1, 'Nueva posición es requerida')
        })).min(1, 'Debe especificar al menos una etapa')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            etapas_reordenadas: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              orden: z.number()
            })),
            cambios_aplicados: z.number()
          })
        }),
        400: z.object({
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
    const { proyecto_id, etapas } = request.body;
    
    try {
      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Validar que todas las etapas especificadas existen
      const idsEtapas = etapas.map(e => e.id);
      const etapasExistentes = todasLasEtapas.filter(etapa => idsEtapas.includes(etapa.id));
      
      if (etapasExistentes.length !== etapas.length) {
        reply.status(400);
        return {
          success: false,
          message: 'Algunas etapas especificadas no existen'
        };
      }

      // Validar que las posiciones son válidas
      const posicionesValidas = etapas.every(e => e.nueva_posicion >= 1 && e.nueva_posicion <= todasLasEtapas.length);
      if (!posicionesValidas) {
        reply.status(400);
        return {
          success: false,
          message: `Las posiciones deben estar entre 1 y ${todasLasEtapas.length}`
        };
      }

      // Crear un mapa de las nuevas posiciones
      const mapaPosiciones = new Map();
      etapas.forEach(etapa => {
        mapaPosiciones.set(etapa.id, etapa.nueva_posicion);
      });

      // Reordenar las etapas según las nuevas posiciones
      const etapasReordenadas = [...todasLasEtapas].sort((a, b) => {
        const posA = mapaPosiciones.get(a.id) || 999;
        const posB = mapaPosiciones.get(b.id) || 999;
        return posA - posB;
      });

      // Actualizar las fechas de creación para mantener el nuevo orden
      for (let i = 0; i < etapasReordenadas.length; i++) {
        const nuevaFecha = new Date();
        nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
        
        await prisma.etapas_registro.update({
          where: { id: etapasReordenadas[i].id },
          data: { fecha_creacion: nuevaFecha }
        });
      }

      return {
        success: true,
        message: `${etapas.length} etapas reordenadas exitosamente`,
        data: {
          etapas_reordenadas: etapasReordenadas.map((etapa, index) => ({
            id: etapa.id,
            nombre: etapa.etapa_tipo.nombre,
            orden: index + 1
          })),
          cambios_aplicados: etapas.length
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al reordenar las etapas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // POST /etapas/:id/subir - Subir etapa una posición
  server.post('/etapas/:id/subir', {
    schema: {
      tags: ['Etapas'],
      summary: 'Subir etapa una posición',
      description: 'Mueve una etapa hacia arriba una posición en el orden. Si la etapa ya está en la primera posición, no hace nada.',
      params: etapaParamsSchema,
      body: z.object({
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            posicion_anterior: z.number(),
            nueva_posicion: z.number(),
            movida: z.boolean()
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
    const { proyecto_id } = request.body;
    
    try {
      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Encontrar la posición actual de la etapa
      const posicionActual = todasLasEtapas.findIndex(etapa => etapa.id === id) + 1;
      
      if (posicionActual === 0) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada'
        };
      }

      // Si ya está en la primera posición, no hacer nada
      if (posicionActual === 1) {
        return {
          success: true,
          message: 'La etapa ya está en la primera posición',
          data: {
            id,
            posicion_anterior: posicionActual,
            nueva_posicion: posicionActual,
            movida: false
          }
        };
      }

      // Intercambiar con la etapa anterior
      const etapaActual = todasLasEtapas[posicionActual - 1];
      const etapaAnterior = todasLasEtapas[posicionActual - 2];

      // Actualizar las fechas de creación para intercambiar posiciones
      const fechaActual = etapaActual.fecha_creacion;
      const fechaAnterior = etapaAnterior.fecha_creacion;

      await prisma.etapas_registro.update({
        where: { id: etapaActual.id },
        data: { fecha_creacion: fechaAnterior }
      });

      await prisma.etapas_registro.update({
        where: { id: etapaAnterior.id },
        data: { fecha_creacion: fechaActual }
      });

      return {
        success: true,
        message: `Etapa "${etapaActual.etapa_tipo.nombre}" subida de posición ${posicionActual} a ${posicionActual - 1}`,
        data: {
          id,
          posicion_anterior: posicionActual,
          nueva_posicion: posicionActual - 1,
          movida: true
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al subir la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // POST /etapas/:id/bajar - Bajar etapa una posición
  server.post('/etapas/:id/bajar', {
    schema: {
      tags: ['Etapas'],
      summary: 'Bajar etapa una posición',
      description: 'Mueve una etapa hacia abajo una posición en el orden. Si la etapa ya está en la última posición, no hace nada.',
      params: etapaParamsSchema,
      body: z.object({
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            posicion_anterior: z.number(),
            nueva_posicion: z.number(),
            movida: z.boolean()
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
    const { proyecto_id } = request.body;
    
    try {
      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Encontrar la posición actual de la etapa
      const posicionActual = todasLasEtapas.findIndex(etapa => etapa.id === id) + 1;
      
      if (posicionActual === 0) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada'
        };
      }

      // Si ya está en la última posición, no hacer nada
      if (posicionActual === todasLasEtapas.length) {
        return {
          success: true,
          message: 'La etapa ya está en la última posición',
          data: {
            id,
            posicion_anterior: posicionActual,
            nueva_posicion: posicionActual,
            movida: false
          }
        };
      }

      // Intercambiar con la etapa siguiente
      const etapaActual = todasLasEtapas[posicionActual - 1];
      const etapaSiguiente = todasLasEtapas[posicionActual];

      // Actualizar las fechas de creación para intercambiar posiciones
      const fechaActual = etapaActual.fecha_creacion;
      const fechaSiguiente = etapaSiguiente.fecha_creacion;

      await prisma.etapas_registro.update({
        where: { id: etapaActual.id },
        data: { fecha_creacion: fechaSiguiente }
      });

      await prisma.etapas_registro.update({
        where: { id: etapaSiguiente.id },
        data: { fecha_creacion: fechaActual }
      });

      return {
        success: true,
        message: `Etapa "${etapaActual.etapa_tipo.nombre}" bajada de posición ${posicionActual} a ${posicionActual + 1}`,
        data: {
          id,
          posicion_anterior: posicionActual,
          nueva_posicion: posicionActual + 1,
          movida: true
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al bajar la etapa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // POST /etapas/:id/ir-primero - Mover etapa al primer lugar
  server.post('/etapas/:id/ir-primero', {
    schema: {
      tags: ['Etapas'],
      summary: 'Mover etapa al primer lugar',
      description: 'Mueve una etapa específica al primer lugar en el orden, desplazando todas las demás etapas hacia abajo.',
      params: etapaParamsSchema,
      body: z.object({
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            posicion_anterior: z.number(),
            nueva_posicion: z.number(),
            etapas_reordenadas: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              orden: z.number()
            }))
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
    const { proyecto_id } = request.body;
    
    try {
      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Encontrar la posición actual de la etapa
      const posicionActual = todasLasEtapas.findIndex(etapa => etapa.id === id) + 1;
      
      if (posicionActual === 0) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada'
        };
      }

      // Si ya está en la primera posición, no hacer nada
      if (posicionActual === 1) {
        return {
          success: true,
          message: 'La etapa ya está en la primera posición',
          data: {
            id,
            posicion_anterior: posicionActual,
            nueva_posicion: posicionActual,
            etapas_reordenadas: todasLasEtapas.map((etapa, index) => ({
              id: etapa.id,
              nombre: etapa.etapa_tipo.nombre,
              orden: index + 1
            }))
          }
        };
      }

      // Mover la etapa al primer lugar
      const etapaAMover = todasLasEtapas.splice(posicionActual - 1, 1)[0];
      todasLasEtapas.unshift(etapaAMover);

      // Actualizar las fechas de creación para mantener el nuevo orden
      for (let i = 0; i < todasLasEtapas.length; i++) {
        const nuevaFecha = new Date();
        nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
        
        await prisma.etapas_registro.update({
          where: { id: todasLasEtapas[i].id },
          data: { fecha_creacion: nuevaFecha }
        });
      }

      return {
        success: true,
        message: `Etapa "${etapaAMover.etapa_tipo.nombre}" movida al primer lugar`,
        data: {
          id,
          posicion_anterior: posicionActual,
          nueva_posicion: 1,
          etapas_reordenadas: todasLasEtapas.map((etapa, index) => ({
            id: etapa.id,
            nombre: etapa.etapa_tipo.nombre,
            orden: index + 1
          }))
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al mover la etapa al primer lugar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });

  // POST /etapas/:id/ir-ultimo - Mover etapa al último lugar
  server.post('/etapas/:id/ir-ultimo', {
    schema: {
      tags: ['Etapas'],
      summary: 'Mover etapa al último lugar',
      description: 'Mueve una etapa específica al último lugar en el orden, desplazando todas las demás etapas hacia arriba.',
      params: etapaParamsSchema,
      body: z.object({
        proyecto_id: z.number().int().min(1, 'ID del proyecto es requerido').optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            posicion_anterior: z.number(),
            nueva_posicion: z.number(),
            etapas_reordenadas: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              orden: z.number()
            }))
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
    const { proyecto_id } = request.body;
    
    try {
      // Obtener todas las etapas del proyecto (o todas si no se especifica proyecto)
      let whereClause: any = { activa: true };
      if (proyecto_id) {
        whereClause.proyecto_id = proyecto_id;
      }

      const todasLasEtapas = await prisma.etapas_registro.findMany({
        where: whereClause,
        include: {
          etapa_tipo: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fecha_creacion: 'asc' }
      });

      // Encontrar la posición actual de la etapa
      const posicionActual = todasLasEtapas.findIndex(etapa => etapa.id === id) + 1;
      
      if (posicionActual === 0) {
        reply.status(404);
        return {
          success: false,
          message: 'Etapa no encontrada'
        };
      }

      // Si ya está en la última posición, no hacer nada
      if (posicionActual === todasLasEtapas.length) {
        return {
          success: true,
          message: 'La etapa ya está en la última posición',
          data: {
            id,
            posicion_anterior: posicionActual,
            nueva_posicion: posicionActual,
            etapas_reordenadas: todasLasEtapas.map((etapa, index) => ({
              id: etapa.id,
              nombre: etapa.etapa_tipo.nombre,
              orden: index + 1
            }))
          }
        };
      }

      // Mover la etapa al último lugar
      const etapaAMover = todasLasEtapas.splice(posicionActual - 1, 1)[0];
      todasLasEtapas.push(etapaAMover);

      // Actualizar las fechas de creación para mantener el nuevo orden
      for (let i = 0; i < todasLasEtapas.length; i++) {
        const nuevaFecha = new Date();
        nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
        
        await prisma.etapas_registro.update({
          where: { id: todasLasEtapas[i].id },
          data: { fecha_creacion: nuevaFecha }
        });
      }

      return {
        success: true,
        message: `Etapa "${etapaAMover.etapa_tipo.nombre}" movida al último lugar`,
        data: {
          id,
          posicion_anterior: posicionActual,
          nueva_posicion: todasLasEtapas.length,
          etapas_reordenadas: todasLasEtapas.map((etapa, index) => ({
            id: etapa.id,
            nombre: etapa.etapa_tipo.nombre,
            orden: index + 1
          }))
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        message: 'Error al mover la etapa al último lugar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  });
}

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

// Esquema Zod para crear etapa tipo
const createEtapaTipoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un código hexadecimal válido (ej: #3498DB)').optional(),
  carpetas_iniciales: z.record(z.any()).optional().default({}),
  
  // Campos booleanos para configurar qué información se requiere
  tipo_iniciativa: z.boolean().default(true),
  tipo_obra: z.boolean().default(true),
  region: z.boolean().default(true),
  provincia: z.boolean().default(true),
  comuna: z.boolean().default(true),
  volumen: z.boolean().default(true),
  presupuesto_oficial: z.boolean().default(true),
  bip: z.boolean().default(true),
  fecha_llamado_licitacion: z.boolean().default(true),
  fecha_recepcion_ofertas_tecnicas: z.boolean().default(true),
  fecha_apertura_ofertas_economicas: z.boolean().default(true),
  fecha_inicio_concesion: z.boolean().default(true),
  plazo_total_concesion: z.boolean().default(true),
  decreto_adjudicacion: z.boolean().default(true),
  sociedad_concesionaria: z.boolean().default(true),
  inspector_fiscal_id: z.boolean().default(true)
});

// Esquema para actualizar etapa tipo
const updateEtapaTipoSchema = createEtapaTipoSchema.partial();

// Esquema para parámetros de ruta
const etapaTipoParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser un número válido').transform(Number)
});

// Tipos inferidos de los esquemas
type CreateEtapaTipoBody = z.infer<typeof createEtapaTipoSchema>;
type UpdateEtapaTipoBody = z.infer<typeof updateEtapaTipoSchema>;
type EtapaTipoParams = z.infer<typeof etapaTipoParamsSchema>;

export async function etapasTipoRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /etapas-tipo - Lista de tipos de etapa
  server.get('/etapas-tipo', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Obtener lista de tipos de etapa',
      description: 'Retorna una lista completa de todos los tipos de etapa disponibles en el sistema. Cada tipo de etapa define qué campos son requeridos para las etapas de un proyecto.',
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            carpetas_iniciales: z.record(z.any())
          }))
        })
      }
    }
  }, async () => {
    const etapasTipo = await prisma.etapas_tipo.findMany();
    
    return {
      success: true,
      message: 'Lista de tipos de etapa obtenida exitosamente',
      data: etapasTipo
    };
  });

  // GET /etapas-tipo-obra - Lista de tipos de etapa con sus tipos de obra asociados
  /*server.get('/etapas-tipo-obra', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Obtener tipos de etapa con sus tipos de obra asociados',
      description: 'Retorna una lista de tipos de etapa incluyendo los tipos de obra que están asociados a cada uno. Esta información es útil para mostrar las relaciones entre etapas y tipos de obra en la interfaz de usuario.',
      querystring: z.object({
        etapa_tipo_id: z.string().regex(/^\d+$/, 'Etapa tipo ID debe ser un número válido').transform(Number).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            carpetas_iniciales: z.record(z.any()),
            tipos_obra: z.array(z.object({
              id: z.number(),
              nombre: z.string()
            }))
          }))
        })
      }
    }
  }, async (request) => {
    const { etapa_tipo_id } = request.query;
    
    const whereClause = etapa_tipo_id ? { id: etapa_tipo_id } : {};
    
    const etapasTipo = await prisma.etapas_tipo.findMany({
      where: whereClause,
      include: {
        etapas_tipo_obras: {
          include: {
            tipo_obra: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });
    
    // Transform the data to match the expected response format
    const etapasTipoConObras = etapasTipo.map(etapa => ({
      id: etapa.id,
      nombre: etapa.nombre,
      descripcion: etapa.descripcion,
      color: (etapa as any).color || null,
      carpetas_iniciales: etapa.carpetas_iniciales || {},
      tipos_obra: etapa.etapas_tipo_obras.map(etapaTipoObra => ({
        id: etapaTipoObra.tipo_obra.id,
        nombre: etapaTipoObra.tipo_obra.nombre
      }))
    }));
    
    return {
      success: true,
      message: etapa_tipo_id 
        ? `Tipo de etapa ${etapa_tipo_id} con sus tipos de obra obtenido exitosamente`
        : 'Lista de tipos de etapa con sus tipos de obra obtenida exitosamente',
      data: etapasTipoConObras
    };
  });*/

  // POST /etapas-tipo - Crear nuevo tipo de etapa
  server.post('/etapas-tipo', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Crear nuevo tipo de etapa',
      description: 'Crea un nuevo tipo de etapa en el sistema. Un tipo de etapa define qué campos son requeridos para las etapas de un proyecto, incluyendo información geográfica, financiera, fechas importantes y datos de adjudicación.',
      body: createEtapaTipoSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            carpetas_iniciales: z.record(z.any())
          })
        })
      }
    }
  }, async (request, reply) => {
    const body = request.body;
    
    // Ensure required fields are present
    const etapaTipoData = {
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      color: body.color || null,
      carpetas_iniciales: body.carpetas_iniciales || {},
      tipo_iniciativa: body.tipo_iniciativa,
      tipo_obra: body.tipo_obra,
      region: body.region,
      provincia: body.provincia,
      comuna: body.comuna,
      volumen: body.volumen,
      presupuesto_oficial: body.presupuesto_oficial,
      bip: body.bip,
      fecha_llamado_licitacion: body.fecha_llamado_licitacion,
      fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas,
      fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas,
      fecha_inicio_concesion: body.fecha_inicio_concesion,
      plazo_total_concesion: body.plazo_total_concesion,
      decreto_adjudicacion: body.decreto_adjudicacion,
      sociedad_concesionaria: body.sociedad_concesionaria,
      inspector_fiscal_id: body.inspector_fiscal_id
    };
    
    const nuevaEtapaTipo = await prisma.etapas_tipo.create({
      data: etapaTipoData
    });
    
    return {
      success: true,
      message: 'Tipo de etapa creado exitosamente',
      data: nuevaEtapaTipo
    };
  });

  // PUT /etapas-tipo/:id - Actualizar tipo de etapa
  server.put('/etapas-tipo/:id', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Actualizar tipo de etapa existente',
      description: 'Actualiza un tipo de etapa existente. Permite modificar el nombre, descripción, color, carpetas iniciales y los campos requeridos para las etapas de este tipo.',
      params: etapaTipoParamsSchema,
      body: updateEtapaTipoSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            carpetas_iniciales: z.record(z.any())
          })
        })
      }
    }
  }, async (request) => {
    const { id } = request.params;
    const body = request.body;
    
    const etapaTipoActualizada = await prisma.etapas_tipo.update({
      where: { id },
      data: body
    });
    
    return {
      success: true,
      message: 'Tipo de etapa actualizado exitosamente',
      data: etapaTipoActualizada
    };
  });

  // GET /etapas-tipo/etapa/:etapaId - Obtener tipo de etapa por etapa ID
  server.get('/etapas-tipo/etapa/:etapaId', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Obtener tipo de etapa por ID de etapa',
      description: 'Retorna la información completa del tipo de etapa asociado a una etapa específica. Incluye todos los campos de configuración que definen qué información es requerida para este tipo de etapa, así como las carpetas transversales asociadas.',
      params: z.object({
        etapaId: z.string().regex(/^\d+$/, 'Etapa ID debe ser un número válido').transform(Number)
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            color: z.string().nullable(),
            carpetas_iniciales: z.record(z.any()),
            tipo_iniciativa: z.boolean(),
            tipo_obra: z.boolean(),
            bip: z.boolean(),
            region: z.boolean(),
            provincia: z.boolean(),
            comuna: z.boolean(),
            volumen: z.boolean(),
            presupuesto_oficial: z.boolean(),
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
          })
        }),
        404: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request) => {
    const { etapaId } = request.params;
    
    const etapa = await prisma.etapas_tipo.findUnique({
      where: { id: etapaId },
      include: {
        carpetas_transversales: {
          where: { activa: true },
          orderBy: { orden: 'asc' }
        }
      }
    });
    
    if (!etapa) {
      return {
        success: false,
        message: 'Etapa no encontrada'
      };
    }
    
    return {
      success: true,
      message: 'Tipo de etapa obtenido exitosamente',
      data: {
        id: etapa.id,
        nombre: etapa.nombre,
        descripcion: etapa.descripcion,
        color: etapa.color || null,
        carpetas_iniciales: etapa.carpetas_iniciales || {},
        tipo_iniciativa: etapa.tipo_iniciativa,
        tipo_obra: etapa.tipo_obra,
        bip: etapa.bip,
        region: etapa.region,
        provincia: etapa.provincia,
        comuna: etapa.comuna,
        volumen: etapa.volumen,
        presupuesto_oficial: etapa.presupuesto_oficial,
        fecha_llamado_licitacion: etapa.fecha_llamado_licitacion,
        fecha_recepcion_ofertas_tecnicas: etapa.fecha_recepcion_ofertas_tecnicas,
        fecha_apertura_ofertas_economicas: etapa.fecha_apertura_ofertas_economicas,
        fecha_inicio_concesion: etapa.fecha_inicio_concesion,
        plazo_total_concesion: etapa.plazo_total_concesion,
        decreto_adjudicacion: etapa.decreto_adjudicacion,
        sociedad_concesionaria: etapa.sociedad_concesionaria,
        inspector_fiscal_id: etapa.inspector_fiscal_id,
        carpetas_transversales: etapa.carpetas_transversales.map(carpeta => ({
          id: carpeta.id,
          nombre: carpeta.nombre,
          descripcion: carpeta.descripcion,
          color: carpeta.color,
          orden: carpeta.orden,
          activa: carpeta.activa,
          estructura_carpetas: carpeta.estructura_carpetas || {}
        }))
      }
    };
  });

  // DELETE /etapas-tipo/:id - Eliminar tipo de etapa
  server.delete('/etapas-tipo/:id', {
    schema: {
      tags: ['Etapas Tipo'],
      summary: 'Eliminar tipo de etapa',
      description: 'Elimina permanentemente un tipo de etapa del sistema. Esta operación no se puede deshacer y eliminará todas las referencias a este tipo de etapa.',
      params: etapaTipoParamsSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            eliminado: z.boolean()
          })
        })
      }
    }
  }, async (request) => {
    const { id } = request.params;
    
    await prisma.etapas_tipo.delete({
      where: { id }
    });
    
    return {
      success: true,
      message: 'Tipo de etapa eliminado exitosamente',
      data: {
        id,
        eliminado: true
      }
    };
  });
}
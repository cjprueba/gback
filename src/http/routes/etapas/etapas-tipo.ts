import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

// Esquema Zod para crear etapa tipo
const createEtapaTipoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres'),
  descripcion: z.string().optional(),
  
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
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable()
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

  server.get('/etapas-tipo-obra', {
    schema: {
      tags: ['Etapas Tipo'],
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable(),
            tipos_obra: z.array(z.object({
              id: z.number(),
              nombre: z.string()
            }))
          }))
        })
      }
    }
  }, async () => {
    const etapasTipo = await prisma.etapas_tipo.findMany({
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
      tipos_obra: etapa.etapas_tipo_obras.map(etapaTipoObra => ({
        id: etapaTipoObra.tipo_obra.id,
        nombre: etapaTipoObra.tipo_obra.nombre
      }))
    }));
    
    return {
      success: true,
      message: 'Lista de tipos de etapa con sus tipos de obra obtenida exitosamente',
      data: etapasTipoConObras
    };
  });

  // POST /etapas-tipo - Crear nuevo tipo de etapa
  server.post('/etapas-tipo', {
    schema: {
      tags: ['Etapas Tipo'],
      body: createEtapaTipoSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable()
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
      params: etapaTipoParamsSchema,
      body: updateEtapaTipoSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            id: z.number(),
            nombre: z.string(),
            descripcion: z.string().nullable()
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
            inspector_fiscal_id: z.boolean()
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
    
    const etapa = await prisma.etapas_registro.findUnique({
      where: { id: etapaId },
      include: {
        etapa_tipo: true
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
        id: etapa.etapa_tipo.id,
        nombre: etapa.etapa_tipo.nombre,
        descripcion: etapa.etapa_tipo.descripcion,
        tipo_iniciativa: etapa.etapa_tipo.tipo_iniciativa,
        tipo_obra: etapa.etapa_tipo.tipo_obra,
        bip: etapa.etapa_tipo.bip,
        region: etapa.etapa_tipo.region,
        provincia: etapa.etapa_tipo.provincia,
        comuna: etapa.etapa_tipo.comuna,
        volumen: etapa.etapa_tipo.volumen,
        presupuesto_oficial: etapa.etapa_tipo.presupuesto_oficial,
        fecha_llamado_licitacion: etapa.etapa_tipo.fecha_llamado_licitacion,
        fecha_recepcion_ofertas_tecnicas: etapa.etapa_tipo.fecha_recepcion_ofertas_tecnicas,
        fecha_apertura_ofertas_economicas: etapa.etapa_tipo.fecha_apertura_ofertas_economicas,
        fecha_inicio_concesion: etapa.etapa_tipo.fecha_inicio_concesion,
        plazo_total_concesion: etapa.etapa_tipo.plazo_total_concesion,
        decreto_adjudicacion: etapa.etapa_tipo.decreto_adjudicacion,
        sociedad_concesionaria: etapa.etapa_tipo.sociedad_concesionaria,
        inspector_fiscal_id: etapa.etapa_tipo.inspector_fiscal_id
      }
    };
  });

  // DELETE /etapas-tipo/:id - Eliminar tipo de etapa
  server.delete('/etapas-tipo/:id', {
    schema: {
      tags: ['Etapas Tipo'],
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
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
  fecha_llamado_licitacion: z.boolean().default(true),
  fecha_recepcion_ofertas_tecnicas: z.boolean().default(true),
  fecha_apertura_ofertas_economicas: z.boolean().default(true),
  fecha_inicio_concesion: z.boolean().default(true),
  plazo_total_meses: z.boolean().default(true),
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
      fecha_llamado_licitacion: body.fecha_llamado_licitacion,
      fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas,
      fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas,
      fecha_inicio_concesion: body.fecha_inicio_concesion,
      plazo_total_meses: body.plazo_total_meses,
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
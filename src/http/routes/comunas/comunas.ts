import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';

export  async function comunaRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all comunas
    .get('/comunas', {
      schema: {
        tags: ['Comunas'],
        summary: 'Obtener todas las comunas',
        description: 'Retorna una lista de todas las comunas disponibles. Puede filtrar por región o provincia usando los parámetros region_id y provincia_id',
        querystring: z.object({
          region_id: z.string().regex(/^\d+$/).transform(Number).optional(),
          provincia_id: z.string().regex(/^\d+$/).transform(Number).optional()
        }),
        response: {
          200: z.array(z.object({
            id: z.number(),
            nombre: z.string(),
            provincia_id: z.number(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          }))
        }
      }
    }, async (request) => {
      const { region_id, provincia_id } = request.query;
      
      const whereClause: any = {};
      
      if (region_id) {
        whereClause.region_id = region_id;
      }
      
      if (provincia_id) {
        whereClause.provincia_id = provincia_id;
      }
      
      return prisma.comunas.findMany({
        where: whereClause
      })
    })

    // Get comuna by id
    .get('/comunas/:id', {
      schema: {
        tags: ['Comunas'],
        summary: 'Obtener comuna por ID',
        description: 'Retorna los detalles de una comuna específica basada en su ID',
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          200: z.object({
            id: z.number(),
            nombre: z.string(),
            provincia_id: z.number(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          }).nullable()
        }
      }
    }, async (request) => {
      return prisma.comunas.findUnique({
        where: { id: request.params.id }
      })
    })

    
}

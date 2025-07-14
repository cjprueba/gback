import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';

export  async function provinciaRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all provincias
    .get('/provincias', {
      schema: {
        tags: ['Provincias'],
        summary: 'Obtener todas las provincias',
        description: 'Retorna una lista de todas las provincias disponibles. Puede filtrar por región usando el parámetro region_id',
        querystring: z.object({
          region_id: z.string().regex(/^\d+$/).transform(Number).optional()
        }),
        response: {
          200: z.array(z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          }))
        }
      }
    }, async (request) => {
      const { region_id } = request.query;
      
      const whereClause = region_id ? { region_id } : {};
      
      return prisma.provincias.findMany({
        where: whereClause
      })
    })

    // Get provincia by id
    .get('/provincias/:id', {
      schema: {
        tags: ['Provincias'],
        summary: 'Obtener provincia por ID',
        description: 'Retorna los detalles de una provincia específica basada en su ID',
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          }).nullable()
        }
      }
    }, async (request) => {
      return prisma.provincias.findUnique({
        where: { id: request.params.id }
      })
    })

    
}
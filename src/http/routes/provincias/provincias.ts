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
    }, async () => {
      return prisma.provincias.findMany()
    })

    // Get provincia by id
    .get('/provincias/:id', {
      schema: {
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
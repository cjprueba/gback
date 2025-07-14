import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';

export  async function regionesRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all regiones
    .get('/regiones', {
      schema: {
        tags: ['Regiones'],
        summary: 'Obtener todas las regiones',
        description: 'Retorna una lista de todas las regiones disponibles en el sistema',
        response: {
          200: z.array(z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            activa: z.boolean(),
            created_at: z.date()
          }))
        }
      }
    }, async () => {
      return prisma.regiones.findMany()
    })

    // Get region by id
    .get('/regiones/:id', {
      schema: {
        tags: ['Regiones'],
        summary: 'Obtener región por ID',
        description: 'Retorna los detalles de una región específica basada en su ID',
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            activa: z.boolean(),
            created_at: z.date()
          }).nullable()
        }
      }
    }, async (request) => {
      return prisma.regiones.findUnique({
        where: { id: request.params.id }
      })
    })

}

import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';


export async function tiposObraRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all tipos_obras
    .get('/tipos_obras', {
      schema: {
        tags: ['Tipos de Obras'],
        response: {
          200: z.array(z.object({
            id: z.number(),
            nombre: z.string()
          }))
        }
      }
    }, async () => {
      return prisma.tipos_obras.findMany()
    })
}
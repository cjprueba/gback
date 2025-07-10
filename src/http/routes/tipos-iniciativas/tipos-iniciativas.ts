import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';


export async function tiposIniciativas(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all tipos_iniciativas
    .get('/tipos_iniciativas', {
      schema: {
        tags: ['Tipos Iniciativas'],
        response: {
          200: z.array(z.object({
            id: z.number(),
            nombre: z.string()
          }))
        }
      }
    }, async () => {
      return prisma.tipos_iniciativas.findMany()
    })
}
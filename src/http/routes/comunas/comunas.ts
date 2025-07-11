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
        response: {
          200: z.array(z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            provincia_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          }))
        }
      }
    }, async () => {
      return prisma.comunas.findMany()
    })

    // Get comuna by id
    .get('/comunas/:id', {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            provincia_id: z.number(),
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

    // Create new comuna
    .post('/comunas', {
      schema: {
        body: z.object({
          codigo: z.string().min(1),
          nombre: z.string().min(1),
          provincia_id: z.number(),
          activa: z.boolean().optional().default(true)
        }),
        response: {
          201: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            provincia_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.comunas.create({
        data: request.body
      })
    })

    // Update comuna
    .put('/comunas/:id', {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        body: z.object({
          codigo: z.string().min(1).optional(),
          nombre: z.string().min(1).optional(),
          provincia_id: z.number().optional(),
          activa: z.boolean().optional()
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            provincia_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.comunas.update({
        where: { id: request.params.id },
        data: request.body
      })
    })

    // Delete comuna
    .delete('/comunas/:id', {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          204: z.void()
        }
      }
    }, async (request) => {
      await prisma.comunas.delete({
        where: { id: request.params.id }
      })
      return { statusCode: 204 }
    })
}
export  async function provinciaRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    // Get all provincias
    .get('/provincias', {
      schema: {
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

    // Create new provincia
    .post('/provincias', {
      schema: {
        body: z.object({
          codigo: z.string().min(1),
          nombre: z.string().min(1),
          region_id: z.number(),
          activa: z.boolean().optional().default(true)
        }),
        response: {
          201: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.provincias.create({
        data: request.body
      })
    })

    // Update provincia
    .put('/provincias/:id', {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        body: z.object({
          codigo: z.string().min(1).optional(),
          nombre: z.string().min(1).optional(),
          region_id: z.number().optional(),
          activa: z.boolean().optional()
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            region_id: z.number(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.provincias.update({
        where: { id: request.params.id },
        data: request.body
      })
    })

    // Delete provincia
    .delete('/provincias/:id', {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          204: z.void()
        }
      }
    }, async (request) => {
      await prisma.provincias.delete({
        where: { id: request.params.id }
      })
      return { statusCode: 204 }
    })
}
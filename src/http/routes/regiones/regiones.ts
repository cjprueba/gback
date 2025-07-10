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

    // Create new region
    .post('/regiones', {
      schema: {
        tags: ['Regiones'],
        body: z.object({
          codigo: z.string().min(1),
          nombre: z.string().min(1),
          activa: z.boolean().optional().default(true)
        }),
        response: {
          201: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.regiones.create({
        data: request.body
      })
    })

    // Update region
    .put('/regiones/:id', {
      schema: {
        tags: ['Regiones'],
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        body: z.object({
          codigo: z.string().min(1).optional(),
          nombre: z.string().min(1).optional(),
          activa: z.boolean().optional()
        }),
        response: {
          200: z.object({
            id: z.number(),
            codigo: z.string(),
            nombre: z.string(),
            activa: z.boolean(),
            created_at: z.date()
          })
        }
      }
    }, async (request) => {
      return prisma.regiones.update({
        where: { id: request.params.id },
        data: request.body
      })
    })

    // Delete region
    .delete('/regiones/:id', {
      schema: {
        tags: ['Regiones'],
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number)
        }),
        response: {
          204: z.void()
        }
      }
    }, async (request) => {
      await prisma.regiones.delete({
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
        tags: ['Regiones'],
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
        tags: ['Regiones'],
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
        tags: ['Regiones'],
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
        tags: ['Regiones'],
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
        tags: ['Regiones'],
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
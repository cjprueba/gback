import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function createDivision(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/division',
      {
        schema: {
          tags: ['Divisiones'],
          summary: 'Create a new division',
          body: z.object({
            nombre: z.string().min(1).max(100),
            descripcion: z.string().optional(),
            activa: z.boolean().optional().default(true)
          }),
          response: {
            201: z.object({
              message: z.string(),
              division: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                activa: z.boolean()
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { nombre, descripcion, activa } = request.body;

        // Create the new division
        const division = await prisma.divisiones.create({
          data: {
            nombre,
            descripcion,
            activa
          }
        });

        return reply.status(201).send({
          message: 'Division created successfully',
          division: {
            id: division.id,
            nombre: division.nombre,
            descripcion: division.descripcion,
            activa: division.activa
          }
        });
      }
    );
}
import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function createDepartamento(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/departamento',
      {
        schema: {
          tags: ['Departamentos'],
          summary: 'Create a new departamento',
          body: z.object({
            nombre: z.string().min(1).max(100),
            descripcion: z.string().optional(),
            division_id: z.number().int().positive(),
            activo: z.boolean().optional().default(true)
          }),
          response: {
            201: z.object({
              message: z.string(),
              departamento: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                division_id: z.number(),
                activo: z.boolean()
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { nombre, descripcion, division_id, activo } = request.body;

        // Verify division exists
        const division = await prisma.divisiones.findUnique({
          where: { id: division_id }
        });

        if (!division) {
          throw new BadRequestError('Division does not exist');
        }

        // Create the new departamento
        const departamento = await prisma.departamentos.create({
          data: {
            nombre,
            descripcion,
            division_id,
            activo
          }
        });

        return reply.status(201).send({
          message: 'Departamento created successfully',
          departamento: {
            id: departamento.id,
            nombre: departamento.nombre,
            descripcion: departamento.descripcion,
            division_id: departamento.division_id,
            activo: departamento.activo
          }
        });
      }
    );
}
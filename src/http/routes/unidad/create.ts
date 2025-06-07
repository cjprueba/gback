import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function createUnidad(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/unidad',
      {
        schema: {
          tags: ['Unidades'],
          summary: 'Create a new unidad',
          body: z.object({
            nombre: z.string().min(1).max(100),
            descripcion: z.string().optional(),
            departamento_id: z.number().int().positive().optional(),
            division_id: z.number().int().positive().optional(),
            activa: z.boolean().optional().default(true)
          }),
          response: {
            201: z.object({
              message: z.string(),
              unidad: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                departamento_id: z.number().nullable(),
                division_id: z.number().nullable(),
                activa: z.boolean()
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { nombre, descripcion, departamento_id, division_id, activa } = request.body;

        // Verify at least one parent reference exists
        if (!departamento_id && !division_id) {
          throw new BadRequestError('Unidad must belong to either a departamento or division');
        }

        // Verify departamento exists if provided
        if (departamento_id) {
          const departamento = await prisma.departamentos.findUnique({
            where: { id: departamento_id }
          });
          if (!departamento) {
            throw new BadRequestError('Departamento does not exist');
          }
        }

        // Verify division exists if provided
        if (division_id) {
          const division = await prisma.divisiones.findUnique({
            where: { id: division_id }
          });
          if (!division) {
            throw new BadRequestError('Division does not exist');
          }
        }

        // Create the new unidad
        const unidad = await prisma.unidades.create({
          data: {
            nombre,
            descripcion,
            departamento_id,
            division_id,
            activa
          }
        });

        return reply.status(201).send({
          message: 'Unidad created successfully',
          unidad: {
            id: unidad.id,
            nombre: unidad.nombre,
            descripcion: unidad.descripcion,
            departamento_id: unidad.departamento_id,
            division_id: unidad.division_id,
            activa: unidad.activa
          }
        });
      }
    );
}
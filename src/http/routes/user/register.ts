import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function registerUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/user/register',
      {
        schema: {
          tags: ['User Authentication'],
          summary: 'Register a new user',
          body: z.object({
            nombre_completo: z.string().min(1).max(100),
            correo_electronico: z.string().email().max(50),
            perfil_id: z.number().int().positive(),
            division_id: z.number().int().positive().optional(),
            departamento_id: z.number().int().positive().optional(),
            unidad_id: z.number().int().positive().optional()
          }),
          response: {
            201: z.object({
              message: z.string(),
              user: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable(),
                correo_electronico: z.string().nullable()
              })
            }),
            400: z.object({
              message: z.string()
            })
          }
        }
      },
      async (request, reply) => {
        const { nombre_completo, correo_electronico, perfil_id, division_id, departamento_id, unidad_id } = request.body;

        // Check if email already exists
        const existingUser = await prisma.usuarios.findUnique({
          where: { correo_electronico }
        });

        if (existingUser) {
          throw new BadRequestError('Email already exists');
        }

        // Create the new user
        const user = await prisma.usuarios.create({
          data: {

            nombre_completo,
            correo_electronico,
            perfil_id: Number(perfil_id), // Explicitly convert to Number if needed
            division_id: division_id ? Number(division_id) : null,
            departamento_id: departamento_id ? Number(departamento_id) : null,
            unidad_id: unidad_id ? Number(unidad_id) : null
          }
        });

        return reply.status(201).send({
          message: 'User registered successfully',
          user: {
            id: user.id,
            nombre_completo: user.nombre_completo,
            correo_electronico: user.correo_electronico
          }
        });
      }
    );
}
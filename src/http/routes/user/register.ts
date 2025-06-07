import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function registerUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/register',
      {
        schema: {
          tags: ['User Authentication'],
          summary: 'Register a new user',
          body: z.object({
            username: z.string().min(3).max(50),
            nombre_completo: z.string().min(1).max(100).optional(),
            correo_electronico: z.string().email().max(100).optional(),
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
                username: z.string(),
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
        const { username, nombre_completo, correo_electronico, perfil_id, division_id, departamento_id, unidad_id } = request.body;

        // Check if username already exists
        const existingUser = await prisma.usuarios.findUnique({
          where: { username }
        });

        if (existingUser) {
          throw new BadRequestError('Username already exists');
        }

        // Create the new user
        const user = await prisma.usuarios.create({
          data: {
            username,
            nombre_completo,
            correo_electronico,
            perfil_id,
            division_id,
            departamento_id,
            unidad_id
          }
        });

        return reply.status(201).send({
          message: 'User registered successfully',
          user: {
            id: user.id,
            username: user.username,
            nombre_completo: user.nombre_completo,
            correo_electronico: user.correo_electronico
          }
        });
      }
    );
}
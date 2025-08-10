import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: z.object({
          nombre_completo: z.string(),
          correo_electronico: z.string().email(),
          password: z.string().min(6),
          perfil_id: z.number().int().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { nombre_completo, correo_electronico, password, perfil_id } = request.body;
      
      const userWithSameEmail = await prisma.usuarios.findUnique({
        where: { correo_electronico },
      });

      if (userWithSameEmail) {
        throw new BadRequestError('User already exists');
      }

      const passwordHash = await hash(password, 10);

      await prisma.usuarios.create({
        data: {
          nombre_completo,
          correo_electronico,
          perfil_id,
          activo: true,
        },
      });

      return reply.status(201).send({ message: 'Account created' });
    }
  );
}

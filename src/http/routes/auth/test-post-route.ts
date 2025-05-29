import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function testPostRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/auth/login',
      {
        schema: {
          tags: ['Testing route and Swagger'],
          summary: 'Testing route and Swagger',
          body: z.object({
            username: z.string(),
            password: z.string().min(6),
          }),
        },
      },
      async (request, reply) => {
        const { username, password } = request.body;

          return reply.status(201).send({
            success: true,
            user: {
              id: 1,
              name: 'Administrador',
              email: 'admin@gestor.com',
              role: 'admin'
            },
            token: 'jwt-token-simulado',
             message: 'Account created'
          });
      }
    );
}

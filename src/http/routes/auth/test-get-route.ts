import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function testRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/',
      {
        schema: {
          tags: ['Testing route and Swagger'],
          summary: 'Testing route and Swagger',
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        return reply.send({  message: 'API de GESTOR funcionando correctamente' });
      }
    );
}

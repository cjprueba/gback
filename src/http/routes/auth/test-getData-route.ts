import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

export async function testGetDataRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/api/data',
      {
        schema: {
          tags: ['Testing route and Swagger'],
          summary: 'Testing route and Swagger',
          200: z.object({
            items: z.array(z.object({
              id: z.number(),
              name: z.string(),
            })),
          }),
        },
      },
      async (request, reply) => {
        return reply.send({
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
          });
      }
    );
}

import type { FastifyInstance } from 'fastify';
import { UnauthorizedError } from '../routes/_errors/unauthorized-error';
import { fastifyPlugin } from 'fastify-plugin';
import { prisma } from '@/lib/prisma';

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request, reply) => {
    // Se hace asi porque tal vez existan rutas en la api donde si el user no esta logueado no se quiere invalidar su acceso
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();
        return sub;
      } catch {
        throw new UnauthorizedError('Invalid auth token');
      }
    };
    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId();
      const usuario = await prisma.usuarios.findFirst({
        where: {
          id: parseInt(userId),
          activo: true,
        },
      });

      if (!usuario) {
        throw new UnauthorizedError('User not found or inactive');
      }

      return {
        usuario,
      };
    };
  });
});

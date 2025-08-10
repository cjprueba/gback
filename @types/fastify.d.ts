import 'fastify';
import { usuarios } from '@prisma/client';

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId: () => Promise<string>;
    getUserMembership: (slug: string) => Promise<{
      usuario: usuarios;
    }>
  }
}

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '@/lib/prisma';

export async function healthRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/health',
      {
        schema: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Returns the health status of the application and its dependencies',
          response: {
            200: z.object({
              status: z.string(),
              timestamp: z.string(),
              uptime: z.number(),
              database: z.object({
                status: z.string(),
                connected: z.boolean(),
              }),
              version: z.string(),
            }),
            503: z.object({
              status: z.string(),
              timestamp: z.string(),
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          // Check database connection
          let dbStatus = 'healthy';
          let dbConnected = true;
          
          try {
            await prisma.$queryRaw`SELECT 1`;
          } catch (error) {
            dbStatus = 'unhealthy';
            dbConnected = false;
          }

          const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
              status: dbStatus,
              connected: dbConnected,
            },
            version: process.env.npm_package_version || '1.0.0',
          };

          // If database is not connected, return 503
          if (!dbConnected) {
            return reply.status(503).send({
              status: 'unhealthy',
              timestamp: new Date().toISOString(),
              error: 'Database connection failed',
            });
          }

          return reply.send(healthStatus);
        } catch (error) {
          return reply.status(503).send({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
}

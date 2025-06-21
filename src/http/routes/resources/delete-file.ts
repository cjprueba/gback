import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { Client } from 'minio';

// Reuse the existing MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

export async function deleteFile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/file',
      {
        schema: {
          tags: ['Resources'],
          summary: 'Delete a file',
          description: 'Delete a file from MinIO storage',
          body: z.object({
            filePath: z.string().min(1, 'File path is required')
          }),
          response: {
            200: z.object({
              message: z.string(),
              filePath: z.string()
            }),
            404: z.object({
              message: z.string()
            })
          },
        },
      },
      async (request, reply) => {
        const { filePath } = request.body;

        try {
          const res = await minioClient.removeObject(BUCKET_NAME, filePath);
          console.log(res);
          return reply.status(200).send({
            message: 'File deleted successfully',
            filePath
          });
        } catch (error) {
          if (error.code === 'NotFound') {
            return reply.status(404).send({
              message: 'File not found'
            });
          }
          throw error;
        }
      }
    );
}
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: 'localhost',
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

console.log("MINIO_ENDPOINT")
console.log(process.env.MINIO_ENDPOINT)

const BUCKET_NAME = process.env.MINIO_BUCKET;

export async function getFiles(app: FastifyInstance) {


  // Add new route to list files
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/files',
      {
        schema: {
          tags: ['File Upload'],
          summary: 'List all files in bucket',
          response: {
            200: z.object({
              files: z.array(z.object({
                name: z.string(),
                size: z.number(),
                lastModified: z.string()
              }))
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const stream = minioClient.listObjects(BUCKET_NAME);
          const files = [];
          
          for await (const item of stream) {
            const stat = await minioClient.statObject(BUCKET_NAME, item.name);
            files.push({
              name: item.name,
              size: stat.size,
              lastModified: stat.lastModified.toISOString()
            });
          }
          
          return reply.send({ files });
        } catch (error) {
          console.error(error);
          throw new BadRequestError('Failed to list files');
        }
      }
    );
}
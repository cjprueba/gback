import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

console.log("MINIO_ENDPOINT")
console.log(process.env.MINIO_ENDPOINT)

const BUCKET_NAME = process.env.MINIO_BUCKET || 'gestor-files';

export async function uploadFile(app: FastifyInstance) {
  // Register multipart plugin if not already registered
  await app.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 10
    }
  });

  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/upload',
      {
        schema: {
          tags: ['Resources'],
          summary: 'Upload a file',
          description: 'Recibe file y ruta del archivo, dos parametros obligatorios',
          consumes: ['multipart/form-data'],
          response: {
            200: z.object({
              message: z.string(),
              filename: z.string(),
              ruta: z.string()
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const files = await request.files(); // Get all files
          const results = [];
          let ruta = null;
          
          for await (const data of files) {
            ruta = data.fields['ruta']['value'];
            const buffer = data.file;
            
            await minioClient.putObject(BUCKET_NAME, ruta + data.filename, buffer);
            
            results.push({
              message: 'File uploaded successfully',
              filename: data.filename,
              ruta: ruta
            });
          }
          
          return reply.send({
            message: 'File uploaded successfully',
            filename: 'test',
            ruta: ruta
          });
        } catch (error) {
          console.error(error);
          if (error instanceof BadRequestError) {
            throw error;
          }
          throw new BadRequestError('File upload failed');
        }
      }
    );
}
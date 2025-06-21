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
          tags: ['File Upload'],
          summary: 'Upload a file',
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
          
          const data = await request.file();
          const ruta = data.fields['ruta']['value'];

          //console.log("data");
          //console.log(data.fields['ruta']['value']); // virende
          
          
          if (!data) {
            throw new BadRequestError('No file uploaded');
          }
          
          
          //const buffer = await data.toBuffer();
          const buffer = data.file;

          

          // Upload to MinIO
          await minioClient.putObject(BUCKET_NAME,  data.filename, buffer);
          
          return reply.send({ 
            message: 'File uploaded successfully',
            filename: data.filename,
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
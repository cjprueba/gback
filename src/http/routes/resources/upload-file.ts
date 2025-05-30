import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { promises as fs } from 'fs';
import path from 'path';

async function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, '../../../../uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') throw err;
  }
  return uploadsDir;
}

export async function uploadFile(app: FastifyInstance) {
  // Register multipart plugin if not already registered
  await app.register(import('@fastify/multipart'), {
    // Optional: set limits
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 1 // Maximum number of files
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
              size: z.number()
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const data = await request.file();
          
          if (!data) {
            throw new BadRequestError('No file uploaded');
          }
          
          const uploadsDir = await ensureUploadsDir();
          const filePath = path.join(uploadsDir, data.filename);
          
          // Convert the file stream to buffer and write to disk
          const buffer = await data.toBuffer();
          await fs.writeFile(filePath, buffer);
          
          return reply.send({ 
            message: 'File uploaded successfully',
            filename: data.filename,
            size: buffer.length
          });
        } catch (error) {
          if (error instanceof BadRequestError) {
            throw error;
          }
          throw new BadRequestError('File upload failed');
        }
      }
    );
}
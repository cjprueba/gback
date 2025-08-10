import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { Client } from 'minio';

// Reuse the existing MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'gestor-files';

export async function downloadFile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/file/download',
      {
        schema: {
          tags: ['Resources'],
          summary: 'Download a file',
          description: 'Download a file from MinIO storage',
          querystring: z.object({
            path: z.string().min(1, 'File path is required')
          }),
          // No response schema - allows any response type including streams
        },
      },
      async (request, reply) => {
        const { path } = request.query as { path: string };
        const fileName = path.split('/').pop() || 'file';

        try {
          // Check if file exists
          await minioClient.statObject(BUCKET_NAME, path);
          
          // Get the file as a stream
          const stream = await minioClient.getObject(BUCKET_NAME, path);
          
          // Set appropriate headers
          reply.header('Content-Type', 'application/octet-stream');
          reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
          
          // Return the stream directly
          return reply.send(stream);
        } catch (error: any) {
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
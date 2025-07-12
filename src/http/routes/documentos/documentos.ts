import { prisma } from '@/lib/prisma';
import { minioClient, BUCKET_NAME } from '@/utils/minio-utils';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { UnauthorizedError } from '../_errors/unauthorized-error';
import { createHash } from 'crypto';

export async function documentosRoutes(app: FastifyInstance) {
  // Register multipart plugin for file uploads
  await app.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
      files: 1, // Only one file at a time
    },
  });

  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/documentos/upload',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Upload a document to a folder',
          description: 'Uploads a file to MinIO and creates a document record in the database',
          consumes: ['multipart/form-data'],
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
                 documento: z.object({
                 id: z.string(),
                 nombre_archivo: z.string(),
                 extension: z.string().nullable().optional(),
                 tamano: z.number().optional(),
                 tipo_mime: z.string().nullable().optional(),
                 descripcion: z.string().nullable().optional(),
                 categoria: z.string().nullable().optional(),
                 estado: z.string().nullable().optional(),
                 version: z.string().nullable().optional(),
                 carpeta_id: z.number(),
                 s3_path: z.string().nullable().optional(),
                 s3_bucket_name: z.string().nullable().optional(),
                 s3_created: z.boolean().optional(),
                 hash_integridad: z.string().nullable().optional(),
                 etiquetas: z.array(z.string()),
                 proyecto_id: z.number().nullable().optional(),
                 subido_por: z.number(),
                 fecha_creacion: z.date(),
                 fecha_ultima_actualizacion: z.date(),
               }),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          // Get form data
          const data = await request.file();
          if (!data) {
            throw new BadRequestError('No file provided');
          }

          // Parse form fields
          const carpetaId = parseInt((data.fields['carpeta_id'] as any)?.value as string);
          const userId = parseInt((data.fields['user_id'] as any)?.value as string) || 1; // Default to user 1 if not provided
          const descripcion = (data.fields['descripcion'] as any)?.value as string;
          const categoria = (data.fields['categoria'] as any)?.value as string;
          const etiquetas = (data.fields['etiquetas'] as any)?.value ? JSON.parse((data.fields['etiquetas'] as any).value as string) : [];
          const proyectoId = (data.fields['proyecto_id'] as any)?.value ? parseInt((data.fields['proyecto_id'] as any).value as string) : null;
          const archivoRelacionado = (data.fields['archivo_relacionado'] as any)?.value as string;

          console.log('carpetaId', data.fields['carpeta_id']['value']);

          // Validate carpeta exists and get its S3 path
          const carpeta = await (prisma as any).carpetas.findFirst({
            where: {
              id: carpetaId,
            },
          });

          if (!carpeta) {
            throw new BadRequestError('Folder not found');
          }

          // Generate file hash for integrity
          const fileBuffer = await data.toBuffer();
          const hashIntegridad = createHash('sha256').update(fileBuffer).digest('hex');

          // Generate storage path using the folder's S3 path
          //const timestamp = Date.now();
          //const sanitizedFilename = data.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
          //const s3Path = `${carpeta.s3_path}/${timestamp}_${sanitizedFilename}`;
          const s3Path = `${carpeta.s3_path}/${data.filename}`;

          // Upload file to MinIO
          await minioClient.putObject(BUCKET_NAME, s3Path, fileBuffer);

          // Create document record in database
          const documento = await prisma.documentos.create({
            data: {
              nombre_archivo: data.filename,
              extension: data.filename.split('.').pop() || null,
              tamano: BigInt(fileBuffer.length),
              tipo_mime: data.mimetype,
              descripcion: descripcion || null,
              categoria: categoria || null,
              estado: 'activo',
              version: '1.0',
              archivo_relacionado: archivoRelacionado || null,
              carpeta_id: carpetaId,
              s3_path: s3Path,
              s3_bucket_name: BUCKET_NAME,
              s3_created: true,
              hash_integridad: hashIntegridad,
              etiquetas: etiquetas,
              proyecto_id: proyectoId,
              subido_por: userId,
              usuario_creador: userId,
            } as any,
          });

          // Create audit record
          await prisma.archivo_historial.create({
            data: {
              archivo_id: documento.id,
              usuario_id: userId,
              accion: 'upload',
              descripcion: 'File uploaded',
              version_nueva: '1.0',
            },
          });

          return reply.send({
            success: true,
            message: 'Document uploaded successfully',
                         documento: {
               id: documento.id,
               nombre_archivo: documento.nombre_archivo,
               extension: documento.extension,
               tamano: Number(documento.tamano),
               tipo_mime: documento.tipo_mime,
               descripcion: documento.descripcion,
               categoria: documento.categoria,
               estado: documento.estado,
               version: documento.version,
               carpeta_id: documento.carpeta_id,
                             s3_path: (documento as any).s3_path,
              s3_bucket_name: (documento as any).s3_bucket_name,
              s3_created: (documento as any).s3_created,
              hash_integridad: documento.hash_integridad,
               etiquetas: documento.etiquetas,
               proyecto_id: documento.proyecto_id,
               subido_por: documento.subido_por,
               fecha_creacion: documento.fecha_creacion,
               fecha_ultima_actualizacion: documento.fecha_ultima_actualizacion,
             },
          });

        } catch (error) {
          console.error('Error uploading document:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to upload document');
        }
      }
    );

  // Get documents by folder
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/folder/:carpetaId',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Get documents in a folder',
          description: 'Retrieves all documents in a specific folder',
          params: z.object({
            carpetaId: z.string().transform((val) => parseInt(val)),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              documentos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable().optional(),
                tamano: z.number().optional(),
                tipo_mime: z.string().nullable().optional(),
                descripcion: z.string().nullable().optional(),
                categoria: z.string().nullable().optional(),
                estado: z.string().nullable().optional(),
                version: z.string().nullable().optional(),
                carpeta_id: z.number(),
                s3_path: z.string().nullable().optional(),
                s3_bucket_name: z.string().nullable().optional(),
                                 s3_created: z.boolean().optional(),
                 hash_integridad: z.string().nullable().optional(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable().optional(),
                subido_por: z.number(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable().optional(),
                  correo_electronico: z.string().nullable().optional(),
                }),
              })),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { carpetaId } = request.params;

          // Check if folder exists
          const carpeta = await (prisma as any).carpetas.findFirst({
            where: {
              id: carpetaId,
            },
          });

          if (!carpeta) {
            throw new BadRequestError('Folder not found');
          }

          // Get documents in the folder (excluding deleted ones)
          const documentos = await (prisma as any).documentos.findMany({
            where: {
              carpeta_id: carpetaId,
              eliminado: false,
            },
            include: {
              creador: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
            },
            orderBy: {
              fecha_creacion: 'desc',
            },
          });

          return reply.send({
            success: true,
            documentos: documentos.map(doc => ({
              id: doc.id,
              nombre_archivo: doc.nombre_archivo,
              extension: doc.extension,
              tamano: doc.tamano ? Number(doc.tamano) : null,
              tipo_mime: doc.tipo_mime,
              descripcion: doc.descripcion,
              categoria: doc.categoria,
              estado: doc.estado,
              version: doc.version,
              carpeta_id: doc.carpeta_id,
              s3_path: (doc as any).s3_path,
              s3_bucket_name: (doc as any).s3_bucket_name,
              s3_created: (doc as any).s3_created,
              hash_integridad: doc.hash_integridad,
              etiquetas: doc.etiquetas,
              proyecto_id: doc.proyecto_id,
              subido_por: doc.subido_por,
              fecha_creacion: doc.fecha_creacion,
              fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
              creador: doc.creador,
            })),
          });

        } catch (error) {
          console.error('Error getting documents:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to get documents');
        }
      }
    );

  // Delete document
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/documentos/:documentoId',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Eliminar documento',
          description: 'Elimina un documento (soft delete en base de datos, hard delete en MinIO)',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;

          // Get document (including deleted ones for this operation)
          const documento = await (prisma as any).documentos.findFirst({
            where: {
              id: documentoId,
            },
          });

          if (!documento) {
            throw new BadRequestError('Document not found');
          }

          // Check if document is already deleted
          if ((documento as any).eliminado) {
            throw new BadRequestError('Document is already deleted');
          }

          // Create audit record first (before deleting the document)
          await (prisma as any).archivo_historial.create({
            data: {
              archivo_id: documentoId,
              usuario_id: 1, // Default user ID - should be passed as parameter
              accion: 'soft_delete',
              descripcion: 'Document marked as deleted (soft delete in DB, hard delete in MinIO)',
              version_anterior: documento.version,
            },
          });

          // Delete from MinIO first
          if ((documento as any).s3_path) {
            try {
              await minioClient.removeObject(BUCKET_NAME, (documento as any).s3_path);
              console.log(`File deleted from MinIO: ${(documento as any).s3_path}`);
            } catch (error) {
              console.error('Error deleting from MinIO:', error);
              // Continue with soft delete even if MinIO deletion fails
            }
          }

          // Soft delete - mark as deleted in database but keep record
          await (prisma as any).documentos.update({
            where: {
              id: documentoId,
            },
            data: {
              eliminado: true,
              fecha_ultima_actualizacion: new Date(),
            },
          });

          return reply.send({
            success: true,
            message: 'Document deleted successfully (soft delete in DB, hard delete in MinIO)',
          });

        } catch (error) {
          console.error('Error deleting document:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to delete document');
        }
      }
    );

  // Download document
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/:documentoId/download',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Download a document',
          description: 'Downloads a document from MinIO using S3 path',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              url: z.string().optional(),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;

          // Get document (excluding deleted ones for download)
          const documento = await (prisma as any).documentos.findFirst({
            where: {
              id: documentoId,
              eliminado: false,
            },
          });

          if (!documento) {
            throw new BadRequestError('Document not found or has been deleted');
          }

          // Check if document has S3 path
          if (!(documento as any).s3_path) {
            throw new BadRequestError('Document not found in storage');
          }

          // Generate presigned URL for download
          const presignedUrl = await minioClient.presignedGetObject(
            BUCKET_NAME,
            (documento as any).s3_path,
            24 * 60 * 60 // 24 hours expiration
          );

          return reply.send({
            success: true,
            message: 'Download URL generated successfully',
            url: presignedUrl,
          });

        } catch (error) {
          console.error('Error generating download URL:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to generate download URL');
        }
      }
    );

  // Get deleted documents (admin only)
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/deleted',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Obtener documentos eliminados',
          description: 'Obtiene la lista de documentos marcados como eliminados',
          response: {
            200: z.object({
              success: z.boolean(),
              documentos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                tamano: z.number().nullable(),
                tipo_mime: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                version: z.string().nullable(),
                carpeta_id: z.number(),
                s3_path: z.string().nullable(),
                s3_bucket_name: z.string().nullable(),
                s3_created: z.boolean().nullable(),
                hash_integridad: z.string().nullable(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable(),
                subido_por: z.number(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
              })),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          // Get deleted documents
          const documentos = await (prisma as any).documentos.findMany({
            where: {
              eliminado: true,
            },
            include: {
              creador: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
            },
            orderBy: {
              fecha_ultima_actualizacion: 'desc',
            },
          });

          return reply.send({
            success: true,
            documentos: documentos.map(doc => ({
              id: doc.id,
              nombre_archivo: doc.nombre_archivo,
              extension: doc.extension,
              tamano: doc.tamano ? Number(doc.tamano) : null,
              tipo_mime: doc.tipo_mime,
              descripcion: doc.descripcion,
              categoria: doc.categoria,
              estado: doc.estado,
              version: doc.version,
              carpeta_id: doc.carpeta_id,
              s3_path: (doc as any).s3_path,
              s3_bucket_name: (doc as any).s3_bucket_name,
              s3_created: (doc as any).s3_created,
              hash_integridad: doc.hash_integridad,
              etiquetas: doc.etiquetas,
              proyecto_id: doc.proyecto_id,
              subido_por: doc.subido_por,
              fecha_creacion: doc.fecha_creacion,
              fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
              creador: doc.creador,
            })),
          });

        } catch (error) {
          console.error('Error getting deleted documents:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to get deleted documents');
        }
      }
    );

  // Get deleted documents that need re-upload
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/deleted/needs-reupload',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Obtener documentos eliminados que necesitan re-subida',
          description: 'Obtiene la lista de documentos eliminados que necesitan ser re-subidos porque el archivo físico fue eliminado',
          response: {
            200: z.object({
              success: z.boolean(),
              documentos: z.array(z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                carpeta_id: z.number(),
                proyecto_id: z.number().nullable(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
              })),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          // Get deleted documents that have no S3 path (indicating file was deleted)
          const documentos = await (prisma as any).documentos.findMany({
            where: {
              eliminado: true,
              s3_path: null,
            },
            include: {
              creador: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
            },
            orderBy: {
              fecha_ultima_actualizacion: 'desc',
            },
          });

          return reply.send({
            success: true,
            documentos: documentos.map(doc => ({
              id: doc.id,
              nombre_archivo: doc.nombre_archivo,
              extension: doc.extension,
              descripcion: doc.descripcion,
              categoria: doc.categoria,
              carpeta_id: doc.carpeta_id,
              proyecto_id: doc.proyecto_id,
              fecha_creacion: doc.fecha_creacion,
              fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
              creador: doc.creador,
            })),
          });

        } catch (error) {
          console.error('Error getting deleted documents that need re-upload:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to get deleted documents that need re-upload');
        }
      }
    );

  // Restore deleted document
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch(
      '/documentos/:documentoId/restore',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Restaurar documento eliminado',
          description: 'Restaura un documento que fue marcado como eliminado',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
            400: z.object({
              error: z.string(),
            }),
            401: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;

          // Get document (including deleted ones for this operation)
          const documento = await (prisma as any).documentos.findFirst({
            where: {
              id: documentoId,
            },
          });

          if (!documento) {
            throw new BadRequestError('Document not found');
          }

          // Check if document is not deleted
          if (!(documento as any).eliminado) {
            throw new BadRequestError('Document is not deleted');
          }

          // Create audit record
          await (prisma as any).archivo_historial.create({
            data: {
              archivo_id: documentoId,
              usuario_id: 1, // Default user ID - should be passed as parameter
              accion: 'restore',
              descripcion: 'Document restored from deleted state (file needs to be re-uploaded)',
              version_nueva: documento.version,
            },
          });

          // Restore document - mark as not deleted
          await (prisma as any).documentos.update({
            where: {
              id: documentoId,
            },
            data: {
              eliminado: false,
              fecha_ultima_actualizacion: new Date(),
            },
          });

          return reply.send({
            success: true,
            message: 'Document restored successfully. Note: The file was physically deleted from storage and needs to be re-uploaded.',
          });

        } catch (error) {
          console.error('Error restoring document:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to restore document');
        }
      }
    );
}

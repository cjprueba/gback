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
          summary: 'Subir un documento a una carpeta',
          description: 'Sube un archivo a MinIO y crea un registro de documento en la base de datos con su primera versión. El proyecto_id se obtiene automáticamente de la carpeta especificada. El tipo_documento_id es obligatorio. Si se envía el parámetro reemplazar=true, se omite la validación de documento duplicado.',
          consumes: ['multipart/form-data'],
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              documento: z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable().optional(),
                tipo_mime: z.string().nullable().optional(),
                descripcion: z.string().nullable().optional(),
                categoria: z.string().nullable().optional(),
                estado: z.string().nullable().optional(),
                carpeta_id: z.number(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable().optional(),
                subido_por: z.number(),
                usuario_creador: z.number(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                version_actual: z.object({
                  id: z.number(),
                  numero_version: z.number(),
                  s3_path: z.string(),
                  s3_bucket_name: z.string().nullable().optional(),
                  tamano: z.number().nullable().optional(),
                  hash_integridad: z.string().nullable().optional(),
                  comentario: z.string().nullable().optional(),
                  fecha_creacion: z.date(),
                  activa: z.boolean(),
                }),
              }),
            }),
            400: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
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
          const tipoDocumentoId = parseInt((data.fields['tipo_documento_id'] as any)?.value as string);
          const descripcion = (data.fields['descripcion'] as any)?.value as string;
          const categoria = (data.fields['categoria'] as any)?.value as string;
          const etiquetas = (data.fields['etiquetas'] as any)?.value ? JSON.parse((data.fields['etiquetas'] as any).value as string) : [];
          const comentario = (data.fields['comentario'] as any)?.value as string;
          const reemplazar = (data.fields['reemplazar'] as any)?.value === '1';

          // Validate required fields
          if (!tipoDocumentoId || isNaN(tipoDocumentoId)) {
            throw new BadRequestError('tipo_documento_id is required and must be a valid number');
          }

          console.log('carpetaId', data.fields['carpeta_id']['value']);

          // Check if document already exists in the folder
          const existingDocument = await prisma.documentos.findFirst({
            where: {
              nombre_archivo: data.filename,
              carpeta_id: carpetaId,
              eliminado: false,
            },
          });

          if (existingDocument && !reemplazar) {
            return reply.status(400).send({
              success: false,
              error: {
                code: 'DOCUMENT_ALREADY_EXISTS',
                message: 'El documento ya existe en esta carpeta'
              }
            });
          }

          // If replacing, get the highest version number
          let nextVersionNumber = 1;
          if (existingDocument && reemplazar) {
            const highestVersion = await (prisma as any).documento_versiones.findFirst({
              where: {
                documento_id: existingDocument.id,
              },
              orderBy: {
                numero_version: 'desc',
              },
            });
            
            if (highestVersion) {
              nextVersionNumber = highestVersion.numero_version + 1;
            }
          }

          // Validate carpeta exists and get its S3 path and proyecto_id
          const carpeta = await (prisma as any).carpetas.findFirst({
            where: {
              id: carpetaId,
            },
            include: {
              proyecto: {
                select: {
                  id: true,
                },
              },
            },
          });

          if (!carpeta) {
            throw new BadRequestError('Folder not found');
          }

          // Validate tipo_documento exists and is active
          const tipoDocumento = await (prisma as any).tipos_documentos.findFirst({
            where: {
              id: tipoDocumentoId,
              activo: true,
            },
          });

          if (!tipoDocumento) {
            throw new BadRequestError('Document type not found or is not active');
          }

          // Generate file hash for integrity
          const fileBuffer = await data.toBuffer();
          const hashIntegridad = createHash('sha256').update(fileBuffer).digest('hex');

          // Generate storage path using the folder's S3 path
          const s3Path = `${carpeta.s3_path}/version_${nextVersionNumber}_${data.filename}`;

          // Upload file to MinIO
          await minioClient.putObject(BUCKET_NAME, s3Path, fileBuffer);

          let documento;
          let version;

          if (existingDocument && reemplazar) {
            // Update existing document
            documento = await prisma.documentos.update({
              where: { id: existingDocument.id },
              data: {
                extension: data.filename.split('.').pop() || null,
                tipo_mime: data.mimetype,
                descripcion: descripcion || null,
                categoria: categoria || null,
                fecha_ultima_actualizacion: new Date(),
              },
            });

            // Deactivate all previous versions
            await (prisma as any).documento_versiones.updateMany({
              where: {
                documento_id: existingDocument.id,
                activa: true,
              },
              data: {
                activa: false,
              },
            });

            // Create new version record
            version = await (prisma as any).documento_versiones.create({
              data: {
                documento_id: existingDocument.id,
                numero_version: nextVersionNumber,
                s3_path: s3Path,
                s3_bucket_name: BUCKET_NAME,
                tamano: BigInt(fileBuffer.length),
                hash_integridad: hashIntegridad,
                comentario: comentario || null,
                usuario_creador: userId,
                metadata: {
                  original_filename: data.filename,
                  mime_type: data.mimetype,
                  upload_timestamp: new Date().toISOString(),
                  replaced_previous_version: true,
                },
                activa: true,
              },
            });
          } else {
            // Create new document record
            documento = await prisma.documentos.create({
              data: {
                nombre_archivo: data.filename,
                extension: data.filename.split('.').pop() || null,
                tipo_mime: data.mimetype,
                descripcion: descripcion || null,
                categoria: categoria || null,
                estado: 'activo',
                carpeta_id: carpetaId,
                tipo_documento_id: tipoDocumentoId,
                etiquetas: etiquetas,
                proyecto_id: carpeta.proyecto?.id || null,
                subido_por: userId,
                usuario_creador: userId,
              },
            });

            // Create first version record
            version = await (prisma as any).documento_versiones.create({
              data: {
                documento_id: documento.id,
                numero_version: 1,
                s3_path: s3Path,
                s3_bucket_name: BUCKET_NAME,
                tamano: BigInt(fileBuffer.length),
                hash_integridad: hashIntegridad,
                comentario: comentario || null,
                usuario_creador: userId,
                metadata: {
                  original_filename: data.filename,
                  mime_type: data.mimetype,
                  upload_timestamp: new Date().toISOString(),
                },
                activa: true,
              },
            });
          }

          // Create audit record
          await prisma.archivo_historial.create({
            data: {
              archivo_id: documento.id,
              usuario_id: userId,
              accion: existingDocument && reemplazar ? 'replace' : 'upload',
              descripcion: existingDocument && reemplazar 
                ? `File replaced - new version ${nextVersionNumber} created` 
                : 'File uploaded - first version created',
              version_anterior: existingDocument && reemplazar ? String(nextVersionNumber - 1) : null,
              version_nueva: String(version.numero_version),
            },
          });

          return reply.send({
            success: true,
            message: existingDocument && reemplazar 
              ? `Document replaced successfully with version ${nextVersionNumber}` 
              : 'Document uploaded successfully',
            documento: {
              id: documento.id,
              nombre_archivo: documento.nombre_archivo,
              extension: documento.extension,
              tipo_mime: documento.tipo_mime,
              descripcion: documento.descripcion,
              categoria: documento.categoria,
              estado: documento.estado,
              carpeta_id: documento.carpeta_id,
              etiquetas: documento.etiquetas,
              proyecto_id: documento.proyecto_id,
              subido_por: documento.subido_por,
              usuario_creador: documento.usuario_creador,
              fecha_creacion: documento.fecha_creacion,
              fecha_ultima_actualizacion: documento.fecha_ultima_actualizacion,
              version_actual: {
                id: version.id,
                numero_version: version.numero_version,
                s3_path: version.s3_path,
                s3_bucket_name: version.s3_bucket_name,
                tamano: Number(version.tamano),
                hash_integridad: version.hash_integridad,
                comentario: version.comentario,
                fecha_creacion: version.fecha_creacion,
                activa: version.activa,
              },
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
          summary: 'Obtener documentos en una carpeta',
          description: 'Recupera todos los documentos en una carpeta específica',
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
                tipo_mime: z.string().nullable().optional(),
                descripcion: z.string().nullable().optional(),
                categoria: z.string().nullable().optional(),
                estado: z.string().nullable().optional(),
                carpeta_id: z.number(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable().optional(),
                subido_por: z.number(),
                usuario_creador: z.number(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable().optional(),
                  correo_electronico: z.string().nullable().optional(),
                }),
                version_actual: z.object({
                  id: z.number(),
                  numero_version: z.number(),
                  s3_path: z.string(),
                  s3_bucket_name: z.string().nullable().optional(),
                  tamano: z.number().nullable().optional(),
                  hash_integridad: z.string().nullable().optional(),
                  comentario: z.string().nullable().optional(),
                  fecha_creacion: z.date(),
                  activa: z.boolean(),
                }).nullable().optional(),
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

          // Get documents in the folder (excluding deleted ones) with their current version
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
              versiones: {
                where: {
                  activa: true,
                },
                orderBy: {
                  fecha_creacion: 'desc',
                },
                take: 1,
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
              tipo_mime: doc.tipo_mime,
              descripcion: doc.descripcion,
              categoria: doc.categoria,
              estado: doc.estado,
              carpeta_id: doc.carpeta_id,
              etiquetas: doc.etiquetas,
              proyecto_id: doc.proyecto_id,
              subido_por: doc.subido_por,
              usuario_creador: doc.usuario_creador,
              fecha_creacion: doc.fecha_creacion,
              fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
              creador: doc.creador,
              version_actual: doc.versiones && doc.versiones.length > 0 ? {
                id: doc.versiones[0].id,
                numero_version: doc.versiones[0].numero_version,
                s3_path: doc.versiones[0].s3_path,
                s3_bucket_name: doc.versiones[0].s3_bucket_name,
                tamano: doc.versiones[0].tamano ? Number(doc.versiones[0].tamano) : null,
                hash_integridad: doc.versiones[0].hash_integridad,
                comentario: doc.versiones[0].comentario,
                fecha_creacion: doc.versiones[0].fecha_creacion,
                activa: doc.versiones[0].activa,
              } : null,
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

          // Get the current active version to delete from MinIO
          const currentVersion = await (prisma as any).documento_versiones.findFirst({
            where: {
              documento_id: documentoId,
              activa: true,
            },
          });

          // Create audit record first (before deleting the document)
          await (prisma as any).archivo_historial.create({
            data: {
              archivo_id: documentoId,
              usuario_id: 1, // Default user ID - should be passed as parameter
              accion: 'soft_delete',
              descripcion: 'Document marked as deleted (soft delete in DB, hard delete in MinIO)',
              version_anterior: currentVersion?.numero_version ? String(currentVersion.numero_version) : 'unknown',
            },
          });

          // Delete from MinIO first if there's a current version
          if (currentVersion?.s3_path) {
            try {
              await minioClient.removeObject(BUCKET_NAME, currentVersion.s3_path);
              console.log(`File deleted from MinIO: ${currentVersion.s3_path}`);
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
          summary: 'Descargar un documento',
          description: 'Descarga un documento desde MinIO usando la ruta S3',
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

          // Get the current active version to download
          const currentVersion = await (prisma as any).documento_versiones.findFirst({
            where: {
              documento_id: documentoId,
              activa: true,
            },
          });

          // Check if document has a current version with S3 path
          if (!currentVersion?.s3_path) {
            throw new BadRequestError('Document not found in storage');
          }

          // Generate presigned URL for download
          const presignedUrl = await minioClient.presignedGetObject(
            BUCKET_NAME,
            currentVersion.s3_path,
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
                tipo_mime: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                carpeta_id: z.number(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable(),
                subido_por: z.number(),
                usuario_creador: z.number(),
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
              tipo_mime: doc.tipo_mime,
              descripcion: doc.descripcion,
              categoria: doc.categoria,
              estado: doc.estado,
              carpeta_id: doc.carpeta_id,
              etiquetas: doc.etiquetas,
              proyecto_id: doc.proyecto_id,
              subido_por: doc.subido_por,
              usuario_creador: doc.usuario_creador,
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

  // Enhanced direct download endpoint (alternative to presigned URLs)
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/:documentoId/download-direct',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Descargar documento directamente (alternativa a URLs presignadas)',
          description: 'Descarga un documento directamente a través del servidor con características mejoradas como descargas por chunks',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          querystring: z.object({
            chunked: z.boolean().optional().default(false),
            filename: z.string().optional()
          }),
          // No response schema - allows any response type including streams
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;
          const { chunked = false, filename } = request.query as { 
            chunked?: boolean; 
            filename?: string 
          };

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

          // Get the current active version to download
          const currentVersion = await (prisma as any).documento_versiones.findFirst({
            where: {
              documento_id: documentoId,
              activa: true,
            },
          });

          // Check if document has a current version with S3 path
          if (!currentVersion?.s3_path) {
            throw new BadRequestError('Document not found in storage');
          }

          const path = currentVersion.s3_path;
          const fileName = filename || documento.nombre_archivo || path.split('/').pop() || 'file';

          // Get file stats first
          const stats = await minioClient.statObject(BUCKET_NAME, path);
          const fileSize = stats.size;
          const contentType = stats.metaData?.['content-type'] || documento.tipo_mime || 'application/octet-stream';

          // Check if client supports range requests
          const range = request.headers.range;
          const supportsRange = range && chunked;

          if (supportsRange) {
            // Handle range requests for chunked downloads
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            // Validate range
            if (start >= fileSize || end >= fileSize) {
              reply.status(416).send({
                error: 'Requested range not satisfiable'
              });
              return;
            }

            // Set headers for partial content
            reply.status(206);
            reply.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            reply.header('Accept-Ranges', 'bytes');
            reply.header('Content-Length', chunksize);
            reply.header('Content-Type', contentType);
            reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

            // Get partial stream
            const stream = await minioClient.getPartialObject(BUCKET_NAME, path, start, end);
            return reply.send(stream as any);
          } else {
            // Regular download
            const stream = await minioClient.getObject(BUCKET_NAME, path);
            
            // Set headers
            reply.header('Content-Type', contentType);
            reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
            reply.header('Content-Length', fileSize);
            reply.header('Accept-Ranges', 'bytes');
            
            // Return file info for non-streaming requests
            if (request.headers.accept?.includes('application/json')) {
              return reply.send({
                success: true,
                message: 'File information retrieved successfully',
                fileInfo: {
                  name: fileName,
                  size: fileSize,
                  type: contentType,
                  path: path
                }
              });
            }
            
            // Return the stream
            return reply.send(stream as any);
          }
        } catch (error: any) {
          console.error('Error downloading document:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          if (error.code === 'NotFound') {
            return reply.status(404).send({
              error: 'File not found'
            });
          }
          
          if (error.code === 'NoSuchBucket') {
            return reply.status(500).send({
              error: 'Storage bucket not found'
            });
          }
          
          return reply.status(500).send({
            error: 'Failed to download file'
          });
        }
      }
    );

  // Download document with metadata
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/:documentoId/download-with-info',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Descargar documento con información de metadatos',
          description: 'Obtiene información del documento y opcionalmente genera una URL de descarga',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          querystring: z.object({
            includeMetadata: z.boolean().optional().default(true)
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              metadata: z.object({
                name: z.string(),
                size: z.number(),
                type: z.string(),
                path: z.string(),
                lastModified: z.date().optional(),
                etag: z.string().optional(),
                versionId: z.string().optional()
              }),
              downloadUrl: z.string().optional()
            }),
            400: z.object({
              error: z.string()
            }),
            404: z.object({
              error: z.string()
            }),
            500: z.object({
              error: z.string()
            })
          }
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;
          const { includeMetadata = true } = request.query as { 
            includeMetadata?: boolean 
          };

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

          // Get the current active version to get S3 path
          const currentVersion = await (prisma as any).documento_versiones.findFirst({
            where: {
              documento_id: documentoId,
              activa: true,
            },
          });

          // Check if document has a current version with S3 path
          if (!currentVersion?.s3_path) {
            throw new BadRequestError('Document not found in storage');
          }

          const path = currentVersion.s3_path;
          const fileName = documento.nombre_archivo || path.split('/').pop() || 'file';

          // Get file stats
          const stats = await minioClient.statObject(BUCKET_NAME, path);

          const metadata = {
            name: fileName,
            size: stats.size,
            type: stats.metaData?.['content-type'] || documento.tipo_mime || 'application/octet-stream',
            path: path,
            lastModified: stats.lastModified,
            etag: stats.etag,
            versionId: stats.versionId
          };

          if (includeMetadata) {
            return reply.send({
              success: true,
              message: 'File metadata retrieved successfully',
              metadata: metadata
            });
          } else {
            // Generate a temporary download URL
            const downloadUrl = await minioClient.presignedGetObject(
              BUCKET_NAME,
              path,
              60 * 60 // 1 hour expiration
            );

            return reply.send({
              success: true,
              message: 'File information and download URL generated',
              metadata: metadata,
              downloadUrl: downloadUrl
            });
          }
        } catch (error: any) {
          console.error('Error getting document info:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          if (error.code === 'NotFound') {
            return reply.status(404).send({
              error: 'File not found'
            });
          }
          
          return reply.status(500).send({
            error: 'Failed to get file information'
          });
        }
      }
    );

  // Download document as base64
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/:documentoId/download-base64',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Descargar documento como string base64',
          description: 'Descarga un documento como string codificado en base64, útil para archivos pequeños o incrustar en respuestas JSON. Permite especificar una versión específica del documento o usar la versión activa por defecto.',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
                  querystring: z.object({
          maxSize: z.coerce.number().optional().default(10 * 1024 * 1024), // 10MB default max
          version: z.coerce.number().optional() // Optional version number to download specific version
        }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              data: z.object({
                filename: z.string(),
                extension: z.string().nullable(),
                size: z.number(),
                type: z.string(),
                base64: z.string(),
                path: z.string()
              })
            }),
            400: z.object({
              error: z.string()
            }),
            404: z.object({
              error: z.string()
            }),
            413: z.object({
              error: z.string()
            }),
            500: z.object({
              error: z.string()
            })
          }
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;
          let { maxSize = 10 * 1024 * 1024, version } = request.query as { 
            maxSize?: number,
            version?: number
          };

          // Set default version to 0 if not provided
          if (version === undefined) {
            version = 0;
          }

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

          // Get the specific version or current active version to get S3 path
          let targetVersion;
          if (version !== 0) {
            // Look for specific version number provided in query parameter
            targetVersion = await (prisma as any).documento_versiones.findFirst({
              where: {
                documento_id: documentoId,
                numero_version: version,
              },
            });
            
            if (!targetVersion) {
              throw new BadRequestError(`Version ${version} not found for this document`);
            }
          } else {
            // If no version specified, get the current active version (default behavior)
            targetVersion = await (prisma as any).documento_versiones.findFirst({
              where: {
                documento_id: documentoId,
                activa: true,
              },
            });
          }

          // Check if document has a target version with S3 path
          if (!targetVersion?.s3_path) {
            throw new BadRequestError('Document not found in storage');
          }

          const path = targetVersion.s3_path;
          const fileName = documento.nombre_archivo || path.split('/').pop() || 'file';

          // Get extension from documentos table
          const fileExtension = documento.extension;

          // Get file stats first
          const stats = await minioClient.statObject(BUCKET_NAME, path);
          const fileSize = stats.size;
          const contentType = stats.metaData?.['content-type'] || documento.tipo_mime || 'application/octet-stream';

          // Check file size limit
          if (fileSize > maxSize) {
            return reply.status(413).send({
              error: `File too large. Maximum size allowed is ${Math.round(maxSize / 1024 / 1024)}MB`
            });
          }

          // Get the file as a stream
          const stream = await minioClient.getObject(BUCKET_NAME, path);
          
          // Convert stream to buffer
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          
          // Convert to base64
          const base64 = buffer.toString('base64');

          return reply.send({
            success: true,
            message: 'File downloaded successfully as base64',
            data: {
              filename: fileName,
              extension: fileExtension,
              size: fileSize,
              type: contentType,
              base64: base64,
              path: path
            }
          });
        } catch (error: any) {
          console.error('Error downloading document as base64:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          if (error.code === 'NotFound') {
            return reply.status(404).send({
              error: 'File not found'
            });
          }
          
          if (error.code === 'NoSuchBucket') {
            return reply.status(500).send({
              error: 'Storage bucket not found'
            });
          }
          
          return reply.status(500).send({
            error: 'Failed to download file as base64'
          });
        }
      }
    );

  // Get all document types
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/tipos',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Obtener todos los tipos de documentos',
          description: 'Recupera todos los tipos de documentos disponibles con sus requisitos',
          response: {
            200: z.object({
              success: z.boolean(),
              tipos_documentos: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                requiere_nro_pro_exp: z.boolean(),
                requiere_saf_exp: z.boolean(),
                requiere_numerar: z.boolean(),
                requiere_tramitar: z.boolean(),
                activo: z.boolean(),
                created_at: z.date(),
                updated_at: z.date(),
              })),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const tiposDocumentos = await prisma.tipos_documentos.findMany({
            where: {
              activo: true,
            },
            orderBy: {
              nombre: 'asc',
            },
          });

          return reply.send({
            success: true,
            tipos_documentos: tiposDocumentos,
          });
        } catch (error) {
          console.error('Error getting document types:', error);
          
          return reply.status(500).send({
            error: 'Failed to get document types',
          });
        }
      }
    );

  // Get document properties by ID
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/:documentoId',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Obtener propiedades de un documento',
          description: 'Recupera todas las propiedades y metadatos de un documento específico',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              documento: z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                tipo_mime: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                carpeta_id: z.number(),
                tipo_documento_id: z.number().nullable(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable(),
                usuario_creador: z.number(),
                subido_por: z.number(),
                eliminado: z.boolean(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                // Información relacionada
                carpeta: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  s3_path: z.string().nullable(),
                }),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
                subio_por: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
                proyecto: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                tipo_documento: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  requiere_nro_pro_exp: z.boolean(),
                  requiere_saf_exp: z.boolean(),
                  requiere_numerar: z.boolean(),
                  requiere_tramitar: z.boolean(),
                }).nullable(),
                version_actual: z.object({
                  id: z.number(),
                  numero_version: z.number(),
                  s3_path: z.string(),
                  s3_bucket_name: z.string().nullable().optional(),
                  tamano: z.number().nullable().optional(),
                  hash_integridad: z.string().nullable().optional(),
                  comentario: z.string().nullable().optional(),
                  fecha_creacion: z.date(),
                  activa: z.boolean(),
                  metadata: z.any().nullable().optional(),
                }).nullable().optional(),
                versiones: z.array(z.object({
                  id: z.number(),
                  numero_version: z.number(),
                  s3_path: z.string(),
                  s3_bucket_name: z.string().nullable().optional(),
                  tamano: z.number().nullable().optional(),
                  hash_integridad: z.string().nullable().optional(),
                  comentario: z.string().nullable().optional(),
                  fecha_creacion: z.date(),
                  activa: z.boolean(),
                  metadata: z.any().nullable().optional(),
                })),
              }),
            }),
            400: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;

          // Get document with all related information and current version
          const documento = await (prisma as any).documentos.findFirst({
            where: {
              id: documentoId,
            },
            include: {
              carpeta: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  s3_path: true,
                },
              },
              creador: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
              subio_por: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
              proyecto: {
                select: {
                  id: true,
                  nombre: true
                },
              },
              tipo_documento: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  requiere_nro_pro_exp: true,
                  requiere_saf_exp: true,
                  requiere_numerar: true,
                  requiere_tramitar: true,
                },
              },
              versiones: {
                orderBy: {
                  numero_version: 'desc',
                },
              },
            },
          });

          if (!documento) {
            throw new BadRequestError('Document not found');
          }

          return reply.send({
            success: true,
            documento: {
              id: documento.id,
              nombre_archivo: documento.nombre_archivo,
              extension: documento.extension,
              tipo_mime: documento.tipo_mime,
              descripcion: documento.descripcion,
              categoria: documento.categoria,
              estado: documento.estado,
              carpeta_id: documento.carpeta_id,
              tipo_documento_id: documento.tipo_documento_id,
              etiquetas: documento.etiquetas,
              proyecto_id: documento.proyecto_id,
              usuario_creador: documento.usuario_creador,
              subido_por: documento.subido_por,
              eliminado: documento.eliminado,
              fecha_creacion: documento.fecha_creacion,
              fecha_ultima_actualizacion: documento.fecha_ultima_actualizacion,
              carpeta: documento.carpeta,
              creador: documento.creador,
              subio_por: documento.subio_por,
              proyecto: documento.proyecto,
              tipo_documento: documento.tipo_documento,
              version_actual: documento.versiones && documento.versiones.length > 0 ? {
                id: documento.versiones[0].id,
                numero_version: documento.versiones[0].numero_version,
                s3_path: documento.versiones[0].s3_path,
                s3_bucket_name: documento.versiones[0].s3_bucket_name,
                tamano: documento.versiones[0].tamano ? Number(documento.versiones[0].tamano) : null,
                hash_integridad: documento.versiones[0].hash_integridad,
                comentario: documento.versiones[0].comentario,
                fecha_creacion: documento.versiones[0].fecha_creacion,
                activa: documento.versiones[0].activa,
                metadata: documento.versiones[0].metadata,
              } : null,
              versiones: documento.versiones.map(version => ({
                id: version.id,
                numero_version: version.numero_version,
                s3_path: version.s3_path,
                s3_bucket_name: version.s3_bucket_name,
                tamano: version.tamano ? Number(version.tamano) : null,
                hash_integridad: version.hash_integridad,
                comentario: version.comentario,
                fecha_creacion: version.fecha_creacion,
                activa: version.activa,
                metadata: version.metadata,
              })),
            },
          });

        } catch (error) {
          console.error('Error getting document properties:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to get document properties');
        }
      }
    );

  // Get document type by ID
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/documentos/tipos/:id',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Obtener un tipo de documento específico',
          description: 'Recupera un tipo de documento específico por su ID',
          params: z.object({
            id: z.string().transform((val) => parseInt(val)),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              tipo_documento: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                requiere_nro_pro_exp: z.boolean(),
                requiere_saf_exp: z.boolean(),
                requiere_numerar: z.boolean(),
                requiere_tramitar: z.boolean(),
                activo: z.boolean(),
                created_at: z.date(),
                updated_at: z.date(),
              }),
            }),
            404: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { id } = request.params;

          const tipoDocumento = await prisma.tipos_documentos.findFirst({
            where: {
              id: id,
              activo: true,
            },
          });

          if (!tipoDocumento) {
            return reply.status(404).send({
              error: 'Document type not found',
            });
          }

          return reply.send({
            success: true,
            tipo_documento: tipoDocumento,
          });
        } catch (error) {
          console.error('Error getting document type:', error);
          
          return reply.status(500).send({
            error: 'Failed to get document type',
          });
        }
      }
    );

  // Create new document type
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/documentos/tipos',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Crear un nuevo tipo de documento',
          description: 'Crea un nuevo tipo de documento con sus requisitos',
          body: z.object({
            nombre: z.string().min(1, 'Name is required'),
            descripcion: z.string().nullable().optional(),
            requiere_nro_pro_exp: z.boolean().default(false),
            requiere_saf_exp: z.boolean().default(false),
            requiere_numerar: z.boolean().default(false),
            requiere_tramitar: z.boolean().default(false),
          }),
          response: {
            201: z.object({
              success: z.boolean(),
              message: z.string(),
              tipo_documento: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                requiere_nro_pro_exp: z.boolean(),
                requiere_saf_exp: z.boolean(),
                requiere_numerar: z.boolean(),
                requiere_tramitar: z.boolean(),
                activo: z.boolean(),
                created_at: z.date(),
                updated_at: z.date(),
              }),
            }),
            400: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { nombre, descripcion, requiere_nro_pro_exp, requiere_saf_exp, requiere_numerar, requiere_tramitar } = request.body;

          // Check if document type with same name already exists
          const existingTipo = await prisma.tipos_documentos.findFirst({
            where: {
              nombre: nombre,
              activo: true,
            },
          });

          if (existingTipo) {
            return reply.status(400).send({
              error: 'Document type with this name already exists',
            });
          }

          const tipoDocumento = await prisma.tipos_documentos.create({
            data: {
              nombre,
              descripcion,
              requiere_nro_pro_exp,
              requiere_saf_exp,
              requiere_numerar,
              requiere_tramitar,
            },
          });

          return reply.status(201).send({
            success: true,
            message: 'Document type created successfully',
            tipo_documento: tipoDocumento,
          });
        } catch (error) {
          console.error('Error creating document type:', error);
          
          return reply.status(500).send({
            error: 'Failed to create document type',
          });
        }
      }
    );

  // Update document type
  app
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/documentos/tipos/:id',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Actualizar un tipo de documento',
          description: 'Actualiza un tipo de documento existente',
          params: z.object({
            id: z.string().transform((val) => parseInt(val)),
          }),
          body: z.object({
            nombre: z.string().min(1, 'Name is required').optional(),
            descripcion: z.string().nullable().optional(),
            requiere_nro_pro_exp: z.boolean().optional(),
            requiere_saf_exp: z.boolean().optional(),
            requiere_numerar: z.boolean().optional(),
            requiere_tramitar: z.boolean().optional(),
            activo: z.boolean().optional(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              tipo_documento: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                requiere_nro_pro_exp: z.boolean(),
                requiere_saf_exp: z.boolean(),
                requiere_numerar: z.boolean(),
                requiere_tramitar: z.boolean(),
                activo: z.boolean(),
                created_at: z.date(),
                updated_at: z.date(),
              }),
            }),
            404: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { id } = request.params;
          const updateData = request.body;

          // Check if document type exists
          const existingTipo = await prisma.tipos_documentos.findFirst({
            where: {
              id: id,
            },
          });

          if (!existingTipo) {
            return reply.status(404).send({
              error: 'Document type not found',
            });
          }

          // If name is being updated, check for duplicates
          if (updateData.nombre && updateData.nombre !== existingTipo.nombre) {
            const duplicateTipo = await prisma.tipos_documentos.findFirst({
              where: {
                nombre: updateData.nombre,
                id: { not: id },
                activo: true,
              },
            });

            if (duplicateTipo) {
              return reply.status(400).send({
                error: 'Document type with this name already exists',
              });
            }
          }

          const tipoDocumento = await prisma.tipos_documentos.update({
            where: {
              id: id,
            },
            data: updateData,
          });

          return reply.send({
            success: true,
            message: 'Document type updated successfully',
            tipo_documento: tipoDocumento,
          });
        } catch (error) {
          console.error('Error updating document type:', error);
          
          return reply.status(500).send({
            error: 'Failed to update document type',
          });
        }
      }
    );

  // Delete document type (soft delete)
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/documentos/tipos/:id',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Eliminar un tipo de documento',
          description: 'Elimina un tipo de documento (soft delete)',
          params: z.object({
            id: z.string().transform((val) => parseInt(val)),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { id } = request.params;

          // Check if document type exists
          const existingTipo = await prisma.tipos_documentos.findFirst({
            where: {
              id: id,
            },
          });

          if (!existingTipo) {
            return reply.status(404).send({
              error: 'Document type not found',
            });
          }

          // Check if document type is being used by any documents
          const documentosUsingTipo = await prisma.documentos.findFirst({
            where: {
              tipo_documento_id: id,
              eliminado: false,
            },
          });

          if (documentosUsingTipo) {
            return reply.status(400).send({
              error: 'Cannot delete document type that is being used by documents',
            });
          }

          // Soft delete by setting activo to false
          await prisma.tipos_documentos.update({
            where: {
              id: id,
            },
            data: {
              activo: false,
            },
          });

          return reply.send({
            success: true,
            message: 'Document type deleted successfully',
          });
        } catch (error) {
          console.error('Error deleting document type:', error);
          
          return reply.status(500).send({
            error: 'Failed to delete document type',
          });
        }
      }
    );

  // Edit document properties
  app
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/documentos/:documentoId',
      {
        schema: {
          tags: ['Documentos'],
          summary: 'Editar propiedades de un documento',
          description: 'Actualiza las propiedades de un documento existente',
          params: z.object({
            documentoId: z.string().uuid(),
          }),
          body: z.object({
            nombre_archivo: z.string().optional(),
            descripcion: z.string().nullable().optional(),
            categoria: z.string().nullable().optional(),
            estado: z.string().nullable().optional(),
            tipo_documento_id: z.number().nullable().optional(),
            etiquetas: z.array(z.string()).optional(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              documento: z.object({
                id: z.string(),
                nombre_archivo: z.string(),
                extension: z.string().nullable(),
                tipo_mime: z.string().nullable(),
                descripcion: z.string().nullable(),
                categoria: z.string().nullable(),
                estado: z.string().nullable(),
                carpeta_id: z.number(),
                tipo_documento_id: z.number().nullable(),
                etiquetas: z.array(z.string()),
                proyecto_id: z.number().nullable(),
                usuario_creador: z.number(),
                subido_por: z.number(),
                eliminado: z.boolean(),
                fecha_creacion: z.date(),
                fecha_ultima_actualizacion: z.date(),
                // Información relacionada
                carpeta: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  s3_path: z.string().nullable(),
                }),
                creador: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
                subio_por: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable(),
                }),
                proyecto: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                tipo_documento: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  requiere_nro_pro_exp: z.boolean(),
                  requiere_saf_exp: z.boolean(),
                  requiere_numerar: z.boolean(),
                  requiere_tramitar: z.boolean(),
                }).nullable(),
              }),
            }),
            400: z.object({
              error: z.string(),
            }),
            404: z.object({
              error: z.string(),
            }),
            500: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { documentoId } = request.params;
          const updateData = request.body;

          // Get document to check if it exists and is not deleted
          const existingDocumento = await (prisma as any).documentos.findFirst({
            where: {
              id: documentoId,
              eliminado: false,
            },
          });

          if (!existingDocumento) {
            throw new BadRequestError('Document not found or has been deleted');
          }

          // Validate tipo_documento_id if provided
          if (updateData.tipo_documento_id !== undefined && updateData.tipo_documento_id !== null) {
            const tipoDocumento = await (prisma as any).tipos_documentos.findFirst({
              where: {
                id: updateData.tipo_documento_id,
                activo: true,
              },
            });

            if (!tipoDocumento) {
              throw new BadRequestError('Document type not found or is not active');
            }
          }



          // Prepare update data
          const dataToUpdate: any = {
            ...updateData,
            fecha_ultima_actualizacion: new Date(),
          };

          // Update document
          const documentoActualizado = await (prisma as any).documentos.update({
            where: {
              id: documentoId,
            },
            data: dataToUpdate,
            include: {
              carpeta: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  s3_path: true,
                },
              },
              creador: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
              subio_por: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true,
                },
              },
              proyecto: {
                select: {
                  id: true,
                  nombre: true
                },
              },
              tipo_documento: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  requiere_nro_pro_exp: true,
                  requiere_saf_exp: true,
                  requiere_numerar: true,
                  requiere_tramitar: true,
                },
              },
            },
          });

          // Create audit record
          await (prisma as any).archivo_historial.create({
            data: {
              archivo_id: documentoId,
              usuario_id: 1, // Default user ID - should be passed as parameter
              accion: 'update',
              descripcion: 'Document properties updated',
            },
          });

          return reply.send({
            success: true,
            message: 'Document updated successfully',
            documento: {
              id: documentoActualizado.id,
              nombre_archivo: documentoActualizado.nombre_archivo,
              extension: documentoActualizado.extension,
              tipo_mime: documentoActualizado.tipo_mime,
              descripcion: documentoActualizado.descripcion,
              categoria: documentoActualizado.categoria,
              estado: documentoActualizado.estado,
              carpeta_id: documentoActualizado.carpeta_id,
              tipo_documento_id: documentoActualizado.tipo_documento_id,
              etiquetas: documentoActualizado.etiquetas,
              proyecto_id: documentoActualizado.proyecto_id,
              usuario_creador: documentoActualizado.usuario_creador,
              subido_por: documentoActualizado.subido_por,
              eliminado: documentoActualizado.eliminado,
              fecha_creacion: documentoActualizado.fecha_creacion,
              fecha_ultima_actualizacion: documentoActualizado.fecha_ultima_actualizacion,
              carpeta: documentoActualizado.carpeta,
              creador: documentoActualizado.creador,
              subio_por: documentoActualizado.subio_por,
              proyecto: documentoActualizado.proyecto,
              tipo_documento: documentoActualizado.tipo_documento,
            },
          });

        } catch (error) {
          console.error('Error updating document:', error);
          
          if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
            throw error;
          }
          
          throw new BadRequestError('Failed to update document');
        }
      }
    );

}

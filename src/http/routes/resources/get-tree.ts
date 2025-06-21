import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';
import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

console.log("MINIO_ENDPOINT")
console.log(process.env.MINIO_ENDPOINT)

const BUCKET_NAME = process.env.MINIO_BUCKET;

interface FileItem {
  name: string;
  type: 'file';
  size: number;
  lastModified: string;
  path: string;
}

interface FolderItem {
  name: string;
  type: 'folder';
  path: string;
  children: (FileItem | FolderItem)[];
}

interface FlatItem {
  name: string;
  size?: number;
  lastModified?: Date;
  isFolder: boolean;
  fullPath: string;
}

function buildTree(items: FlatItem[]): (FileItem | FolderItem)[] {
  const tree: (FileItem | FolderItem)[] = [];
  const pathMap = new Map<string, FolderItem>();

  // Separar archivos y carpetas, y crear estructura
  items.forEach(item => {
    const pathParts = item.fullPath.split('/').filter(part => part.length > 0);
    
    if (pathParts.length === 1 && !item.isFolder) {
      // Archivo en la raíz
      tree.push({
        name: item.name,
        type: 'file',
        size: item.size || 0,
        lastModified: item.lastModified?.toISOString() || '',
        path: item.fullPath
      });
    } else {
      // Crear estructura de carpetas
      let currentPath = '';
      let currentLevel = tree;
      
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (isLast && !item.isFolder) {
          // Es un archivo
          currentLevel.push({
            name: part,
            type: 'file',
            size: item.size || 0,
            lastModified: item.lastModified?.toISOString() || '',
            path: currentPath
          });
        } else {
          // Es una carpeta
          let folder = currentLevel.find(f => f.name === part && f.type === 'folder') as FolderItem;
          
          if (!folder) {
            folder = {
              name: part,
              type: 'folder',
              path: currentPath,
              children: []
            };
            currentLevel.push(folder);
            pathMap.set(currentPath, folder);
          }
          
          currentLevel = folder.children;
        }
      });
    }
  });

  return tree;
}

export async function getTree(app: FastifyInstance) {
  // Ruta para listar archivos de forma plana (original)
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/files',
      {
        schema: {
          tags: ['File Upload'],
          summary: 'List all files in bucket (flat structure)',
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
          const stream = minioClient.listObjects(BUCKET_NAME, '', true);
          const files = [];
          
          for await (const item of stream) {
            if (item.name && !item.name.endsWith('/')) {
              const stat = await minioClient.statObject(BUCKET_NAME, item.name);
              files.push({
                name: item.name,
                size: stat.size,
                lastModified: stat.lastModified.toISOString()
              });
            }
          }
          
          return reply.send({ files });
        } catch (error) {
          console.error(error);
          throw new BadRequestError('Failed to list files');
        }
      }
    );

  // Nueva ruta para listar archivos de forma estructurada
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/files/tree',
      {
        schema: {
          tags: ['File Upload'],
          summary: 'List all files and folders in bucket (tree structure)',
          querystring: z.object({
            prefix: z.string().optional().describe('Prefix to filter objects')
          }),
          response: {
            200: z.object({
              tree: z.array(z.union([
                z.object({
                  name: z.string(),
                  type: z.literal('file'),
                  size: z.number(),
                  lastModified: z.string(),
                  path: z.string()
                }),
                z.object({
                  name: z.string(),
                  type: z.literal('folder'),
                  path: z.string(),
                  children: z.array(z.any()) // Recursivo
                })
              ]))
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { prefix = '' } = request.query as { prefix?: string };
          const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
          const items: FlatItem[] = [];
          
          // Primero, recopilar todos los objetos
          for await (const item of stream) {
            if (item.name) {
              if (item.name.endsWith('/')) {
                // Es una carpeta
                items.push({
                  name: item.name.slice(0, -1).split('/').pop() || '',
                  isFolder: true,
                  fullPath: item.name.slice(0, -1)
                });
              } else {
                // Es un archivo
                try {
                  const stat = await minioClient.statObject(BUCKET_NAME, item.name);
                  items.push({
                    name: item.name.split('/').pop() || '',
                    size: stat.size,
                    lastModified: stat.lastModified,
                    isFolder: false,
                    fullPath: item.name
                  });
                } catch (statError) {
                  console.warn(`Could not get stats for ${item.name}:`, statError);
                  // Incluir el archivo sin stats
                  items.push({
                    name: item.name.split('/').pop() || '',
                    size: 0,
                    isFolder: false,
                    fullPath: item.name
                  });
                }
              }
            }
          }

          // Construir el árbol
          const tree = buildTree(items);
          
          return reply.send({ tree });
        } catch (error) {
          console.error(error);
          throw new BadRequestError('Failed to list files in tree structure');
        }
      }
    );

  // Ruta para listar contenido de una carpeta específica
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/files/folder/:path',
      {
        schema: {
          tags: ['File Management'],
          summary: 'List contents of a specific folder',
          params: z.object({
            path: z.string().describe('Folder path (use "root" for root folder)')
          }),
          response: {
            200: z.object({
              folder: z.string(),
              contents: z.array(z.union([
                z.object({
                  name: z.string(),
                  type: z.literal('file'),
                  size: z.number(),
                  lastModified: z.string(),
                  path: z.string()
                }),
                z.object({
                  name: z.string(),
                  type: z.literal('folder'),
                  path: z.string()
                })
              ]))
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { path } = request.params as { path: string };
          const folderPath = path === 'root' ? '' : `${path}/`;
          
          // Listar objetos con el prefijo de la carpeta, pero sin recursión
          const stream = minioClient.listObjects(BUCKET_NAME, folderPath, false);
          const contents: any[] = [];
          
          for await (const item of stream) {
            if (item.name && item.name !== folderPath) {
              const itemName = item.name.replace(folderPath, '');
              
              if (item.name.endsWith('/')) {
                // Es una subcarpeta
                contents.push({
                  name: itemName.slice(0, -1),
                  type: 'folder',
                  path: item.name.slice(0, -1)
                });
              } else {
                // Es un archivo
                try {
                  const stat = await minioClient.statObject(BUCKET_NAME, item.name);
                  contents.push({
                    name: itemName,
                    type: 'file',
                    size: stat.size,
                    lastModified: stat.lastModified.toISOString(),
                    path: item.name
                  });
                } catch (statError) {
                  console.warn(`Could not get stats for ${item.name}:`, statError);
                  contents.push({
                    name: itemName,
                    type: 'file',
                    size: 0,
                    lastModified: new Date().toISOString(),
                    path: item.name
                  });
                }
              }
            }
          }
          
          return reply.send({ 
            folder: path === 'root' ? '/' : path,
            contents 
          });
        } catch (error) {
          console.error(error);
          throw new BadRequestError('Failed to list folder contents');
        }
      }
    );
}
import { prisma } from '@/lib/prisma';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';


export async function createProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/profiles',
      {
        schema: {
          tags: ['User Profiles'],
          summary: 'Create a new profile',
          body: z.object({
            nombre: z.string().min(1).max(50),
            descripcion: z.string().optional(),
          }),
          response: {
            201: z.object({
              message: z.string(),
              profile: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { nombre, descripcion } = request.body;

        // Check if profile with the same name already exists
        const existingProfile = await prisma.perfiles.findFirst({
          where: { nombre },
        });

        if (existingProfile) {
          throw new BadRequestError('Profile with this name already exists');
        }

        // Create the new profile
        const profile = await prisma.perfiles.create({
          data: {
            nombre,
            descripcion,
          },
        });

        return reply.status(201).send({
          message: 'Profile created successfully',
          profile,
        });
      }
    );
}
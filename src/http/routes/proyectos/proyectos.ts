import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';

export async function proyectosRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    .post('/proyectos', {
      schema: {
        tags: ['Proyectos'],
        body: z.object({
          // Campos de proyecto
          nombre: z.string().max(255),
          etapa_registro_id: z.number(),
          carpeta_inicial: z.any().optional(),
          //estado: z.string().max(50).optional(),
          //fecha_inicio: z.string().date().optional(),
          //fecha_termino: z.string().date().optional(),
          division_id: z.number().optional(),
          departamento_id: z.number().optional(),
          unidad_id: z.number().optional(),
          creado_por: z.number(),
          
          // Campos de etapas_registro (opcional, para crear una nueva etapa)
          etapa_registro: z.object({
            etapa_tipo_id: z.number(),
            tipo_iniciativa_id: z.number(),
            tipo_obra_id: z.number().optional(),
            region_id: z.number().optional(),
            provincia_id: z.number().optional(),
            comuna_id: z.number().optional(),
            volumen: z.string().optional(),
            presupuesto_oficial: z.string().optional(),
            fecha_llamado_licitacion: z.string().datetime().optional(),
            fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
            fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
            
            decreto_adjudicacion: z.string().optional(),
            sociedad_concesionaria: z.string().max(255).optional(),

            fecha_inicio_concesion: z.string().datetime().optional(),
            plazo_total_meses: z.string().optional(),
            
            inspector_fiscal_id: z.number().optional(),
            usuario_creador: z.number()
          })
        }),
        response: {
          201: z.object({
            id: z.number(),
            nombre: z.string()
          })
        }
      }
    }, async (request, reply) => {
      // Si se incluye información de etapa_registro, primero crear la etapa
      let etapaRegistroId = request.body.etapa_registro_id;
      
      if (request.body.etapa_registro) {
        const nuevaEtapa = await prisma.etapas_registro.create({
          data: {
            ...request.body.etapa_registro,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            activa: true
          }
        });
        etapaRegistroId = nuevaEtapa.id;
      }

      delete request.body.etapa_registro;

      // Crear el proyecto
      const proyecto = await prisma.proyectos.create({
        data: {
          ...request.body,
          etapa_registro_id: etapaRegistroId,
          created_at: new Date()
        }
      });
      
      return reply.status(201).send({
        id: proyecto.id,
        nombre: proyecto.nombre
      });
    })

    .get('/proyectos', {
      schema: {
        tags: ['Proyectos'],
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              created_at: z.date(),
              
              // Solo etapa_tipo
              etapa_registro: z.object({
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string()
                })
              }),
              
              // Solo creador
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable()
              })
            }))
          })
        }
      }
    }, async () => {
      const proyectos = await prisma.proyectos.findMany({
        select: {
          id: true,
          nombre: true,
          created_at: true,
          etapa_registro: {
            select: {
              etapa_tipo: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          creador: {
            select: {
              id: true,
              nombre_completo: true
            }
          }
        }
      });
      
      return {
        success: true,
        message: 'Lista de proyectos obtenida exitosamente',
        data: proyectos
      };
    })

    .get('/proyectos/:id', {
      schema: {
        tags: ['Proyectos'],
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              nombre: z.string(),
              carpeta_inicial: z.any().nullable(),
              created_at: z.date(),
              
              // Relaciones
              etapa_registro: z.object({
                id: z.number(),
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable()
                }),
                tipo_iniciativa: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                tipo_obra: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                region: z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string(),
                  nombre_corto: z.string().nullable()
                }).nullable(),
                provincia: z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string()
                }).nullable(),
                comuna: z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string()
                }).nullable(),
                volumen: z.string().nullable(),
                presupuesto_oficial: z.string().nullable(),
                fecha_llamado_licitacion: z.date().nullable(),
                fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
                fecha_apertura_ofertas_economicas: z.date().nullable(),
                decreto_adjudicacion: z.string().nullable(),
                sociedad_concesionaria: z.string().nullable(),
                fecha_inicio_concesion: z.date().nullable(),
                plazo_total_meses: z.string().nullable(),
                inspector_fiscal: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable()
                }).nullable(),
                fecha_creacion: z.date(),
                fecha_actualizacion: z.date(),
                activa: z.boolean()
              }),
              division: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable()
              }).nullable(),
              departamento: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable()
              }).nullable(),
              unidad: z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable()
              }).nullable(),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable(),
                correo_electronico: z.string().nullable()
              })
            })
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      
      const proyecto = await prisma.proyectos.findUnique({
        where: { id },
        include: {
          etapa_registro: {
            include: {
              etapa_tipo: true,
              tipo_iniciativa: true,
              tipo_obra: true,
              region: true,
              provincia: true,
              comuna: true,
              inspector_fiscal: {
                select: {
                  id: true,
                  nombre_completo: true,
                  correo_electronico: true
                }
              }
            }
          },
          division: true,
          departamento: true,
          unidad: true,
          creador: {
            select: {
              id: true,
              nombre_completo: true,
              correo_electronico: true
            }
          }
        }
      });
      
      if (!proyecto) {
        return reply.status(404).send({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }
      
      return {
        success: true,
        message: 'Proyecto obtenido exitosamente',
        data: proyecto
      };
    });
}
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';
import { MinIOUtils, FolderStructure, CarpetaInicial, EtapaTipoCarpetas, NestedFolderStructure } from '@/utils/minio-utils';
import { CarpetaDBUtils } from '@/utils/carpeta-db-utils';

export async function proyectosRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>()
    .post('/proyectos', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Crear un nuevo proyecto',
        description: 'Crea un nuevo proyecto con su estructura de carpetas inicial y etapa de registro. El endpoint permite crear carpetas en MinIO y registros en la base de datos de forma automática. Soporta tanto estructuras planas como anidadas para carpetas iniciales.',
        body: z.object({
          // Campos de proyecto
          nombre: z.string().max(255),
          carpeta_inicial: z.union([
            // Old flat structure
            z.object({
              carpetas: z.array(z.object({
                nombre: z.string()
              }))
            }),
            // New nested structure
            z.record(z.any())
          ]).optional(),
          //estado: z.string().max(50).optional(),
          //fecha_inicio: z.string().date().optional(),
          //fecha_termino: z.string().date().optional(),
          division_id: z.number().optional(),
          departamento_id: z.number().optional(),
          unidad_id: z.number().optional(),
          creado_por: z.number(),
          
          // Campos de etapas_registro (opcional, para crear una nueva etapa)
          etapas_registro: z.object({
            etapa_tipo_id: z.number(),
            tipo_iniciativa_id: z.number(),
            tipo_obra_id: z.number().optional(),
            region_id: z.number().optional(),
            provincia_id: z.number().optional(),
            comuna_id: z.number().optional(),
            volumen: z.string().optional(),
            presupuesto_oficial: z.string().optional(),
            valor_referencia: z.string().max(255).optional(),
            bip: z.string().optional(),
            fecha_llamado_licitacion: z.string().datetime().optional(),
            fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
            fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
            
            decreto_adjudicacion: z.string().optional(),
            sociedad_concesionaria: z.string().max(255).optional(),

            fecha_inicio_concesion: z.string().datetime().optional(),
            plazo_total_concesion: z.string().optional(),
            
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
      // Crear el proyecto primero
      const { etapas_registro, ...datosProyecto } = request.body;
      
      const proyecto = await prisma.proyectos.create({
        data: {
          nombre: datosProyecto.nombre,
          carpeta_inicial: datosProyecto.carpeta_inicial,
          division_id: datosProyecto.division_id,
          departamento_id: datosProyecto.departamento_id,
          unidad_id: datosProyecto.unidad_id,
          creado_por: datosProyecto.creado_por
        }
      });

      // Si se incluye información de etapas_registro, crear la etapa después del proyecto
      let etapaTipoId = null;
      if (etapas_registro) {
        etapaTipoId = etapas_registro.etapa_tipo_id;
        await prisma.etapas_registro.create({
          data: {
            etapa_tipo_id: etapas_registro.etapa_tipo_id,
            proyecto_id: proyecto.id,
            tipo_iniciativa_id: etapas_registro.tipo_iniciativa_id,
            tipo_obra_id: etapas_registro.tipo_obra_id,
            region_id: etapas_registro.region_id,
            provincia_id: etapas_registro.provincia_id,
            comuna_id: etapas_registro.comuna_id,
            volumen: etapas_registro.volumen,
            presupuesto_oficial: etapas_registro.presupuesto_oficial,
            valor_referencia: etapas_registro.valor_referencia,
            bip: etapas_registro.bip,
            fecha_llamado_licitacion: etapas_registro.fecha_llamado_licitacion,
            fecha_recepcion_ofertas_tecnicas: etapas_registro.fecha_recepcion_ofertas_tecnicas,
            fecha_apertura_ofertas_economicas: etapas_registro.fecha_apertura_ofertas_economicas,
            decreto_adjudicacion: etapas_registro.decreto_adjudicacion,
            sociedad_concesionaria: etapas_registro.sociedad_concesionaria,
            fecha_inicio_concesion: etapas_registro.fecha_inicio_concesion,
            plazo_total_concesion: etapas_registro.plazo_total_concesion,
            inspector_fiscal_id: etapas_registro.inspector_fiscal_id,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            activa: true,
            usuario_creador: request.body.creado_por
          }
        });
      }

      // Crear carpetas en MinIO y registros en la base de datos
      try {
        // Crear la carpeta principal del proyecto
        const projectFolderPath = await MinIOUtils.createProjectFolder(proyecto.nombre, proyecto.id);
        console.log(`Project folder created in MinIO: ${projectFolderPath}`);
        
        // Crear registro de carpeta raíz en la base de datos
        let carpetaRaiz = null;
        try {
          console.log(`Creating root folder for project "${proyecto.nombre}" with ID: ${proyecto.id}`);
          carpetaRaiz = await CarpetaDBUtils.createProjectRootFolder(
            proyecto.id,
            proyecto.nombre,
            projectFolderPath,
            datosProyecto.creado_por
          );
          console.log('Project root folder DB record created successfully with S3 data:', {
            id: carpetaRaiz.id,
            nombre: carpetaRaiz.nombre, // Show the folder name (should be project name)
            s3_path: carpetaRaiz.s3_path,
            s3_bucket_name: carpetaRaiz.s3_bucket_name,
            s3_created: carpetaRaiz.s3_created,
            proyecto_id: carpetaRaiz.proyecto_id
          });
        } catch (dbError) {
          console.error('❌ Error creating project root folder DB record:', dbError);
          console.error('Error details:', {
            message: dbError.message,
            code: dbError.code,
            meta: dbError.meta
          });
          // Don't continue if root folder creation fails - this is critical
          throw new Error(`Failed to create project root folder: ${dbError.message}`);
        }

        // Si hay carpeta_inicial, crear las carpetas iniciales
        if (datosProyecto.carpeta_inicial && typeof datosProyecto.carpeta_inicial === 'object') {
          console.log('Creating initial folders for project:', proyecto.nombre);
          console.log('Initial folder structure:', JSON.stringify(datosProyecto.carpeta_inicial, null, 2));
          
          try {
            // Crear carpetas en MinIO
            await MinIOUtils.createInitialFolders(projectFolderPath, datosProyecto.carpeta_inicial as CarpetaInicial | NestedFolderStructure);
            console.log('Initial folders created successfully in MinIO for project:', proyecto.nombre);
            
            // Crear registros en la base de datos
            const initialFolders = await CarpetaDBUtils.createInitialFoldersDB(
              proyecto.id,
              projectFolderPath,
              datosProyecto.carpeta_inicial,
              datosProyecto.creado_por,
              carpetaRaiz?.id,
              etapaTipoId
            );
            console.log(`Initial folders DB records created successfully for project: ${proyecto.nombre}. Created ${initialFolders.length} folders with S3 data.`);
          } catch (folderError) {
            console.error('Error creating initial folders:', folderError);
            // Continue with project creation even if folder creation fails
          }
        }

        // Obtener y crear carpetas del tipo de etapa si existe
        if (etapas_registro && etapas_registro.etapa_tipo_id) {
          try {
            console.log('Fetching etapa tipo folders for etapa_tipo_id:', etapas_registro.etapa_tipo_id);
            
            const etapaTipo = await prisma.etapas_tipo.findUnique({
              where: { id: etapas_registro.etapa_tipo_id },
              select: {
                id: true,
                nombre: true,
                carpetas_iniciales: true
              }
            });

            if (etapaTipo && etapaTipo.carpetas_iniciales) {
              console.log('Etapa tipo found:', etapaTipo.nombre);
              console.log('Etapa tipo carpetas_iniciales:', JSON.stringify(etapaTipo.carpetas_iniciales, null, 2));
              
              // Crear carpetas en MinIO
              await MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
                carpetas_iniciales: etapaTipo.carpetas_iniciales
              } as EtapaTipoCarpetas);
              console.log('Etapa tipo folders created successfully in MinIO for project:', proyecto.nombre);
              
              // Crear registros en la base de datos
              const etapaTipoFolders = await CarpetaDBUtils.createEtapaTipoFoldersDB(
                proyecto.id,
                projectFolderPath,
                {
                  carpetas_iniciales: etapaTipo.carpetas_iniciales
                },
                datosProyecto.creado_por,
                carpetaRaiz?.id,
                etapaTipoId
              );
              console.log(`Etapa tipo folders DB records created successfully for project: ${proyecto.nombre}. Created ${etapaTipoFolders.length} folders with S3 data.`);
            } else {
              console.log('No carpetas_iniciales found for etapa_tipo_id:', etapas_registro.etapa_tipo_id);
            }
          } catch (etapaTipoError) {
            console.error('Error creating etapa tipo folders:', etapaTipoError);
            // Continue with project creation even if etapa tipo folder creation fails
          }
        }
        
        console.log(`Project folders and DB records created successfully for project: ${proyecto.nombre}`);
        console.log(`S3 bucket used: ${process.env.MINIO_BUCKET || 'gestor-files'}`);
      } catch (error) {
        console.error('Error creating project folders and DB records:', error);
        // No throw error here to avoid failing the project creation
        // The folders can be created later manually if needed
      }
      
      return reply.status(201).send({
        id: proyecto.id,
        nombre: proyecto.nombre
      });
    })

    .get('/proyectos', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener lista de proyectos',
        description: 'Retorna una lista paginada de todos los proyectos con información básica incluyendo el tipo de etapa más reciente, el creador y la carpeta raíz.',
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              created_at: z.date(),
              carpeta_raiz_id: z.number().nullable(),
              
              // Solo etapa_tipo
              etapas_registro: z.array(z.object({
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string()
                })
              })),
              
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
          carpeta_raiz_id: true,
          etapas_registro: {
            take: 1,
            orderBy: {
              fecha_creacion: 'desc'
            },
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
        summary: 'Obtener proyecto por ID',
        description: 'Retorna la información completa de un proyecto específico incluyendo todas sus etapas de registro, relaciones con divisiones, departamentos, unidades y creador.',
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
              carpeta_raiz_id: z.number().nullable(),
              created_at: z.date(),
              
              // Relaciones
              etapas_registro: z.array(z.object({
                id: z.number(),
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  color: z.string().nullable()
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
                plazo_total_concesion: z.string().nullable(),
                inspector_fiscal: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable()
                }).nullable(),
                fecha_creacion: z.date(),
                fecha_actualizacion: z.date(),
                activa: z.boolean()
              })),
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
        select: {
          id: true,
          nombre: true,
          carpeta_inicial: true,
          carpeta_raiz_id: true,
          created_at: true,
          etapas_registro: {
            take: 1,
            orderBy: {
              fecha_creacion: 'desc'
            },
            include: {
              etapa_tipo: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  color: true
                }
              },
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
    })

    .put('/proyectos/:id', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Actualizar proyecto existente',
        description: 'Actualiza la información de un proyecto existente. Permite modificar datos básicos del proyecto y crear o actualizar etapas de registro asociadas.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          nombre: z.string().max(255).optional(),
          carpeta_inicial: z.union([
            // Old flat structure
            z.object({
              carpetas: z.array(z.object({
                nombre: z.string()
              }))
            }),
            // New nested structure
            z.record(z.any())
          ]).optional(),
          division_id: z.number().optional(),
          departamento_id: z.number().optional(),
          unidad_id: z.number().optional(),
          
          // Campos de etapas_registro (opcional, para actualizar la etapa existente)
          etapas_registro: z.object({
            etapa_tipo_id: z.number(),
            tipo_iniciativa_id: z.number().optional(),
            tipo_obra_id: z.number().optional(),
            region_id: z.number().optional(),
            provincia_id: z.number().optional(),
            comuna_id: z.number().optional(),
            volumen: z.string().optional(),
            presupuesto_oficial: z.string().optional(),
            valor_referencia: z.string().max(255).optional(),
            bip: z.string().optional(),
            fecha_llamado_licitacion: z.string().datetime().optional(),
            fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
            fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
            
            decreto_adjudicacion: z.string().optional(),
            sociedad_concesionaria: z.string().max(255).optional(),

            fecha_inicio_concesion: z.string().datetime().optional(),
            plazo_total_concesion: z.string().optional(),
            
            inspector_fiscal_id: z.number().optional()
          }).optional()
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              nombre: z.string()
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
      
      // Verificar que el proyecto existe
      const proyectoExistente = await prisma.proyectos.findUnique({
        where: { id },
        include: {
          etapas_registro: true
        }
      });
      
      if (!proyectoExistente) {
        return reply.status(404).send({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      // Preparar datos para actualizar el proyecto
      const { etapas_registro, ...datosProyecto } = request.body;

      // Actualizar el proyecto
      const proyectoActualizado = await prisma.proyectos.update({
        where: { id },
        data: datosProyecto
      });

      console.log("proyecto actualizado");
      console.log(request.body);

      // Si se incluye información de etapas_registro
      if (etapas_registro) {
        // Buscar si ya existe un registro de etapa con el etapa_tipo_id para este proyecto
        const etapaExistente = await prisma.etapas_registro.findFirst({
          where: {
            proyecto_id: id,
            etapa_tipo_id: etapas_registro.etapa_tipo_id,
            activa: true
          }
        });

        console.log(" etapas existente");
        console.log(etapaExistente);


        console.log("proyecto_id");
        console.log(id);

        if (etapaExistente) {
          // Si existe, actualizar el registro existente
          console.log("actualizar");
          await prisma.etapas_registro.update({
            where: { id: etapaExistente.id },
            data: {
              ...etapas_registro,
              fecha_actualizacion: new Date()
            }
          });
        } else {
          // Si no existe, crear un nuevo registro
          console.log("crear");
          await prisma.etapas_registro.create({
            data: {
              etapa_tipo_id: etapas_registro.etapa_tipo_id,
              proyecto_id: id,
              tipo_iniciativa_id: etapas_registro.tipo_iniciativa_id,
              tipo_obra_id: etapas_registro.tipo_obra_id,
              region_id: etapas_registro.region_id,
              provincia_id: etapas_registro.provincia_id,
              comuna_id: etapas_registro.comuna_id,
              volumen: etapas_registro.volumen,
              presupuesto_oficial: etapas_registro.presupuesto_oficial,
              valor_referencia: etapas_registro.valor_referencia,
              bip: etapas_registro.bip,
              fecha_llamado_licitacion: etapas_registro.fecha_llamado_licitacion,
              fecha_recepcion_ofertas_tecnicas: etapas_registro.fecha_recepcion_ofertas_tecnicas,
              fecha_apertura_ofertas_economicas: etapas_registro.fecha_apertura_ofertas_economicas,
              decreto_adjudicacion: etapas_registro.decreto_adjudicacion,
              sociedad_concesionaria: etapas_registro.sociedad_concesionaria,
              fecha_inicio_concesion: etapas_registro.fecha_inicio_concesion,
              plazo_total_concesion: etapas_registro.plazo_total_concesion,
              inspector_fiscal_id: etapas_registro.inspector_fiscal_id,
              fecha_creacion: new Date(),
              fecha_actualizacion: new Date(),
              activa: true,
              usuario_creador: proyectoExistente.creado_por
            }
          });
        }
      }
      
      return reply.status(200).send({
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: {
          id: proyectoActualizado.id,
          nombre: proyectoActualizado.nombre
        }
      });
    })

    .get('/proyectos/:id/carpetas', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener carpetas del proyecto',
        description: 'Retorna la estructura de carpetas asociada a un proyecto específico, incluyendo carpetas padre e hijas con su información de organización.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              descripcion: z.string().nullable(),
              s3_path: z.string(),
              s3_bucket_name: z.string().nullable(),
              orden_visualizacion: z.number(),
              fecha_creacion: z.date(),
              carpeta_padre_id: z.number().nullable(),
              carpetas_hijas: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                s3_path: z.string(),
                orden_visualizacion: z.number()
              }))
            }))
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      
      // Verificar que el proyecto existe
      const proyecto = await prisma.proyectos.findUnique({
        where: { id }
      });
      
      if (!proyecto) {
        return reply.status(404).send({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      try {
        // Obtener carpetas del proyecto
        const carpetas = await CarpetaDBUtils.getProjectFolders(id);
        
        return {
          success: true,
          message: 'Carpetas del proyecto obtenidas exitosamente',
          data: carpetas
        };
      } catch (error) {
        console.error('Error getting project folders:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al obtener las carpetas del proyecto'
        });
      }
    })

    .patch('/proyectos/:id/cambiar-etapa', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Cambia la etapa activa de un proyecto',
        description: 'Cambia la etapa activa de un proyecto. Desactiva la etapa actual y activa la nueva etapa especificada. Incluye validación para asegurar que solo una etapa esté activa por proyecto.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          etapa_tipo_id: z.number().int().min(1, 'ID de tipo de etapa es requerido'),
          tipo_iniciativa_id: z.number().int().min(1).optional(),
          tipo_obra_id: z.number().int().min(1).optional(),
          region_id: z.number().int().min(1).optional(),
          provincia_id: z.number().int().min(1).optional(),
          comuna_id: z.number().int().min(1).optional(),
          volumen: z.string().optional(),
          presupuesto_oficial: z.string().optional(),
          valor_referencia: z.string().max(255).optional(),
          bip: z.string().optional(),
          fecha_llamado_licitacion: z.string().datetime().optional(),
          fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
          fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
          decreto_adjudicacion: z.string().optional(),
          sociedad_concesionaria: z.string().max(255).optional(),
          fecha_inicio_concesion: z.string().datetime().optional(),
          plazo_total_concesion: z.string().optional(),
          inspector_fiscal_id: z.number().int().min(1).optional(),
          usuario_creador: z.number().int().min(1, 'Usuario creador es requerido')
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              proyecto_id: z.number(),
              etapa_anterior: z.object({
                id: z.number(),
                etapa_tipo_id: z.number(),
                nombre_etapa: z.string()
              }).nullable(),
              etapa_nueva: z.object({
                id: z.number(),
                etapa_tipo_id: z.number(),
                nombre_etapa: z.string()
              })
            })
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      const body = request.body;
      
      try {
        // Verificar que el proyecto existe
        const proyecto = await prisma.proyectos.findUnique({
          where: { id },
          include: {
            etapas_registro: {
              where: { activa: true },
              include: {
                etapa_tipo: true
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

        // Verificar que el tipo de etapa existe
        const etapaTipo = await prisma.etapas_tipo.findUnique({
          where: { id: body.etapa_tipo_id }
        });

        if (!etapaTipo) {
          return reply.status(400).send({
            success: false,
            message: 'Tipo de etapa no encontrado'
          });
        }

        // Prohibir cambiar a una etapa ya existente para este proyecto
        const etapaExistente = await prisma.etapas_registro.findFirst({
          where: {
            proyecto_id: id,
            etapa_tipo_id: body.etapa_tipo_id
          }
        });
        if (etapaExistente) {
          return reply.status(400).send({
            success: false,
            message: `Ya existe un registro con el tipo de etapa "${etapaTipo.nombre}" para este proyecto`
          });
        }

        // Obtener la etapa actual activa
        const etapaActual = proyecto.etapas_registro[0]; // Solo debería haber una activa

        // Desactivar la etapa actual si existe
        if (etapaActual) {
          await prisma.etapas_registro.update({
            where: { id: etapaActual.id },
            data: { activa: false }
          });
        }

        // Crear la nueva etapa
        const nuevaEtapa = await prisma.etapas_registro.create({
          data: {
            etapa_tipo_id: body.etapa_tipo_id,
            proyecto_id: id,
            tipo_iniciativa_id: body.tipo_iniciativa_id,
            tipo_obra_id: body.tipo_obra_id,
            region_id: body.region_id,
            provincia_id: body.provincia_id,
            comuna_id: body.comuna_id,
            volumen: body.volumen,
            presupuesto_oficial: body.presupuesto_oficial,
            valor_referencia: body.valor_referencia,
            bip: body.bip,
            fecha_llamado_licitacion: body.fecha_llamado_licitacion ? new Date(body.fecha_llamado_licitacion) : null,
            fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas ? new Date(body.fecha_recepcion_ofertas_tecnicas) : null,
            fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas ? new Date(body.fecha_apertura_ofertas_economicas) : null,
            decreto_adjudicacion: body.decreto_adjudicacion,
            sociedad_concesionaria: body.sociedad_concesionaria,
            fecha_inicio_concesion: body.fecha_inicio_concesion ? new Date(body.fecha_inicio_concesion) : null,
            plazo_total_concesion: body.plazo_total_concesion,
            inspector_fiscal_id: body.inspector_fiscal_id,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            activa: true,
            usuario_creador: body.usuario_creador
          },
          include: {
            etapa_tipo: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                color: true,
                carpetas_iniciales: true
              }
            }
          }
        });

        // Crear carpetas iniciales de la nueva etapa si existen
        try {
          console.log('Creating initial folders for new etapa:', nuevaEtapa.etapa_tipo.nombre);
          
          // Obtener información del proyecto para crear las carpetas
          const proyectoInfo = await prisma.proyectos.findUnique({
            where: { id },
            select: {
              nombre: true,
              carpeta_raiz_id: true
            }
          });

          if (proyectoInfo && nuevaEtapa.etapa_tipo.carpetas_iniciales) {
            console.log('Etapa tipo carpetas_iniciales found:', JSON.stringify(nuevaEtapa.etapa_tipo.carpetas_iniciales, null, 2));
            
            // Crear la ruta base del proyecto en MinIO
            const projectFolderPath = await MinIOUtils.createProjectFolder(proyectoInfo.nombre, id);
            
            // Crear carpetas en MinIO
            await MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
              carpetas_iniciales: nuevaEtapa.etapa_tipo.carpetas_iniciales
            } as EtapaTipoCarpetas);
            console.log('Etapa tipo folders created successfully in MinIO for new etapa:', nuevaEtapa.etapa_tipo.nombre);
            
            // Crear registros en la base de datos
            const etapaTipoFolders = await CarpetaDBUtils.createEtapaTipoFoldersDB(
              id,
              projectFolderPath,
              {
                carpetas_iniciales: nuevaEtapa.etapa_tipo.carpetas_iniciales
              },
              body.usuario_creador,
              proyectoInfo.carpeta_raiz_id,
              body.etapa_tipo_id
            );
            console.log(`Etapa tipo folders DB records created successfully for new etapa: ${nuevaEtapa.etapa_tipo.nombre}. Created ${etapaTipoFolders.length} folders with S3 data.`);
          } else {
            console.log('No carpetas_iniciales found for new etapa_tipo_id:', body.etapa_tipo_id);
          }
        } catch (folderError) {
          console.error('Error creating etapa tipo folders for new etapa:', folderError);
          // Continue with etapa change even if folder creation fails
        }

        return reply.status(200).send({
          success: true,
          message: 'Etapa del proyecto cambiada exitosamente',
          data: {
            proyecto_id: id,
            etapa_anterior: etapaActual ? {
              id: etapaActual.id,
              etapa_tipo_id: etapaActual.etapa_tipo_id,
              nombre_etapa: etapaActual.etapa_tipo.nombre
            } : null,
            etapa_nueva: {
              id: nuevaEtapa.id,
              etapa_tipo_id: nuevaEtapa.etapa_tipo_id,
              nombre_etapa: nuevaEtapa.etapa_tipo.nombre
            }
          }
        });

      } catch (error) {
        console.error('Error changing project stage:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al cambiar la etapa del proyecto'
        });
      }
    })

    .get('/proyectos/:id/etapa-actual', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener la etapa actual del proyecto',
        description: 'Retorna la información completa de la etapa actualmente activa del proyecto, incluyendo todos los datos de la etapa y sus relaciones.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              proyecto_id: z.number(),
              etapa_actual: z.object({
                id: z.number(),
                etapa_tipo_id: z.number(),
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  descripcion: z.string().nullable(),
                  color: z.string().nullable()
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
                valor_referencia: z.string().nullable(),
                bip: z.string().nullable(),
                fecha_llamado_licitacion: z.date().nullable(),
                fecha_recepcion_ofertas_tecnicas: z.date().nullable(),
                fecha_apertura_ofertas_economicas: z.date().nullable(),
                decreto_adjudicacion: z.string().nullable(),
                sociedad_concesionaria: z.string().nullable(),
                fecha_inicio_concesion: z.date().nullable(),
                plazo_total_concesion: z.string().nullable(),
                inspector_fiscal: z.object({
                  id: z.number(),
                  nombre_completo: z.string().nullable(),
                  correo_electronico: z.string().nullable()
                }).nullable()
              }).nullable()
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
      
      try {
        // Verificar que el proyecto existe
        const proyecto = await prisma.proyectos.findUnique({
          where: { id }
        });
        
        if (!proyecto) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto no encontrado'
          });
        }

        // Obtener la etapa actual activa del proyecto
        const etapaActual = await prisma.etapas_registro.findFirst({
          where: {
            proyecto_id: id,
            activa: true
          },
          include: {
            etapa_tipo: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                color: true
              }
            },
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
        });

        return {
          success: true,
          message: 'Etapa actual del proyecto obtenida exitosamente',
          data: {
            proyecto_id: id,
            etapa_actual: etapaActual
          }
        };

      } catch (error) {
        console.error('Error getting current project stage:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al obtener la etapa actual del proyecto'
        });
      }
    });
}

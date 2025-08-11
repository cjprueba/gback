import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma';
import { MinIOUtils, FolderStructure, CarpetaInicial, EtapaTipoCarpetas, NestedFolderStructure } from '@/utils/minio-utils';
import { CarpetaDBUtils } from '@/utils/carpeta-db-utils';

// Helper function to extract all commune IDs from nested geographical structure
function extractComunaIdsFromNestedStructure(regiones: any[]): number[] {
  const comunaIds: number[] = [];
  
  regiones.forEach(region => {
    region.provincias.forEach((provincia: any) => {
      provincia.comunas.forEach((comuna: any) => {
        comunaIds.push(comuna.id);
      });
    });
  });
  
  return comunaIds;
}

// Helper function to transform flat geographical data into deeply nested hierarchical structure
function transformGeographicalData(etapasGeografia: any[]) {
  // Create a map of regions with their provinces and communes
  const regionsMap = new Map();
  
  // Process all geographical data from the unified table
  // Now each record represents a specific commune with its complete hierarchy
  etapasGeografia.forEach(etapaGeo => {
    const { region, provincia, comuna } = etapaGeo;
    
    // Ensure we have all the geographical data
    if (region && provincia && comuna) {
      // Add region if not exists
      if (!regionsMap.has(region.id)) {
        regionsMap.set(region.id, {
          ...region,
          etapas_provincias: []
        });
      }
      
      const regionData = regionsMap.get(region.id);
      
      // Add province if not exists
      let provinciaData = regionData.etapas_provincias.find((p: any) => p.provincia.id === provincia.id);
      if (!provinciaData) {
        provinciaData = {
          provincia: {
            ...provincia,
            etapas_comunas: []
          }
        };
        regionData.etapas_provincias.push(provinciaData);
      }
      
      // Add comuna if not exists
      if (!provinciaData.provincia.etapas_comunas.find((c: any) => c.comuna.id === comuna.id)) {
        provinciaData.provincia.etapas_comunas.push({
          comuna: comuna
        });
      }
    }
  });
  
  // Convert map to array
  return Array.from(regionsMap.values());
}

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
            // Nueva estructura anidada para datos geográficos
            regiones: z.array(z.object({
              id: z.number(),
              provincias: z.array(z.object({
                id: z.number(),
                comunas: z.array(z.object({
                  id: z.number()
                }))
              }))
            })).optional(),
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
        const etapaCreada = await prisma.etapas_registro.create({
          data: {
            etapa_tipo_id: etapas_registro.etapa_tipo_id,
            proyecto_id: proyecto.id,
            tipo_iniciativa_id: etapas_registro.tipo_iniciativa_id,
            tipo_obra_id: etapas_registro.tipo_obra_id,
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

        // Crear relaciones geográficas unificadas
        // Ahora cada registro representa una comuna específica con su jerarquía completa
        if (etapas_registro.regiones && etapas_registro.regiones.length > 0) {
          const comunaIds = extractComunaIdsFromNestedStructure(etapas_registro.regiones);
          const geographicalData = [];
          
          for (const comunaId of comunaIds) {
            // Obtener la información completa de la comuna para obtener su provincia y región
            const comuna = await prisma.comunas.findUnique({
              where: { id: comunaId },
              include: {
                provincia: {
                  include: {
                    region: true
                  }
                }
              }
            });
            
            if (comuna) {
              geographicalData.push({
                etapa_registro_id: etapaCreada.id,
                region_id: comuna.provincia.region.id,
                provincia_id: comuna.provincia.id,
                comuna_id: comuna.id
              });
            }
          }
          
          if (geographicalData.length > 0) {
            await prisma.etapas_geografia.createMany({
              data: geographicalData
            });
          }
        }
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

            // Obtener carpetas transversales asociadas a este tipo de etapa
            const carpetasTransversales = await (prisma as any).carpetas_transversales.findMany({
              where: {
                etapa_tipo_id: etapas_registro.etapa_tipo_id,
                activa: true
              },
              orderBy: {
                orden: 'asc'
              }
            });

            // Crear carpetas transversales si existen
            if (carpetasTransversales && carpetasTransversales.length > 0) {
              console.log(`Creating ${carpetasTransversales.length} transverse folders for etapa tipo: ${etapaTipo?.nombre}`);
              for (const carpetaTransversal of carpetasTransversales) {
                // Si la carpeta transversal tiene estructura_carpetas, crear las subcarpetas directamente en la raíz del proyecto
                if (carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object') {
                  console.log(`Creating transverse subfolders for: ${carpetaTransversal.nombre}`);
                  console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                  
                  try {
                    // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                    await MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas);
                    console.log(`Transverse subfolders created successfully in MinIO for: ${carpetaTransversal.nombre}`);
                    
                    // Crear registros en la base de datos para las subcarpetas
                    const subcarpetas = await CarpetaDBUtils.createNestedFolderStructureDB(
                      proyecto.id,
                      projectFolderPath,
                      carpetaTransversal.estructura_carpetas,
                      datosProyecto.creado_por,
                      carpetaRaiz?.id, // carpeta_padre_id será la carpeta raíz del proyecto
                      etapaTipo?.id,
                      'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                      carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                    );
                    console.log(`Transverse subfolders DB records created successfully for: ${carpetaTransversal.nombre}. Created ${subcarpetas.length} subfolders.`);
                  } catch (subfolderError) {
                    console.error(`Error creating transverse subfolders for ${carpetaTransversal.nombre}:`, subfolderError);
                    // Continue with other folders even if subfolder creation fails
                  }
                }
              }
              console.log(`Transverse folders created successfully for project: ${proyecto.nombre}`);
            }

            if (etapaTipo && etapaTipo.carpetas_iniciales) {
              console.log('Etapa tipo found:', etapaTipo.nombre);
              console.log('Etapa tipo carpetas_iniciales:', JSON.stringify(etapaTipo.carpetas_iniciales, null, 2));
              // Crear carpetas en MinIO
              await MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
                carpetas_iniciales: etapaTipo.carpetas_iniciales
              } as EtapaTipoCarpetas);
              console.log('Etapa tipo folders created successfully in MinIO for project:', proyecto.nombre);
              // Crear registros en la base de datos
              await CarpetaDBUtils.createEtapaTipoFoldersDB(
                proyecto.id,
                projectFolderPath,
                { carpetas_iniciales: etapaTipo.carpetas_iniciales },
                datosProyecto.creado_por,
                carpetaRaiz?.id,
                etapaTipo.id
              );
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
        description: 'Retorna una lista paginada de todos los proyectos activos (no eliminados) incluyendo información básica, el tipo de etapa más reciente, el creador y la carpeta raíz. El campo es_proyecto_padre indica si es un proyecto padre o hijo.',
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              created_at: z.date(),
              carpeta_raiz_id: z.number().nullable(),
              es_proyecto_padre: z.boolean(),
              proyecto_padre_id: z.number().nullable(),
              
              // Solo etapa_tipo
              etapas_registro: z.array(z.object({
                etapa_tipo: z.object({
                  id: z.number(),
                  nombre: z.string(),
                  color: z.string()
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
        where: {
          eliminado: false,
          // Removido el filtro proyecto_padre_id: null para mostrar todos los proyectos
          proyecto_padre_id: null
        },
        select: {
          id: true,
          nombre: true,
          created_at: true,
          carpeta_raiz_id: true,
          es_proyecto_padre: true,
          proyecto_padre_id: true,
          etapas_registro: {
            take: 1,
            orderBy: {
              fecha_creacion: 'desc'
            },
            select: {
              etapa_tipo: {
                select: {
                  id: true,
                  nombre: true,
                  color: true
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
        description: 'Retorna la información completa de un proyecto específico activo (no eliminado) incluyendo todas sus etapas de registro, relaciones con divisiones, departamentos, unidades y creador. El campo es_proyecto_padre indica si es un proyecto padre o hijo.',
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
              es_proyecto_padre: z.boolean(),
              proyecto_padre_id: z.number().nullable(),
              
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
                // Deeply nested hierarchical geographical data
                etapas_regiones: z.array(z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string(),
                  nombre_corto: z.string().nullable(),
                  etapas_provincias: z.array(z.object({
                    provincia: z.object({
                      id: z.number(),
                      codigo: z.string(),
                      nombre: z.string(),
                      etapas_comunas: z.array(z.object({
                        comuna: z.object({
                          id: z.number(),
                          nombre: z.string()
                        })
                      }))
                    })
                  }))
                })),
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
        where: { 
          id,
          eliminado: false
        },
        select: {
          id: true,
          nombre: true,
          carpeta_inicial: true,
          carpeta_raiz_id: true,
          created_at: true,
          es_proyecto_padre: true,
          proyecto_padre_id: true,
          etapas_registro: {
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
              // Include unified geographical data
              etapas_geografia: {
                include: {
                  region: {
                    select: {
                      id: true,
                      codigo: true,
                      nombre: true,
                      nombre_corto: true
                    }
                  },
                  provincia: {
                    select: {
                      id: true,
                      codigo: true,
                      nombre: true
                    }
                  },
                  comuna: {
                    select: {
                      id: true,
                      nombre: true
                    }
                  }
                }
              },
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
          message: 'Proyecto no encontrado o ha sido eliminado'
        });
      }

      // Transform geographical data to deeply nested hierarchical structure
      const transformedProyecto = {
        ...proyecto,
        etapas_registro: proyecto.etapas_registro.map(etapa => ({
          ...etapa,
          etapas_regiones: transformGeographicalData(etapa.etapas_geografia)
        }))
      };

      return {
        success: true,
        message: 'Proyecto obtenido exitosamente',
        data: transformedProyecto
      };
    })

    .put('/proyectos/:id', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Actualizar proyecto padre existente',
        description: 'Actualiza la información de un proyecto padre existente. Permite modificar datos básicos del proyecto y crear o actualizar etapas de registro asociadas. No permite actualizar proyectos hijos.',
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
            tipo_iniciativa_id: z.number().optional(),
            tipo_obra_id: z.number().optional(),
            // Nueva estructura anidada para datos geográficos
            regiones: z.array(z.object({
              id: z.number(),
              provincias: z.array(z.object({
                id: z.number(),
                comunas: z.array(z.object({
                  id: z.number()
                }))
              }))
            })).optional(),
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
      
      // Verificar que el proyecto existe y NO es un proyecto hijo
      const proyectoExistente = await prisma.proyectos.findUnique({
        where: { 
          id,
          // Solo permitir actualizar proyectos que NO son hijos
          proyecto_padre_id: null
        },
        include: {
          etapas_registro: true
        }
      });
      
      if (!proyectoExistente) {
        return reply.status(404).send({
          success: false,
          message: 'Proyecto padre no encontrado o es un proyecto hijo'
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
        // Buscar la última etapa existente con el etapa_tipo_id para este proyecto
        const etapasExistentes = await prisma.etapas_registro.findMany({
          where: {
            proyecto_id: id,
            activa: true
          },
          orderBy: {
            fecha_creacion: 'desc'
          }
        });
        
        const etapaExistente = etapasExistentes[0]; // Tomar la última etapa (más reciente)

        console.log(" etapas existente");
        console.log(etapaExistente);


        console.log("proyecto_id");
        console.log(id);

        if (etapaExistente) {
          // Si existe, actualizar el registro existente
          console.log("actualizar");
          
          // Extraer los campos de regiones (nueva estructura anidada)
          const { regiones, ...datosEtapa } = etapas_registro;
          
          await prisma.etapas_registro.update({
            where: { id: etapaExistente.id },
            data: {
              ...datosEtapa,
              fecha_actualizacion: new Date()
            }
          });

          // Actualizar relaciones geográficas unificadas
          if (regiones !== undefined) {
            // Eliminar todas las relaciones geográficas existentes
            await prisma.etapas_geografia.deleteMany({
              where: { etapa_registro_id: etapaExistente.id }
            });
            
            // Crear nuevas relaciones geográficas basadas en la estructura anidada
            if (regiones && regiones.length > 0) {
              const comunaIds = extractComunaIdsFromNestedStructure(regiones);
              const geographicalData = [];
              
              for (const comunaId of comunaIds) {
                // Obtener la información completa de la comuna para obtener su provincia y región
                const comuna = await prisma.comunas.findUnique({
                  where: { id: comunaId },
                  include: {
                    provincia: {
                      include: {
                        region: true
                      }
                    }
                  }
                });
                
                if (comuna) {
                  geographicalData.push({
                    etapa_registro_id: etapaExistente.id,
                    region_id: comuna.provincia.region.id,
                    provincia_id: comuna.provincia.id,
                    comuna_id: comuna.id
                  });
                }
              }
              
              if (geographicalData.length > 0) {
                await prisma.etapas_geografia.createMany({
                  data: geographicalData
                });
              }
            }
          }
        } else {
          // Si no existe, crear un nuevo registro
          console.log("crear");
          
          // Extraer los campos de regiones (nueva estructura anidada)
          const { regiones, ...datosEtapa } = etapas_registro;
          
          const etapaData: any = {
            proyecto_id: id,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            activa: true,
            usuario_creador: proyectoExistente.creado_por
          };

          // Agregar campos opcionales solo si existen
          if (datosEtapa.tipo_iniciativa_id) etapaData.tipo_iniciativa_id = datosEtapa.tipo_iniciativa_id;
          if (datosEtapa.tipo_obra_id) etapaData.tipo_obra_id = datosEtapa.tipo_obra_id;
          if (datosEtapa.volumen) etapaData.volumen = datosEtapa.volumen;
          if (datosEtapa.presupuesto_oficial) etapaData.presupuesto_oficial = datosEtapa.presupuesto_oficial;
          if (datosEtapa.valor_referencia) etapaData.valor_referencia = datosEtapa.valor_referencia;
          if (datosEtapa.bip) etapaData.bip = datosEtapa.bip;
          if (datosEtapa.fecha_llamado_licitacion) etapaData.fecha_llamado_licitacion = datosEtapa.fecha_llamado_licitacion;
          if (datosEtapa.fecha_recepcion_ofertas_tecnicas) etapaData.fecha_recepcion_ofertas_tecnicas = datosEtapa.fecha_recepcion_ofertas_tecnicas;
          if (datosEtapa.fecha_apertura_ofertas_economicas) etapaData.fecha_apertura_ofertas_economicas = datosEtapa.fecha_apertura_ofertas_economicas;
          if (datosEtapa.decreto_adjudicacion) etapaData.decreto_adjudicacion = datosEtapa.decreto_adjudicacion;
          if (datosEtapa.sociedad_concesionaria) etapaData.sociedad_concesionaria = datosEtapa.sociedad_concesionaria;
          if (datosEtapa.fecha_inicio_concesion) etapaData.fecha_inicio_concesion = datosEtapa.fecha_inicio_concesion;
          if (datosEtapa.plazo_total_concesion) etapaData.plazo_total_concesion = datosEtapa.plazo_total_concesion;
          if (datosEtapa.inspector_fiscal_id) etapaData.inspector_fiscal_id = datosEtapa.inspector_fiscal_id;

          const etapaCreada = await prisma.etapas_registro.create({
            data: etapaData
          });

          // Crear relaciones geográficas unificadas basadas en la estructura anidada
          if (regiones && regiones.length > 0) {
            const comunaIds = extractComunaIdsFromNestedStructure(regiones);
            const geographicalData = [];
            
            for (const comunaId of comunaIds) {
              // Obtener la información completa de la comuna para obtener su provincia y región
              const comuna = await prisma.comunas.findUnique({
                where: { id: comunaId },
                include: {
                  provincia: {
                    include: {
                      region: true
                    }
                  }
                }
              });
              
              if (comuna) {
                geographicalData.push({
                  etapa_registro_id: etapaCreada.id,
                  region_id: comuna.provincia.region.id,
                  provincia_id: comuna.provincia.id,
                  comuna_id: comuna.id
                });
              }
            }
            
            if (geographicalData.length > 0) {
              await prisma.etapas_geografia.createMany({
                data: geographicalData
              });
            }
          }
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
        summary: 'Obtener carpetas del proyecto padre',
        description: 'Retorna la estructura de carpetas asociada a un proyecto padre específico, incluyendo carpetas padre e hijas con su información de organización. Para proyectos padre, también incluye las carpetas de todos sus proyectos hijos. No permite obtener carpetas de proyectos hijos.',
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
              proyecto_id: z.number(),
              carpetas_hijas: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                descripcion: z.string().nullable(),
                s3_path: z.string(),
                orden_visualizacion: z.number(),
                proyecto_id: z.number()
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
      
      // Verificar que el proyecto existe y NO es un proyecto hijo
      const proyecto = await prisma.proyectos.findUnique({
        where: { 
          id,
          // Solo permitir obtener carpetas de proyectos que NO son hijos
          proyecto_padre_id: null
        }
      });
      
      if (!proyecto) {
        return reply.status(404).send({
          success: false,
          message: 'Proyecto padre no encontrado o es un proyecto hijo'
        });
      }

      try {
        // Obtener carpetas del proyecto
        const carpetas = await CarpetaDBUtils.getProjectFolders(id);
        
        return {
          success: true,
          message: 'Carpetas del proyecto padre obtenidas exitosamente, incluyendo carpetas de proyectos hijos',
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
        summary: 'Cambia la etapa activa de un proyecto padre',
        description: 'Cambia la etapa activa de un proyecto padre. Desactiva la etapa actual y activa la nueva etapa especificada. Incluye validación para asegurar que solo una etapa esté activa por proyecto. No permite cambiar etapa en proyectos hijos.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          etapa_tipo_id: z.number().int().min(1, 'ID de tipo de etapa es requerido'),
          tipo_iniciativa_id: z.number().int().min(1).optional(),
          tipo_obra_id: z.number().int().min(1).optional(),
          // Nested geographical structure
          regiones: z.array(z.object({
            id: z.number(),
            provincias: z.array(z.object({
              id: z.number(),
              comunas: z.array(z.object({
                id: z.number()
              }))
            }))
          })).optional(),
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
        // Verificar que el proyecto existe y NO es un proyecto hijo
        const proyecto = await prisma.proyectos.findUnique({
          where: { 
            id
          },
          include: {
            etapas_registro: {
              where: { activa: true },
              include: {
                etapa_tipo: true
              }
            }
          }
        });

        console.log('proyecto', proyecto);
        

        // Verificar que el tipo de etapa existe
        const etapaTipo = await prisma.etapas_tipo.findUnique({
          where: { id: body.etapa_tipo_id },
          select: {
            id: true,
            nombre: true,
            carpetas_iniciales: true
          }
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
            ...(body.inspector_fiscal_id && { inspector_fiscal_id: body.inspector_fiscal_id }),
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

        // Crear relaciones geográficas unificadas si se proporcionan
        if (body.regiones && body.regiones.length > 0) {
          const comunaIds = extractComunaIdsFromNestedStructure(body.regiones);
          const geographicalData = [];

          for (const comunaId of comunaIds) {
            // Obtener la información completa de la comuna para obtener su provincia y región
            const comuna = await prisma.comunas.findUnique({
              where: { id: comunaId },
              include: {
                provincia: {
                  include: {
                    region: true
                  }
                }
              }
            });

            if (comuna) {
              geographicalData.push({
                etapa_registro_id: nuevaEtapa.id,
                region_id: comuna.provincia.region.id,
                provincia_id: comuna.provincia.id,
                comuna_id: comuna.id,
              });
            }
          }

          if (geographicalData.length > 0) {
            await prisma.etapas_geografia.createMany({
              data: geographicalData,
              skipDuplicates: true,
            });
          }
        }

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

          // Declarar projectFolderPath una sola vez para reutilizarla
          let projectFolderPath: string | null = null;

          if (proyectoInfo && nuevaEtapa.etapa_tipo.carpetas_iniciales) {
            console.log('Etapa tipo carpetas_iniciales found:', JSON.stringify(nuevaEtapa.etapa_tipo.carpetas_iniciales, null, 2));
            
            // Crear la ruta base del proyecto en MinIO
            projectFolderPath = await MinIOUtils.createProjectFolder(proyectoInfo.nombre, id);
            
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

          // Crear carpetas transversales para la nueva etapa si existen
          const carpetasTransversales = await (prisma as any).carpetas_transversales.findMany({
            where: {
              etapa_tipo_id: body.etapa_tipo_id,
              activa: true
            },
            orderBy: {
              orden: 'asc'
            }
          });

          if (carpetasTransversales && carpetasTransversales.length > 0) {
            console.log(`Creating ${carpetasTransversales.length} transverse folders for new etapa: ${nuevaEtapa.etapa_tipo.nombre}`);
            
            // Crear la ruta base del proyecto en MinIO si no se creó antes
            if (!projectFolderPath) {
              projectFolderPath = await MinIOUtils.createProjectFolder(proyectoInfo.nombre, id);
            }
            
            if (projectFolderPath) {
              for (const carpetaTransversal of carpetasTransversales) {
                // Si la carpeta transversal tiene estructura_carpetas, crear las subcarpetas directamente en la raíz del proyecto
                if (carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object') {
                  console.log(`Creating transverse subfolders for: ${carpetaTransversal.nombre}`);
                  console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                  
                  try {
                    // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                    await MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas);
                    console.log(`Transverse subfolders created successfully in MinIO for: ${carpetaTransversal.nombre}`);
                    
                    // Crear registros en la base de datos para las subcarpetas
                    const subcarpetas = await CarpetaDBUtils.createNestedFolderStructureDB(
                      id,
                      projectFolderPath,
                      carpetaTransversal.estructura_carpetas,
                      body.usuario_creador,
                      proyectoInfo.carpeta_raiz_id, // carpeta_padre_id será la carpeta raíz del proyecto
                      body.etapa_tipo_id,
                      'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                      carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                    );
                    console.log(`Transverse subfolders DB records created successfully for: ${carpetaTransversal.nombre}. Created ${subcarpetas.length} subfolders.`);
                  } catch (subfolderError) {
                    console.error(`Error creating transverse subfolders for ${carpetaTransversal.nombre}:`, subfolderError);
                    // Continue with other folders even if subfolder creation fails
                  }
                }
              }
            } else {
              console.warn('Cannot create transverse folders: project folder path was not created successfully');
            }
            console.log(`Transverse folders created successfully for new etapa: ${nuevaEtapa.etapa_tipo.nombre}`);
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
        summary: 'Obtener la etapa actual del proyecto padre',
        description: 'Retorna la información completa de la etapa actualmente activa del proyecto padre, incluyendo todos los datos de la etapa y sus relaciones. No permite obtener etapa actual de proyectos hijos.',
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
                // Deeply nested hierarchical geographical data
                etapas_regiones: z.array(z.object({
                  id: z.number(),
                  codigo: z.string(),
                  nombre: z.string(),
                  nombre_corto: z.string().nullable(),
                  etapas_provincias: z.array(z.object({
                    provincia: z.object({
                      id: z.number(),
                      codigo: z.string(),
                      nombre: z.string(),
                      etapas_comunas: z.array(z.object({
                        comuna: z.object({
                          id: z.number(),
                          nombre: z.string()
                        })
                      }))
                    })
                  }))
                })),
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
        // Verificar que el proyecto existe y NO es un proyecto hijo
        const proyecto = await prisma.proyectos.findUnique({
          where: { 
            id,
            // Solo permitir obtener etapa actual de proyectos que NO son hijos
            proyecto_padre_id: null
          }
        });
        
        if (!proyecto) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto padre no encontrado o es un proyecto hijo'
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
            // Include unified geographical data
            etapas_geografia: {
              include: {
                region: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    nombre_corto: true
                  }
                },
                provincia: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true
                  }
                },
                comuna: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            },
            inspector_fiscal: {
              select: {
                id: true,
                nombre_completo: true,
                correo_electronico: true
              }
            }
          }
        });

        // Transform geographical data to deeply nested hierarchical structure
        const transformedEtapaActual = etapaActual ? {
          ...etapaActual,
          etapas_regiones: transformGeographicalData(etapaActual.etapas_geografia)
        } : null;

        return {
          success: true,
          message: 'Etapa actual del proyecto obtenida exitosamente',
          data: {
            proyecto_id: id,
            etapa_actual: transformedEtapaActual
          }
        };

      } catch (error) {
        console.error('Error getting current project stage:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al obtener la etapa actual del proyecto'
        });
      }
    })

    .delete('/proyectos/:id', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Eliminar proyecto padre (soft delete)',
        description: 'Realiza un soft delete del proyecto padre marcándolo como eliminado sin borrar físicamente los datos. El proyecto y sus datos asociados permanecen en la base de datos pero no aparecen en las consultas normales. No permite eliminar proyectos hijos.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          usuario_eliminador: z.number().int().min(1, 'Usuario que realiza la eliminación es requerido'),
          motivo_eliminacion: z.string().max(500).optional()
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              nombre: z.string(),
              eliminado: z.boolean(),
              fecha_eliminacion: z.date()
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
      const { usuario_eliminador, motivo_eliminacion } = request.body;
      
      try {
        // Verificar que el proyecto existe, no está ya eliminado y NO es un proyecto hijo
        const proyecto = await prisma.proyectos.findUnique({
          where: { 
            id,
            // Solo permitir eliminar proyectos que NO son hijos
            proyecto_padre_id: null
          },
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
            message: 'Proyecto padre no encontrado o es un proyecto hijo'
          });
        }

        if (proyecto.eliminado) {
          return reply.status(400).send({
            success: false,
            message: 'El proyecto ya ha sido eliminado'
          });
        }

        // Verificar que el usuario que elimina existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: usuario_eliminador }
        });

        if (!usuario) {
          return reply.status(400).send({
            success: false,
            message: 'Usuario eliminador no encontrado'
          });
        }

        // Realizar soft delete del proyecto
        const proyectoEliminado = await prisma.proyectos.update({
          where: { id },
          data: {
            eliminado: true
          }
        });

        // Desactivar todas las etapas activas del proyecto
        if (proyecto.etapas_registro.length > 0) {
          await prisma.etapas_registro.updateMany({
            where: {
              proyecto_id: id,
              activa: true
            },
            data: {
              activa: false
            }
          });
        }

        // Opcional: Crear un registro de auditoría de la eliminación
        // Esto dependería de si tienes una tabla de auditoría configurada
        console.log(`Proyecto "${proyecto.nombre}" eliminado por usuario ${usuario_eliminador}. Motivo: ${motivo_eliminacion || 'No especificado'}`);

        return reply.status(200).send({
          success: true,
          message: 'Proyecto eliminado exitosamente',
          data: {
            id: proyectoEliminado.id,
            nombre: proyectoEliminado.nombre,
            eliminado: proyectoEliminado.eliminado,
            fecha_eliminacion: new Date()
          }
        });

      } catch (error) {
        console.error('Error deleting project:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al eliminar el proyecto'
        });
      }
    })

    .patch('/proyectos/:id/restaurar', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Restaurar proyecto padre eliminado',
        description: 'Restaura un proyecto padre que ha sido eliminado mediante soft delete, marcándolo como activo nuevamente. No permite restaurar proyectos hijos.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          usuario_restaurador: z.number().int().min(1, 'Usuario que realiza la restauración es requerido'),
          motivo_restauracion: z.string().max(500).optional()
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              nombre: z.string(),
              eliminado: z.boolean(),
              fecha_restauracion: z.date()
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
      const { usuario_restaurador, motivo_restauracion } = request.body;
      
      try {
        // Verificar que el proyecto existe y NO es un proyecto hijo
        const proyecto = await prisma.proyectos.findUnique({
          where: { 
            id,
            // Solo permitir restaurar proyectos que NO son hijos
            proyecto_padre_id: null
          }
        });
        
        if (!proyecto) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto padre no encontrado o es un proyecto hijo'
          });
        }

        if (!proyecto.eliminado) {
          return reply.status(400).send({
            success: false,
            message: 'El proyecto no ha sido eliminado'
          });
        }

        // Verificar que el usuario que restaura existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: usuario_restaurador }
        });

        if (!usuario) {
          return reply.status(400).send({
            success: false,
            message: 'Usuario restaurador no encontrado'
          });
        }

        // Restaurar el proyecto
        const proyectoRestaurado = await prisma.proyectos.update({
          where: { id },
          data: {
            eliminado: false
          }
        });

        console.log(`Proyecto "${proyecto.nombre}" restaurado por usuario ${usuario_restaurador}. Motivo: ${motivo_restauracion || 'No especificado'}`);

        return reply.status(200).send({
          success: true,
          message: 'Proyecto restaurado exitosamente',
          data: {
            id: proyectoRestaurado.id,
            nombre: proyectoRestaurado.nombre,
            eliminado: proyectoRestaurado.eliminado,
            fecha_restauracion: new Date()
          }
        });

      } catch (error) {
        console.error('Error restoring project:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al restaurar el proyecto'
        });
      }
    })

    .get('/proyectos/eliminados', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener lista de proyectos padre eliminados',
        description: 'Retorna una lista de todos los proyectos padre que han sido eliminados mediante soft delete (no incluye proyectos hijos eliminados).',
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              created_at: z.date(),
              eliminado: z.boolean(),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable()
              })
            }))
          })
        }
      }
    }, async () => {
      const proyectosEliminados = await prisma.proyectos.findMany({
        where: {
          eliminado: true,
          // Solo mostrar proyectos padre eliminados (no proyectos hijos eliminados)
          proyecto_padre_id: null
        },
        select: {
          id: true,
          nombre: true,
          created_at: true,
          eliminado: true,
          creador: {
            select: {
              id: true,
              nombre_completo: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return {
        success: true,
        message: 'Lista de proyectos eliminados obtenida exitosamente',
        data: proyectosEliminados
      };
    })

    .post('/proyectos/padre', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Crear un proyecto padre',
        description: 'Crea un nuevo proyecto padre que puede contener proyectos hijos. El proyecto padre se crea como carpeta en MinIO y puede asignar proyectos hijos existentes opcionalmente.',
        body: z.object({
          nombre: z.string().max(255),
          division_id: z.number().optional(),
          departamento_id: z.number().optional(),
          unidad_id: z.number().optional(),
          creado_por: z.number(),
          proyectos_hijos_ids: z.array(z.number()).optional()
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              nombre: z.string(),
              es_proyecto_padre: z.boolean(),
              proyectos_hijos: z.array(z.object({
                id: z.number(),
                nombre: z.string()
              }))
            })
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { proyectos_hijos_ids, ...datosProyecto } = request.body;
      
      try {
        // Verificar que el usuario creador existe
        const usuario = await prisma.usuarios.findUnique({
          where: { id: datosProyecto.creado_por }
        });
        
        if (!usuario) {
          return reply.status(400).send({
            success: false,
            message: 'Usuario creador no encontrado'
          });
        }

        // Verificar que los proyectos hijos existen y no son proyectos padre
        if (proyectos_hijos_ids && proyectos_hijos_ids.length > 0) {
          const proyectosHijos = await prisma.proyectos.findMany({
            where: {
              id: { in: proyectos_hijos_ids },
              eliminado: false
            },
            select: {
              id: true,
              nombre: true,
              es_proyecto_padre: true,
              proyecto_padre_id: true
            }
          });

          if (proyectosHijos.length !== proyectos_hijos_ids.length) {
            return reply.status(404).send({
              success: false,
              message: 'Uno o más proyectos hijos no encontrados'
            });
          }

          // Verificar que no sean proyectos padre
          const proyectosPadre = proyectosHijos.filter(p => p.es_proyecto_padre);
          if (proyectosPadre.length > 0) {
            return reply.status(400).send({
              success: false,
              message: `Los siguientes proyectos son proyectos padre y no pueden ser hijos: ${proyectosPadre.map(p => p.nombre).join(', ')}`
            });
          }

          // Verificar que no tengan ya un proyecto padre
          const proyectosConPadre = proyectosHijos.filter(p => p.proyecto_padre_id !== null);
          if (proyectosConPadre.length > 0) {
            return reply.status(400).send({
              success: false,
              message: `Los siguientes proyectos ya tienen un proyecto padre: ${proyectosConPadre.map(p => p.nombre).join(', ')}`
            });
          }
        }

        // Crear el proyecto padre
        const proyectoPadre = await prisma.proyectos.create({
          data: {
            nombre: datosProyecto.nombre,
            division_id: datosProyecto.division_id,
            departamento_id: datosProyecto.departamento_id,
            unidad_id: datosProyecto.unidad_id,
            creado_por: datosProyecto.creado_por,
            es_proyecto_padre: true
          }
        });

        // Crear carpeta en MinIO para el proyecto padre
        let projectFolderPath: string | null = null;
        let carpetaRaiz: any = null;
        try {
          projectFolderPath = await MinIOUtils.createProjectFolder(proyectoPadre.nombre, proyectoPadre.id);
          console.log(`Project parent folder created in MinIO: ${projectFolderPath}`);
          
          // Crear registro de carpeta raíz en la base de datos
          carpetaRaiz = await CarpetaDBUtils.createProjectRootFolder(
            proyectoPadre.id,
            proyectoPadre.nombre,
            projectFolderPath,
            datosProyecto.creado_por
          );

          
        } catch (folderError) {
          console.error('Error creating project parent folders:', folderError);
          // Continue with project creation even if folder creation fails
        }

        // Asignar proyectos hijos si se especifican
        let proyectosHijosAsignados = [];
        if (proyectos_hijos_ids && proyectos_hijos_ids.length > 0) {
          // Actualizar los proyectos hijos para asignarlos al proyecto padre
          await prisma.proyectos.updateMany({
            where: {
              id: { in: proyectos_hijos_ids }
            },
            data: {
              proyecto_padre_id: proyectoPadre.id
            }
          });

          // Mover las carpetas de los proyectos hijos dentro del proyecto padre en MinIO
          if (projectFolderPath) {
            for (const proyectoHijoId of proyectos_hijos_ids) {
              try {
                const proyectoHijo = await prisma.proyectos.findUnique({
                  where: { id: proyectoHijoId },
                  include: {
                    carpeta_raiz: true
                  }
                });
                console.log("proyectoHijo");
                console.log(proyectoHijo);
                console.log(proyectoHijo.carpeta_raiz);

                if (proyectoHijo && proyectoHijo.carpeta_raiz) {
                  const oldPath = proyectoHijo.carpeta_raiz.s3_path;
                  const newPath = `${projectFolderPath}/${proyectoHijo.nombre}`;
                  
                  // Mover la carpeta en MinIO
                  await MinIOUtils.moveFolder(oldPath, newPath);
                  
                  // Actualizar la ruta y la carpeta padre en la base de datos
                  if (carpetaRaiz) {
                    await prisma.carpetas.update({
                      where: { id: proyectoHijo.carpeta_raiz.id },
                      data: { 
                        s3_path: newPath,
                        carpeta_padre_id: carpetaRaiz.id
                      }
                    });
                  } else {
                    // Si no se pudo crear la carpeta raíz, solo actualizar la ruta
                    await prisma.carpetas.update({
                      where: { id: proyectoHijo.carpeta_raiz.id },
                      data: { s3_path: newPath }
                    });
                  }

                  console.log(`Moved project ${proyectoHijo.nombre} from ${oldPath} to ${newPath}`);
                }
              } catch (moveError) {
                console.error(`Error moving project ${proyectoHijoId}:`, moveError);
                // Continue with other projects even if one fails
              }
            }
          } else {
            console.warn('Cannot move child project folders: parent project folder was not created successfully');
          }

          // Obtener los proyectos hijos actualizados
          proyectosHijosAsignados = await prisma.proyectos.findMany({
            where: {
              id: { in: proyectos_hijos_ids }
            },
            select: {
              id: true,
              nombre: true
            }
          });
        }

        return reply.status(201).send({
          success: true,
          message: 'Proyecto padre creado exitosamente',
          data: {
            id: proyectoPadre.id,
            nombre: proyectoPadre.nombre,
            es_proyecto_padre: proyectoPadre.es_proyecto_padre,
            proyectos_hijos: proyectosHijosAsignados
          }
        });

      } catch (error) {
        console.error('Error creating parent project:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al crear el proyecto padre'
        });
      }
    })

    .post('/proyectos/:id/asignar-hijos', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Asignar proyectos hijos a un proyecto padre',
        description: 'Asigna proyectos hijos existentes a un proyecto padre. Los proyectos hijos se mueven dentro de la carpeta del proyecto padre en MinIO.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          proyectos_hijos_ids: z.array(z.number()),
          usuario_operacion: z.number()
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              proyecto_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }),
              proyectos_asignados: z.array(z.object({
                id: z.number(),
                nombre: z.string()
              }))
            })
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      const { proyectos_hijos_ids, usuario_operacion } = request.body;

      try {
        // Verificar que el proyecto padre existe
        const proyectoPadre = await prisma.proyectos.findUnique({
          where: { 
            id,
            eliminado: false
          },
          include: {
            carpeta_raiz: true
          }
        });

        if (!proyectoPadre) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto padre no encontrado'
          });
        }

        if (!proyectoPadre.es_proyecto_padre) {
          return reply.status(400).send({
            success: false,
            message: 'El proyecto especificado no es un proyecto padre'
          });
        }

        // Verificar que los proyectos hijos existen
        const proyectosHijos = await prisma.proyectos.findMany({
          where: {
            id: { in: proyectos_hijos_ids },
            eliminado: false
          },
          include: {
            carpeta_raiz: true
          }
        });

        if (proyectosHijos.length !== proyectos_hijos_ids.length) {
          return reply.status(404).send({
            success: false,
            message: 'Uno o más proyectos hijos no encontrados'
          });
        }

        // Verificar que no sean proyectos padre
        const proyectosPadre = proyectosHijos.filter(p => p.es_proyecto_padre);
        if (proyectosPadre.length > 0) {
          return reply.status(400).send({
            success: false,
            message: `Los siguientes proyectos son proyectos padre y no pueden ser hijos: ${proyectosPadre.map(p => p.nombre).join(', ')}`
          });
        }

        // Verificar que no tengan ya un proyecto padre
        const proyectosConPadre = proyectosHijos.filter(p => p.proyecto_padre_id !== null);
        if (proyectosConPadre.length > 0) {
          return reply.status(400).send({
            success: false,
            message: `Los siguientes proyectos ya tienen un proyecto padre: ${proyectosConPadre.map(p => p.nombre).join(', ')}`
          });
        }

        // Asignar los proyectos hijos al proyecto padre
        await prisma.proyectos.updateMany({
          where: {
            id: { in: proyectos_hijos_ids }
          },
          data: {
            proyecto_padre_id: id
          }
        });

        // Mover las carpetas de los proyectos hijos dentro del proyecto padre en MinIO
        const proyectosAsignados = [];
        for (const proyectoHijo of proyectosHijos) {
          try {
            if (proyectoHijo.carpeta_raiz) {
              const oldPath = proyectoHijo.carpeta_raiz.s3_path;
              const newPath = `${proyectoPadre.carpeta_raiz?.s3_path || `proyectos/${proyectoPadre.nombre}_${proyectoPadre.id}`}/${proyectoHijo.nombre}`;
              
              // Mover la carpeta en MinIO
              await MinIOUtils.moveFolder(oldPath, newPath);
              
              // Actualizar la ruta y la carpeta padre en la base de datos
              if (proyectoPadre.carpeta_raiz) {
                await prisma.carpetas.update({
                  where: { id: proyectoHijo.carpeta_raiz.id },
                  data: { 
                    s3_path: newPath,
                    carpeta_padre_id: proyectoPadre.carpeta_raiz.id
                  }
                });
              } else {
                // Si no hay carpeta raíz del proyecto padre, solo actualizar la ruta
                await prisma.carpetas.update({
                  where: { id: proyectoHijo.carpeta_raiz.id },
                  data: { s3_path: newPath }
                });
              }

              console.log(`Moved project ${proyectoHijo.nombre} from ${oldPath} to ${newPath}`);
            }
          } catch (moveError) {
            console.error(`Error moving project ${proyectoHijo.id}:`, moveError);
            // Continue with other projects even if one fails
          }

          proyectosAsignados.push({
            id: proyectoHijo.id,
            nombre: proyectoHijo.nombre
          });
        }

        return reply.status(200).send({
          success: true,
          message: 'Proyectos hijos asignados exitosamente',
          data: {
            proyecto_padre: {
              id: proyectoPadre.id,
              nombre: proyectoPadre.nombre
            },
            proyectos_asignados: proyectosAsignados
          }
        });

      } catch (error) {
        console.error('Error assigning child projects:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al asignar proyectos hijos'
        });
      }
    })

    .get('/proyectos/padres', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener lista de proyectos padre',
        description: 'Retorna una lista de todos los proyectos padre con información de sus proyectos hijos.',
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.number(),
              nombre: z.string(),
              created_at: z.date(),
              es_proyecto_padre: z.boolean(),
              proyectos_hijos: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                created_at: z.date()
              })),
              creador: z.object({
                id: z.number(),
                nombre_completo: z.string().nullable()
              })
            }))
          })
        }
      }
    }, async () => {
      const proyectosPadre = await prisma.proyectos.findMany({
        where: {
          es_proyecto_padre: true,
          eliminado: false
        },
        select: {
          id: true,
          nombre: true,
          created_at: true,
          es_proyecto_padre: true,
          proyectos_hijos: {
            where: {
              eliminado: false
            },
            select: {
              id: true,
              nombre: true,
              created_at: true
            }
          },
          creador: {
            select: {
              id: true,
              nombre_completo: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
             return {
         success: true,
         message: 'Lista de proyectos padre obtenida exitosamente',
         data: proyectosPadre
       };
     })

    .get('/proyectos/:id/hijos', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Obtener proyectos hijos de un proyecto padre',
        description: 'Retorna una lista de todos los proyectos hijos de un proyecto padre específico.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              proyecto_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }),
              proyectos_hijos: z.array(z.object({
                id: z.number(),
                nombre: z.string(),
                created_at: z.date(),
                division: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                departamento: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable(),
                unidad: z.object({
                  id: z.number(),
                  nombre: z.string()
                }).nullable()
              }))
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

      try {
        // Verificar que el proyecto padre existe
        const proyectoPadre = await prisma.proyectos.findUnique({
          where: { 
            id,
            eliminado: false
          },
          select: {
            id: true,
            nombre: true,
            es_proyecto_padre: true
          }
        });

        if (!proyectoPadre) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto no encontrado'
          });
        }

        if (!proyectoPadre.es_proyecto_padre) {
          return reply.status(400).send({
            success: false,
            message: 'El proyecto especificado no es un proyecto padre'
          });
        }

        // Obtener los proyectos hijos
        const proyectosHijos = await prisma.proyectos.findMany({
          where: {
            proyecto_padre_id: id,
            eliminado: false
          },
          select: {
            id: true,
            nombre: true,
            created_at: true,
            division: {
              select: {
                id: true,
                nombre: true
              }
            },
            departamento: {
              select: {
                id: true,
                nombre: true
              }
            },
            unidad: {
              select: {
                id: true,
                nombre: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        });

        return reply.status(200).send({
          success: true,
          message: 'Proyectos hijos obtenidos exitosamente',
          data: {
            proyecto_padre: {
              id: proyectoPadre.id,
              nombre: proyectoPadre.nombre
            },
            proyectos_hijos: proyectosHijos
          }
        });

      } catch (error) {
        console.error('Error getting child projects:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al obtener los proyectos hijos'
        });
      }
    })

    .patch('/proyectos/:id/remover-hijos', {
      schema: {
        tags: ['Proyectos'],
        summary: 'Remover proyectos hijos de un proyecto padre',
        description: 'Remueve proyectos hijos de un proyecto padre. Los proyectos hijos se mueven de vuelta a la raíz y se actualizan sus rutas en MinIO.',
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10))
        }),
        body: z.object({
          proyectos_hijos_ids: z.array(z.number()),
          usuario_operacion: z.number()
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              proyecto_padre: z.object({
                id: z.number(),
                nombre: z.string()
              }),
              proyectos_removidos: z.array(z.object({
                id: z.number(),
                nombre: z.string()
              }))
            })
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string()
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      const { proyectos_hijos_ids, usuario_operacion } = request.body;

      try {
        // Verificar que el proyecto padre existe
        const proyectoPadre = await prisma.proyectos.findUnique({
          where: { 
            id,
            eliminado: false
          },
          include: {
            carpeta_raiz: true
          }
        });

        if (!proyectoPadre) {
          return reply.status(404).send({
            success: false,
            message: 'Proyecto padre no encontrado'
          });
        }

        if (!proyectoPadre.es_proyecto_padre) {
          return reply.status(400).send({
            success: false,
            message: 'El proyecto especificado no es un proyecto padre'
          });
        }

        // Verificar que los proyectos hijos existen y pertenecen a este padre
        const proyectosHijos = await prisma.proyectos.findMany({
          where: {
            id: { in: proyectos_hijos_ids },
            proyecto_padre_id: id,
            eliminado: false
          },
          include: {
            carpeta_raiz: true
          }
        });

        if (proyectosHijos.length !== proyectos_hijos_ids.length) {
          return reply.status(404).send({
            success: false,
            message: 'Uno o más proyectos hijos no encontrados o no pertenecen a este proyecto padre'
          });
        }

        // Remover los proyectos hijos del proyecto padre
        await prisma.proyectos.updateMany({
          where: {
            id: { in: proyectos_hijos_ids }
          },
          data: {
            proyecto_padre_id: null
          }
        });

        // Mover las carpetas de los proyectos hijos de vuelta a la raíz en MinIO
        const proyectosRemovidos = [];
        for (const proyectoHijo of proyectosHijos) {
          try {
            if (proyectoHijo.carpeta_raiz) {
              const oldPath = proyectoHijo.carpeta_raiz.s3_path;
              const newPath = `proyectos/${proyectoHijo.nombre}_${proyectoHijo.id}`;
              
              // Mover la carpeta en MinIO
              await MinIOUtils.moveFolder(oldPath, newPath);
              
              // Actualizar la ruta y remover la carpeta padre en la base de datos
              await prisma.carpetas.update({
                where: { id: proyectoHijo.carpeta_raiz.id },
                data: { 
                  s3_path: newPath,
                  carpeta_padre_id: null
                }
              });

              console.log(`Moved project ${proyectoHijo.nombre} from ${oldPath} to ${newPath}`);
            }
          } catch (moveError) {
            console.error(`Error moving project ${proyectoHijo.id}:`, moveError);
            // Continue with other projects even if one fails
          }

          proyectosRemovidos.push({
            id: proyectoHijo.id,
            nombre: proyectoHijo.nombre
          });
        }

        return reply.status(200).send({
          success: true,
          message: 'Proyectos hijos removidos exitosamente',
          data: {
            proyecto_padre: {
              id: proyectoPadre.id,
              nombre: proyectoPadre.nombre
            },
            proyectos_removidos: proyectosRemovidos
          }
        });

      } catch (error) {
        console.error('Error removing child projects:', error);
        return reply.status(500).send({
          success: false,
          message: 'Error al remover proyectos hijos'
        });
      }
    });
}

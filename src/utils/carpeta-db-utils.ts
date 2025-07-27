import { prisma } from '@/lib/prisma';

export interface CarpetaDBData {
  nombre: string;
  descripcion?: string;
  carpeta_padre_id?: number;
  proyecto_id?: number;
  etapa_tipo_id?: number;
  carpeta_transversal_id?: number;
  concesion_id?: number;
  s3_path: string;
  s3_bucket_name?: string;
  usuario_creador: number;
  orden_visualizacion?: number;
  max_tamaño_mb?: number;
  tipos_archivo_permitidos?: string[];
  permisos_lectura?: string[];
  permisos_escritura?: string[];
}

// New interface for nested folder structure
export interface NestedFolderStructure {
  [key: string]: NestedFolderStructure | {};
}

export class CarpetaDBUtils {
  /**
   * Creates a folder record in the database
   */
  static async createCarpeta(carpetaData: CarpetaDBData) {
    try {
      console.log('Creating carpeta DB record with data:', {
        nombre: carpetaData.nombre,
        proyecto_id: carpetaData.proyecto_id,
        s3_path: carpetaData.s3_path,
        usuario_creador: carpetaData.usuario_creador
      });

      // Verify that the user exists
      const userExists = await prisma.usuarios.findUnique({
        where: { id: carpetaData.usuario_creador },
        select: { id: true, nombre_completo: true }
      });

      if (!userExists) {
        throw new Error(`User with ID ${carpetaData.usuario_creador} does not exist`);
      }

      console.log(`✅ User verified: ${userExists.nombre_completo} (ID: ${userExists.id})`);

      const carpeta = await prisma.carpetas.create({
        data: {
          nombre: carpetaData.nombre,
          descripcion: carpetaData.descripcion,
          carpeta_padre_id: carpetaData.carpeta_padre_id,
          proyecto_id: carpetaData.proyecto_id,
          etapa_tipo_id: carpetaData.etapa_tipo_id,
          carpeta_transversal_id: carpetaData.carpeta_transversal_id,
          concesion_id: carpetaData.concesion_id,
          s3_path: carpetaData.s3_path,
          s3_bucket_name: carpetaData.s3_bucket_name || process.env.MINIO_BUCKET,
          s3_created: true,
          orden_visualizacion: carpetaData.orden_visualizacion || 0,
          max_tamaño_mb: carpetaData.max_tamaño_mb,
          tipos_archivo_permitidos: carpetaData.tipos_archivo_permitidos || [],
          permisos_lectura: carpetaData.permisos_lectura || [],
          permisos_escritura: carpetaData.permisos_escritura || [],
          usuario_creador: carpetaData.usuario_creador,
          activa: true
        } as any
      });

      console.log(`✅ Carpeta DB record created successfully: ${carpeta.nombre} (ID: ${carpeta.id})`);
      console.log(`   - proyecto_id: ${carpeta.proyecto_id}`);
      console.log(`   - s3_path: ${carpeta.s3_path}`);
      console.log(`   - s3_bucket_name: ${carpeta.s3_bucket_name}`);
      console.log(`   - s3_created: ${carpeta.s3_created}`);
      return carpeta;
    } catch (error) {
      console.error('❌ Error creating carpeta DB record:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      throw error;
    }
  }

  /**
   * Creates the main project folder record
   * This creates a folder with the project name as the root folder
   */
  static async createProjectRootFolder(
    projectId: number,
    projectName: string,
    projectFolderPath: string,
    usuarioCreador: number
  ) {
    try {
      console.log(`🔄 Starting createProjectRootFolder for project: ${projectName} (ID: ${projectId})`);
      console.log(`   - projectFolderPath: ${projectFolderPath}`);
      console.log(`   - usuarioCreador: ${usuarioCreador}`);

      // Create the root folder record with the project name
      const carpetaRaiz = await this.createCarpeta({
        nombre: projectName, // Use project name as folder name
        descripcion: `Carpeta raíz del proyecto: ${projectName}`,
        proyecto_id: projectId,
        s3_path: projectFolderPath,
        usuario_creador: usuarioCreador,
        orden_visualizacion: 0
      });

      console.log(`✅ Root folder created successfully with ID: ${carpetaRaiz.id}`);

      // Update the project with the root folder ID
      console.log(`🔄 Updating project ${projectId} with carpeta_raiz_id: ${carpetaRaiz.id}`);
      await prisma.proyectos.update({
        where: { id: projectId },
        data: {
          carpeta_raiz_id: carpetaRaiz.id
        } as any
      });

      console.log(`✅ Project ${projectId} linked to root folder ${carpetaRaiz.id}`);
      console.log(`✅ Project root folder DB record created for project: ${projectName} with ID: ${carpetaRaiz.id}`);
      
      return carpetaRaiz;
    } catch (error) {
      console.error('❌ Error creating project root folder DB record:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      throw error;
    }
  }

  /**
   * Creates folder records for initial folders
   * Now supports both flat and nested structures
   */
  static async createInitialFoldersDB(
    projectId: number,
    projectFolderPath: string,
    carpetaInicial: any,
    usuarioCreador: number,
    carpetaPadreId?: number,
    etapaTipoId?: number
  ) {
    try {
      const carpetasCreadas = [];

      // Check if it's the old flat structure
      if (carpetaInicial && carpetaInicial.carpetas && Array.isArray(carpetaInicial.carpetas)) {
        // Handle old flat structure
        for (let i = 0; i < carpetaInicial.carpetas.length; i++) {
          const folder = carpetaInicial.carpetas[i];
          const folderPath = `${projectFolderPath}/${folder.nombre}`;
          
          const carpeta = await this.createCarpeta({
            nombre: folder.nombre,
            descripcion: `Carpeta inicial del proyecto`,
            proyecto_id: projectId,
            carpeta_padre_id: carpetaPadreId,
            etapa_tipo_id: etapaTipoId,
            s3_path: folderPath,
            usuario_creador: usuarioCreador,
            orden_visualizacion: i + 1
          });

          carpetasCreadas.push(carpeta);
        }
      } else {
        // Handle new nested structure
        const nestedCarpetas = await this.createNestedFolderStructureDB(
          projectId,
          projectFolderPath,
          carpetaInicial as NestedFolderStructure,
          usuarioCreador,
          carpetaPadreId,
          etapaTipoId,
          'Carpeta inicial del proyecto' // Pass description for initial folders
        );
        carpetasCreadas.push(...nestedCarpetas);
      }

      console.log(`Created ${carpetasCreadas.length} initial folder DB records`);
      return carpetasCreadas;
    } catch (error) {
      console.error('Error creating initial folders DB records:', error);
      throw error;
    }
  }

  /**
   * Creates folder records for etapa tipo folders
   * Now supports both flat and nested structures
   */
  static async createEtapaTipoFoldersDB(
    projectId: number,
    projectFolderPath: string,
    etapaTipoCarpetas: any,
    usuarioCreador: number,
    carpetaPadreId?: number,
    etapaTipoId?: number
  ) {
    try {
      const carpetasCreadas = [];
      const carpetasIniciales = etapaTipoCarpetas.carpetas_iniciales;
      let orden = 1;

      if (carpetasIniciales && typeof carpetasIniciales === 'object') {
        // Handle different possible structures
        if (carpetasIniciales.carpetas && Array.isArray(carpetasIniciales.carpetas)) {
          // Structure: { carpetas: [{ nombre: "..." }] }
          for (const folder of carpetasIniciales.carpetas) {
            if (folder.nombre) {
              const folderPath = `${projectFolderPath}/${folder.nombre}`;
              
              const carpeta = await this.createCarpeta({
                nombre: folder.nombre,
                descripcion: `Carpeta del tipo de etapa`,
                proyecto_id: projectId,
                carpeta_padre_id: carpetaPadreId,
                etapa_tipo_id: etapaTipoId,
                s3_path: folderPath,
                usuario_creador: usuarioCreador,
                orden_visualizacion: orden++
              });

              carpetasCreadas.push(carpeta);
            }
          }
        } else if (Array.isArray(carpetasIniciales)) {
          // Structure: [{ nombre: "..." }]
          for (const folder of carpetasIniciales) {
            if (folder.nombre) {
              const folderPath = `${projectFolderPath}/${folder.nombre}`;
              
              const carpeta = await this.createCarpeta({
                nombre: folder.nombre,
                descripcion: `Carpeta del tipo de etapa`,
                proyecto_id: projectId,
                carpeta_padre_id: carpetaPadreId,
                etapa_tipo_id: etapaTipoId,
                s3_path: folderPath,
                usuario_creador: usuarioCreador,
                orden_visualizacion: orden++
              });

              carpetasCreadas.push(carpeta);
            }
          }
        } else if (typeof carpetasIniciales === 'object') {
          // Check if it's a nested structure or flat structure
          const hasNestedStructure = Object.values(carpetasIniciales).some(value => 
            typeof value === 'object' && value !== null && Object.keys(value).length > 0
          );
          
          if (hasNestedStructure) {
            // Handle nested structure
            const nestedCarpetas = await this.createNestedFolderStructureDB(
              projectId,
              projectFolderPath,
              carpetasIniciales as NestedFolderStructure,
              usuarioCreador,
              carpetaPadreId,
              etapaTipoId,
              'Carpeta del tipo de etapa' // Pass description for etapa tipo folders
            );
            carpetasCreadas.push(...nestedCarpetas);
          } else {
            // Handle flat structure: { "folder1": {...}, "folder2": {...} }
            for (const [folderName, folderData] of Object.entries(carpetasIniciales)) {
              if (typeof folderName === 'string') {
                const folderPath = `${projectFolderPath}/${folderName}`;
                
                const carpeta = await this.createCarpeta({
                  nombre: folderName,
                  descripcion: `Carpeta del tipo de etapa`,
                  proyecto_id: projectId,
                  carpeta_padre_id: carpetaPadreId,
                  etapa_tipo_id: etapaTipoId,
                  s3_path: folderPath,
                  usuario_creador: usuarioCreador,
                  orden_visualizacion: orden++
                });

                carpetasCreadas.push(carpeta);
              }
            }
          }
        }
      }

      console.log(`Created ${carpetasCreadas.length} etapa tipo folder DB records`);
      return carpetasCreadas;
    } catch (error) {
      console.error('Error creating etapa tipo folders DB records:', error);
      throw error;
    }
  }

  /**
   * Recursively creates nested folder structure database records
   */
  static async createNestedFolderStructureDB(
    projectId: number,
    basePath: string,
    folderStructure: NestedFolderStructure,
    usuarioCreador: number,
    carpetaPadreId?: number,
    etapaTipoId?: number,
    descripcion?: string,
    carpetaTransversalId?: number
  ): Promise<any[]> {
    const carpetasCreadas = [];
    let orden = 1;

    for (const [folderName, subStructure] of Object.entries(folderStructure)) {
      const folderPath = `${basePath}/${folderName}`;
      
      // Create the current folder record
      const carpeta = await this.createCarpeta({
        nombre: folderName,
        descripcion: descripcion || `Carpeta inicial del proyecto`,
        proyecto_id: projectId,
        carpeta_padre_id: carpetaPadreId,
        etapa_tipo_id: etapaTipoId,
        carpeta_transversal_id: carpetaTransversalId,
        s3_path: folderPath,
        usuario_creador: usuarioCreador,
        orden_visualizacion: orden++
      });

      carpetasCreadas.push(carpeta);
      
      // If subStructure is not empty, recursively create subfolder records
      if (typeof subStructure === 'object' && subStructure !== null && Object.keys(subStructure).length > 0) {
        const subCarpetas = await this.createNestedFolderStructureDB(
          projectId,
          folderPath,
          subStructure as NestedFolderStructure,
          usuarioCreador,
          carpeta.id,
          etapaTipoId,
          descripcion, // Pass the same description to subfolders
          carpetaTransversalId // Pass the same carpeta_transversal_id to subfolders
        );
        carpetasCreadas.push(...subCarpetas);
      }
    }

    return carpetasCreadas;
  }

  /**
   * Gets all folders for a project
   */
  static async getProjectFolders(projectId: number) {
    try {
      const carpetas = await prisma.carpetas.findMany({
        where: {
          proyecto_id: projectId,
          activa: true
        } as any,
        include: {
          carpetas_hijas: {
            where: { activa: true } as any
          }
        },
        orderBy: {
          orden_visualizacion: 'asc'
        }
      });

      return carpetas;
    } catch (error) {
      console.error('Error getting project folders:', error);
      throw error;
    }
  }
}

import { prisma } from '@/lib/prisma';

export interface CarpetaDBData {
  nombre: string;
  descripcion?: string;
  carpeta_padre_id?: number;
  proyecto_id?: number;
  concesion_id?: number;
  division_id?: number;
  departamento_id?: number;
  s3_path: string;
  s3_bucket_name?: string;
  usuario_creador: number;
  orden_visualizacion?: number;
  max_tamaño_mb?: number;
  tipos_archivo_permitidos?: string[];
  permisos_lectura?: string[];
  permisos_escritura?: string[];
}

export class CarpetaDBUtils {
  /**
   * Creates a folder record in the database
   */
  static async createCarpeta(carpetaData: CarpetaDBData) {
    try {
      const carpeta = await prisma.carpetas.create({
        data: {
          nombre: carpetaData.nombre,
          descripcion: carpetaData.descripcion,
          carpeta_padre_id: carpetaData.carpeta_padre_id,
          proyecto_id: carpetaData.proyecto_id,
          concesion_id: carpetaData.concesion_id,
          division_id: carpetaData.division_id,
          departamento_id: carpetaData.departamento_id,
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

      console.log(`Carpeta DB record created: ${carpeta.nombre} (ID: ${carpeta.id})`);
      return carpeta;
    } catch (error) {
      console.error('Error creating carpeta DB record:', error);
      throw error;
    }
  }

  /**
   * Creates the main project folder record
   */
  static async createProjectRootFolder(
    projectId: number,
    projectName: string,
    projectFolderPath: string,
    usuarioCreador: number,
    divisionId?: number,
    departamentoId?: number
  ) {
    try {
      const carpetaRaiz = await this.createCarpeta({
        nombre: projectName,
        descripcion: `Carpeta raíz del proyecto: ${projectName}`,
        proyecto_id: projectId,
        s3_path: projectFolderPath,
        usuario_creador: usuarioCreador,
        division_id: divisionId,
        departamento_id: departamentoId,
        orden_visualizacion: 0
      });

      // Update the project with the root folder ID
      await prisma.proyectos.update({
        where: { id: projectId },
        data: {
          carpeta_raiz_id: carpetaRaiz.id
        } as any
      });

      console.log(`Project root folder DB record created for project: ${projectName}`);
      return carpetaRaiz;
    } catch (error) {
      console.error('Error creating project root folder DB record:', error);
      throw error;
    }
  }

  /**
   * Creates folder records for initial folders
   */
  static async createInitialFoldersDB(
    projectId: number,
    projectFolderPath: string,
    carpetaInicial: any,
    usuarioCreador: number,
    carpetaPadreId?: number
  ) {
    try {
      const carpetasCreadas = [];

      if (carpetaInicial && carpetaInicial.carpetas && Array.isArray(carpetaInicial.carpetas)) {
        for (let i = 0; i < carpetaInicial.carpetas.length; i++) {
          const folder = carpetaInicial.carpetas[i];
          const folderPath = `${projectFolderPath}/${folder.nombre}`;
          
          const carpeta = await this.createCarpeta({
            nombre: folder.nombre,
            descripcion: `Carpeta inicial del proyecto`,
            proyecto_id: projectId,
            carpeta_padre_id: carpetaPadreId,
            s3_path: folderPath,
            usuario_creador: usuarioCreador,
            orden_visualizacion: i + 1
          });

          carpetasCreadas.push(carpeta);
        }
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
   */
  static async createEtapaTipoFoldersDB(
    projectId: number,
    projectFolderPath: string,
    etapaTipoCarpetas: any,
    usuarioCreador: number,
    carpetaPadreId?: number
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
                s3_path: folderPath,
                usuario_creador: usuarioCreador,
                orden_visualizacion: orden++
              });

              carpetasCreadas.push(carpeta);
            }
          }
        } else if (typeof carpetasIniciales === 'object') {
          // Structure: { "folder1": {...}, "folder2": {...} }
          for (const [folderName, folderData] of Object.entries(carpetasIniciales)) {
            if (typeof folderName === 'string') {
              const folderPath = `${projectFolderPath}/${folderName}`;
              
              const carpeta = await this.createCarpeta({
                nombre: folderName,
                descripcion: `Carpeta del tipo de etapa`,
                proyecto_id: projectId,
                carpeta_padre_id: carpetaPadreId,
                s3_path: folderPath,
                usuario_creador: usuarioCreador,
                orden_visualizacion: orden++
              });

              carpetasCreadas.push(carpeta);
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
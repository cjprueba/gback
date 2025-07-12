import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
  secretKey: process.env.MINIO_SECRET_KEY || 'minio123'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'gestor-files';

// Validate MinIO configuration
if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
  console.warn('MinIO environment variables not fully configured. Using default values.');
}

export interface FolderStructure {
  nombre: string;
}

export interface CarpetaInicial {
  carpetas: FolderStructure[];
}

export interface EtapaTipoCarpetas {
  carpetas_iniciales: any; // JSON field from etapas_tipo table
}

export class MinIOUtils {
  /**
   * Ensures the bucket exists, creates it if it doesn't
   */
  static async ensureBucketExists(): Promise<void> {
    try {
      const exists = await minioClient.bucketExists(BUCKET_NAME);
      if (!exists) {
        await minioClient.makeBucket(BUCKET_NAME);
        console.log(`Bucket '${BUCKET_NAME}' created successfully`);
      }
    } catch (error) {
      console.error(`Error ensuring bucket exists: ${error}`);
      throw error;
    }
  }

  /**
   * Creates a folder in MinIO (by creating an empty object with trailing slash)
   */
  static async createFolder(folderPath: string): Promise<void> {
    try {
      // Ensure the path ends with a slash to indicate it's a folder
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Create an empty object with trailing slash to represent a folder
      await minioClient.putObject(BUCKET_NAME, normalizedPath, Buffer.from(''));
      
      console.log(`Folder created successfully: ${normalizedPath}`);
    } catch (error) {
      console.error(`Error creating folder ${folderPath}:`, error);
      throw new Error(`Failed to create folder: ${folderPath}`);
    }
  }

  /**
   * Creates a project folder structure
   */
  static async createProjectFolder(projectName: string, projectId: number): Promise<string> {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists();
      
      // Create a sanitized project name for the folder
      const sanitizedName = projectName
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase();
      
      const projectFolderPath = `proyectos/${sanitizedName}_${projectId}`;
      
      // Create the main project folder
      await this.createFolder(projectFolderPath);
      
      console.log(`Project folder created: ${projectFolderPath}`);
      return projectFolderPath;
    } catch (error) {
      console.error('Error creating project folder:', error);
      throw error;
    }
  }

  /**
   * Creates initial folders based on the carpeta_inicial JSON structure
   */
  static async createInitialFolders(
    projectFolderPath: string, 
    carpetaInicial: CarpetaInicial
  ): Promise<void> {
    try {
      for (const folder of carpetaInicial.carpetas) {
        await this.createFolderStructure(projectFolderPath, folder);
      }
      console.log('Initial folders created successfully');
    } catch (error) {
      console.error('Error creating initial folders:', error);
      throw error;
    }
  }

  /**
   * Creates folders based on etapa_tipo carpetas_iniciales
   */
  static async createEtapaTipoFolders(
    projectFolderPath: string, 
    etapaTipoCarpetas: EtapaTipoCarpetas
  ): Promise<void> {
    try {
      const carpetasIniciales = etapaTipoCarpetas.carpetas_iniciales;
      
      if (carpetasIniciales && typeof carpetasIniciales === 'object') {
        // Handle different possible structures
        if (carpetasIniciales.carpetas && Array.isArray(carpetasIniciales.carpetas)) {
          // Structure: { carpetas: [{ nombre: "..." }] }
          for (const folder of carpetasIniciales.carpetas) {
            if (folder.nombre) {
              await this.createFolderStructure(projectFolderPath, { nombre: folder.nombre });
            }
          }
        } else if (Array.isArray(carpetasIniciales)) {
          // Structure: [{ nombre: "..." }]
          for (const folder of carpetasIniciales) {
            if (folder.nombre) {
              await this.createFolderStructure(projectFolderPath, { nombre: folder.nombre });
            }
          }
        } else if (typeof carpetasIniciales === 'object') {
          // Structure: { "folder1": {...}, "folder2": {...} }
          for (const [folderName, folderData] of Object.entries(carpetasIniciales)) {
            if (typeof folderName === 'string') {
              await this.createFolderStructure(projectFolderPath, { nombre: folderName });
            }
          }
        }
      }
      
      console.log('Etapa tipo folders created successfully');
    } catch (error) {
      console.error('Error creating etapa tipo folders:', error);
      throw error;
    }
  }

  /**
   * Recursively creates folder structure
   */
  private static async createFolderStructure(
    basePath: string, 
    folder: FolderStructure
  ): Promise<void> {
    const folderPath = `${basePath}/${folder.nombre}`;
    
    // Create the current folder
    await this.createFolder(folderPath);
  }

  /**
   * Checks if a folder exists in MinIO
   */
  static async folderExists(folderPath: string): Promise<boolean> {
    try {
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      await minioClient.statObject(BUCKET_NAME, normalizedPath);
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lists all objects in a folder
   */
  static async listFolderContents(folderPath: string): Promise<string[]> {
    try {
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      const stream = minioClient.listObjects(BUCKET_NAME, normalizedPath, true);
      const contents: string[] = [];
      
      for await (const item of stream) {
        if (item.name) {
          contents.push(item.name);
        }
      }
      
      return contents;
    } catch (error) {
      console.error(`Error listing folder contents for ${folderPath}:`, error);
      throw error;
    }
  }
}

export { minioClient, BUCKET_NAME }; 
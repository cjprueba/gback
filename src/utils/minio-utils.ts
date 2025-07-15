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

// New interface for nested folder structure
export interface NestedFolderStructure {
  [key: string]: NestedFolderStructure | {};
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
   * Now supports both flat and nested structures
   */
  static async createInitialFolders(
    projectFolderPath: string, 
    carpetaInicial: CarpetaInicial | NestedFolderStructure
  ): Promise<void> {
    try {
      // Check if it's the old flat structure
      if ('carpetas' in carpetaInicial && Array.isArray(carpetaInicial.carpetas)) {
        // Handle old flat structure
        for (const folder of carpetaInicial.carpetas) {
          await this.createFolderStructure(projectFolderPath, folder);
        }
      } else {
        // Handle new nested structure
        await this.createNestedFolderStructure(projectFolderPath, carpetaInicial as NestedFolderStructure);
      }
      console.log('Initial folders created successfully');
    } catch (error) {
      console.error('Error creating initial folders:', error);
      throw error;
    }
  }

  /**
   * Creates folders based on etapa_tipo carpetas_iniciales
   * Now supports both flat and nested structures
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
          // Check if it's a nested structure or flat structure
          const hasNestedStructure = Object.values(carpetasIniciales).some(value => 
            typeof value === 'object' && value !== null && Object.keys(value).length > 0
          );
          
          if (hasNestedStructure) {
            // Handle nested structure
            await this.createNestedFolderStructure(projectFolderPath, carpetasIniciales as NestedFolderStructure);
          } else {
            // Handle flat structure: { "folder1": {...}, "folder2": {...} }
            for (const [folderName, folderData] of Object.entries(carpetasIniciales)) {
              if (typeof folderName === 'string') {
                await this.createFolderStructure(projectFolderPath, { nombre: folderName });
              }
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
   * Recursively creates nested folder structure
   */
  private static async createNestedFolderStructure(
    basePath: string, 
    folderStructure: NestedFolderStructure
  ): Promise<void> {
    for (const [folderName, subStructure] of Object.entries(folderStructure)) {
      const folderPath = `${basePath}/${folderName}`;
      
      // Create the current folder
      await this.createFolder(folderPath);
      
      // If subStructure is not empty, recursively create subfolders
      if (typeof subStructure === 'object' && subStructure !== null && Object.keys(subStructure).length > 0) {
        await this.createNestedFolderStructure(folderPath, subStructure as NestedFolderStructure);
      }
    }
  }

  /**
   * Recursively creates folder structure (for backward compatibility)
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

  /**
   * Renames a folder in MinIO by copying all objects to the new location and removing the old ones
   */
  static async renameFolder(oldFolderPath: string, newFolderPath: string): Promise<void> {
    try {
      // Normalize paths
      const normalizedOldPath = oldFolderPath.endsWith('/') ? oldFolderPath : `${oldFolderPath}/`;
      const normalizedNewPath = newFolderPath.endsWith('/') ? newFolderPath : `${newFolderPath}/`;

      // Check if old folder exists
      const oldFolderExists = await this.folderExists(oldFolderPath);
      if (!oldFolderExists) {
        throw new Error(`Old folder does not exist: ${oldFolderPath}`);
      }

      // Check if new folder already exists
      const newFolderExists = await this.folderExists(newFolderPath);
      if (newFolderExists) {
        throw new Error(`New folder already exists: ${newFolderPath}`);
      }

      // List all objects in the old folder (including subfolders)
      const objects = await this.listFolderContents(oldFolderPath);
      
      if (objects.length === 0) {
        // If folder is empty, just create the new folder and remove the old one
        await this.createFolder(newFolderPath);
        await minioClient.removeObject(BUCKET_NAME, normalizedOldPath);
        console.log(`Empty folder renamed from ${oldFolderPath} to ${newFolderPath}`);
        return;
      }

      // Copy all objects to the new location
      for (const objectPath of objects) {
        if (objectPath.startsWith(normalizedOldPath)) {
          const relativePath = objectPath.substring(normalizedOldPath.length);
          const newObjectPath = `${normalizedNewPath}${relativePath}`;
          
          // Copy object to new location
          await minioClient.copyObject(BUCKET_NAME, newObjectPath, `${BUCKET_NAME}/${objectPath}`);
          
          // Remove object from old location
          await minioClient.removeObject(BUCKET_NAME, objectPath);
        }
      }

      // Remove the old folder marker
      try {
        await minioClient.removeObject(BUCKET_NAME, normalizedOldPath);
      } catch (error) {
        // Ignore error if folder marker doesn't exist
        console.log(`Old folder marker already removed or doesn't exist: ${normalizedOldPath}`);
      }

      console.log(`Folder renamed successfully from ${oldFolderPath} to ${newFolderPath}`);
    } catch (error) {
      console.error(`Error renaming folder from ${oldFolderPath} to ${newFolderPath}:`, error);
      throw error;
    }
  }

  /**
   * Moves a folder from one location to another in MinIO
   * This is similar to renameFolder but specifically for moving between different parent folders
   */
  static async moveFolder(oldFolderPath: string, newFolderPath: string): Promise<void> {
    try {
      // Normalize paths
      const normalizedOldPath = oldFolderPath.endsWith('/') ? oldFolderPath : `${oldFolderPath}/`;
      const normalizedNewPath = newFolderPath.endsWith('/') ? newFolderPath : `${newFolderPath}/`;

      // Check if old folder exists
      const oldFolderExists = await this.folderExists(oldFolderPath);
      if (!oldFolderExists) {
        throw new Error(`Source folder does not exist: ${oldFolderPath}`);
      }

      // Check if new folder already exists
      const newFolderExists = await this.folderExists(newFolderPath);
      if (newFolderExists) {
        throw new Error(`Destination folder already exists: ${newFolderPath}`);
      }

      // List all objects in the old folder (including subfolders)
      const objects = await this.listFolderContents(oldFolderPath);
      
      if (objects.length === 0) {
        // If folder is empty, just create the new folder and remove the old one
        await this.createFolder(newFolderPath);
        await minioClient.removeObject(BUCKET_NAME, normalizedOldPath);
        console.log(`Empty folder moved from ${oldFolderPath} to ${newFolderPath}`);
        return;
      }

      // Copy all objects to the new location
      for (const objectPath of objects) {
        if (objectPath.startsWith(normalizedOldPath)) {
          const relativePath = objectPath.substring(normalizedOldPath.length);
          const newObjectPath = `${normalizedNewPath}${relativePath}`;
          
          // Copy object to new location
          await minioClient.copyObject(BUCKET_NAME, newObjectPath, `${BUCKET_NAME}/${objectPath}`);
          
          // Remove object from old location
          await minioClient.removeObject(BUCKET_NAME, objectPath);
        }
      }

      // Remove the old folder marker
      try {
        await minioClient.removeObject(BUCKET_NAME, normalizedOldPath);
      } catch (error) {
        // Ignore error if folder marker doesn't exist
        console.log(`Old folder marker already removed or doesn't exist: ${normalizedOldPath}`);
      }

      console.log(`Folder moved successfully from ${oldFolderPath} to ${newFolderPath}`);
    } catch (error) {
      console.error(`Error moving folder from ${oldFolderPath} to ${newFolderPath}:`, error);
      throw error;
    }
  }
}

export { minioClient, BUCKET_NAME }; 